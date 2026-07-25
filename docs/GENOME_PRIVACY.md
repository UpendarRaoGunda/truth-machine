# Genome Privacy Standard

Genome data is uniquely identifying and potentially informative about relatives. Truth Machine therefore applies stricter controls than ordinary profile data.

- explicit ownership/permission, probabilistic-results and processing consent
- verified guardian consent for minors
- direct browser-to-engine upload using a ten-minute HMAC token
- random job ID plus a separate high-entropy access key
- AES-256-GCM encryption at rest
- tmpfs-only decrypted workspace
- automatic deletion of raw and decrypted files after completion or failure
- configurable result expiry, default 24 hours
- immediate user deletion endpoint
- no advertising, analytics, training, sale or third-party sharing
- audit logs without names, genome contents or access keys

Production operators must provide a clear privacy notice, incident process, access controls, key rotation, backups policy, retention verification and compliance review for every jurisdiction served.
