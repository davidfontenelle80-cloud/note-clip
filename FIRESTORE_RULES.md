# Note Clip Firestore Rules

Note Clip stores each account's manual cloud backup at:

```text
noteClipUsers/{uid}/backups/current
```

The app must only read and write the authenticated user's own `current` backup document. Deploy these Firestore rules before releasing cloud backup:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /noteClipUsers/{userId}/backups/{backupId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId
        && backupId == "current";
    }
  }
}
```

Validation checklist:

- Account A can write `noteClipUsers/{accountAUid}/backups/current`.
- Account A can read `noteClipUsers/{accountAUid}/backups/current`.
- Account B cannot read or write Account A's backup.
- Account B can write `noteClipUsers/{accountBUid}/backups/current`.
- Account B can read `noteClipUsers/{accountBUid}/backups/current`.
- Account A cannot read or write Account B's backup.

Do not add broad collection rules for `noteClipUsers`, and do not allow access to any backup document where `backupId` is not `current`.
