const DEFAULT_TTL = 60 * 60 * 24;
const MAX_DUE_PER_RUN = 100;

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDueReminders(env));
  },
};

async function handleRequest(request, env) {
  const cors = corsHeaders(request, env);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const url = new URL(request.url);

  try {
    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      requireSecret(request, env);
      const result = await subscribe(request, env);
      return json(result, cors);
    }

    if (url.pathname === '/api/reminders' && request.method === 'POST') {
      requireSecret(request, env);
      const result = await upsertReminder(request, env);
      return json(result, cors);
    }

    const match = url.pathname.match(/^\/api\/reminders\/([^/]+)\/([^/]+)$/);
    if (match && request.method === 'DELETE') {
      requireSecret(request, env);
      const sourceType = decodeURIComponent(match[1]);
      const sourceId = decodeURIComponent(match[2]);
      const subscriptionId = url.searchParams.get('subscriptionId') || '';
      const result = await deleteReminder(env, sourceType, sourceId, subscriptionId);
      return json(result, cors);
    }

    return json({ ok: false, error: 'Not found' }, cors, 404);
  } catch (err) {
    const status = err.status || 500;
    return json({ ok: false, error: status === 500 ? 'Internal error' : err.message }, cors, status);
  }
}

function corsHeaders(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || 'https://davidfontenelle80-cloud.github.io';
  const origin = request.headers.get('Origin') || '';
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? allowedOrigin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Push-Secret',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, headers, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

function requireSecret(request, env) {
  const expected = env.PUSH_SECRET;
  const actual = request.headers.get('X-Push-Secret') || '';
  if (!expected || actual !== expected) {
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
}

async function subscribe(request, env) {
  const body = await request.json();
  const endpoint = String(body.endpoint || '').trim();
  const p256dh = String(body.keys?.p256dh || '').trim();
  const auth = String(body.keys?.auth || '').trim();

  if (!endpoint || !p256dh || !auth) {
    const err = new Error('Missing subscription fields');
    err.status = 400;
    throw err;
  }

  const existing = await env.DB.prepare('SELECT id FROM subscriptions WHERE endpoint = ?')
    .bind(endpoint)
    .first();
  const id = existing?.id || crypto.randomUUID();
  const now = unixNow();

  await env.DB.prepare(`
    INSERT INTO subscriptions (id, endpoint, p256dh, auth, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET
      p256dh = excluded.p256dh,
      auth = excluded.auth
  `).bind(id, endpoint, p256dh, auth, now).run();

  return { subscriptionId: id };
}

async function upsertReminder(request, env) {
  const body = await request.json();
  const subscriptionId = String(body.subscriptionId || '').trim();
  const title = String(body.title || '').trim();
  const reminderBody = String(body.body || '');
  const fireAt = Number(body.fireAt);
  const sourceType = String(body.sourceType || '').trim();
  const sourceId = String(body.sourceId || '').trim();

  if (!subscriptionId || !title || !Number.isFinite(fireAt) || !sourceType || !sourceId) {
    const err = new Error('Missing reminder fields');
    err.status = 400;
    throw err;
  }

  const subscription = await env.DB.prepare('SELECT id FROM subscriptions WHERE id = ?')
    .bind(subscriptionId)
    .first();
  if (!subscription) {
    const err = new Error('Subscription not found');
    err.status = 404;
    throw err;
  }

  const id = crypto.randomUUID();
  const now = unixNow();

  await env.DB.prepare(`
    INSERT INTO reminders (id, subscription_id, title, body, fire_at, fired, source_type, source_id, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
    ON CONFLICT(subscription_id, source_type, source_id) DO UPDATE SET
      title = excluded.title,
      body = excluded.body,
      fire_at = excluded.fire_at,
      fired = 0
  `).bind(id, subscriptionId, title, reminderBody, Math.floor(fireAt), sourceType, sourceId, now).run();

  return { ok: true };
}

async function deleteReminder(env, sourceType, sourceId, subscriptionId) {
  if (subscriptionId) {
    await env.DB.prepare('DELETE FROM reminders WHERE subscription_id = ? AND source_type = ? AND source_id = ?')
      .bind(subscriptionId, sourceType, sourceId)
      .run();
  } else {
    await env.DB.prepare('DELETE FROM reminders WHERE source_type = ? AND source_id = ?')
      .bind(sourceType, sourceId)
      .run();
  }
  return { ok: true };
}

async function sendDueReminders(env) {
  const due = await env.DB.prepare(`
    SELECT * FROM reminders
    WHERE fired = 0 AND fire_at <= unixepoch('now')
    ORDER BY fire_at ASC
    LIMIT ?
  `).bind(MAX_DUE_PER_RUN).all();

  for (const reminder of due.results || []) {
    const subscription = await env.DB.prepare('SELECT * FROM subscriptions WHERE id = ?')
      .bind(reminder.subscription_id)
      .first();

    if (!subscription) {
      await env.DB.prepare('DELETE FROM reminders WHERE id = ?').bind(reminder.id).run();
      continue;
    }

    const payload = JSON.stringify({
      title: reminder.title,
      body: reminder.body || '',
      tag: `${reminder.source_type}-${reminder.source_id}`,
    });

    const response = await sendWebPush(subscription, payload, env);
    if (response.status === 404 || response.status === 410) {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM reminders WHERE subscription_id = ?').bind(subscription.id),
        env.DB.prepare('DELETE FROM subscriptions WHERE id = ?').bind(subscription.id),
      ]);
      continue;
    }

    if (response.ok) {
      await env.DB.prepare('UPDATE reminders SET fired = 1 WHERE id = ?').bind(reminder.id).run();
    }
  }
}

async function sendWebPush(subscription, payload, env) {
  const audience = new URL(subscription.endpoint).origin;
  const jwt = await createVapidJwt(audience, env);
  const encrypted = await encryptPayload(payload, subscription.p256dh, subscription.auth);

  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      TTL: String(DEFAULT_TTL),
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
    },
    body: encrypted,
  });
}

async function createVapidJwt(audience, env) {
  const header = b64urlJson({ typ: 'JWT', alg: 'ES256' });
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const payload = b64urlJson({
    aud: audience,
    exp,
    sub: env.VAPID_SUBJECT,
  });
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'jwk',
    privateKeyToJwk(env.VAPID_PRIVATE_KEY, env.VAPID_PUBLIC_KEY),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${b64url(new Uint8Array(signature))}`;
}

async function encryptPayload(payload, userPublicKey, userAuth) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const localKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const localPublicKey = new Uint8Array(await crypto.subtle.exportKey('raw', localKeys.publicKey));
  const remotePublicKey = await crypto.subtle.importKey(
    'raw',
    b64urlToBytes(userPublicKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: remotePublicKey },
    localKeys.privateKey,
    256,
  ));

  const authSecret = b64urlToBytes(userAuth);
  const prkKey = await hmacKey(authSecret);
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, sharedSecret));
  const keyInfo = concat(
    new TextEncoder().encode('WebPush: info\0'),
    b64urlToBytes(userPublicKey),
    localPublicKey,
  );
  const ikm = await hkdfExpand(prk, keyInfo, 32);
  const contentPrkKey = await hmacKey(salt);
  const contentPrk = new Uint8Array(await crypto.subtle.sign('HMAC', contentPrkKey, ikm));
  const cek = await hkdfExpand(contentPrk, new TextEncoder().encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdfExpand(contentPrk, new TextEncoder().encode('Content-Encoding: nonce\0'), 12);
  const plaintext = concat(new TextEncoder().encode(payload), new Uint8Array([2]));
  const cryptoKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cryptoKey, plaintext));

  const rs = new Uint8Array([0, 0, 16, 0]);
  const keyLength = new Uint8Array([localPublicKey.length]);
  return concat(salt, rs, keyLength, localPublicKey, ciphertext);
}

async function hmacKey(keyBytes) {
  return crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function hkdfExpand(prk, info, length) {
  const key = await hmacKey(prk);
  const counter = new Uint8Array([1]);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, concat(info, counter)));
  return digest.slice(0, length);
}

function privateKeyToJwk(privateKey, publicKey) {
  const d = String(privateKey || '').trim();
  if (!d) throw new Error('VAPID_PRIVATE_KEY is not configured');
  if (d.startsWith('{')) return JSON.parse(d);

  const rawPublic = b64urlToBytes(publicKey);
  if (rawPublic.length !== 65 || rawPublic[0] !== 4) {
    throw new Error('VAPID_PUBLIC_KEY must be an uncompressed P-256 public key');
  }

  return {
    kty: 'EC',
    crv: 'P-256',
    d,
    x: b64url(rawPublic.slice(1, 33)),
    y: b64url(rawPublic.slice(33, 65)),
    ext: true,
  };
}

function b64urlJson(value) {
  return b64url(new TextEncoder().encode(JSON.stringify(value)));
}

function b64url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64urlToBytes(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

function concat(...arrays) {
  const length = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}
