# Note Clip Push Worker

Cloudflare Worker + D1 backend for Note Clip background reminder notifications.

This backend is separate from Firebase. Firebase remains only for optional cloud backup/restore.

## Secrets

Do not commit real secret values.

Required Worker secrets:

- `VAPID_PRIVATE_KEY` (base64url P-256 private `d` value, or a full JSON JWK)
- `PUSH_SECRET`

Required vars in `wrangler.toml`:

- `ALLOWED_ORIGIN`
- `VAPID_SUBJECT`
- `VAPID_PUBLIC_KEY`

## D1

Apply `migrations/0001_schema.sql` to the `note-clip-reminders` D1 database.

Replace the `database_id` placeholder in `wrangler.toml` with the D1 database id before deploying.

## API

- `POST /api/subscribe`
- `POST /api/reminders`
- `DELETE /api/reminders/:sourceType/:sourceId`
- Cron trigger: every minute

Writes require the `X-Push-Secret` header. This is an abuse filter only because the client JS is public.

## Deployment Notes

Before deploying over the live Worker, compare the existing live endpoint behavior:

- CORS origin must remain `https://davidfontenelle80-cloud.github.io`
- Preflight should allow `GET,POST,DELETE,OPTIONS`
- Preflight should allow `Content-Type,X-Push-Secret`
- Client public key in `js/push.js` must match `VAPID_PUBLIC_KEY`

Never deploy this Worker with placeholder values.
