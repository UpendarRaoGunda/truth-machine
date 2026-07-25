# Truth Machine Ancestry Engine

Privacy-first FastAPI service for optional genome-backed Ancestral Journey reports.

## Guarantees

- raw uploads go directly from the browser to this service
- short-lived HMAC upload tokens are bound to file count and bytes
- random job IDs and separate access keys
- AES-256-GCM encrypted files and reports at rest
- decrypted workspaces live in tmpfs and are removed after completion or failure
- encrypted raw genome files are removed immediately after analysis
- results expire and users can delete them immediately
- audit logs exclude names and genome contents
- no advertising, analytics, model training, data sale or third-party sharing

## Run

```bash
cp .env.example .env
# generate key: python -c "import os,base64;print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
docker compose up --build
```

Configure the same `ANCESTRY_UPLOAD_SECRET` in Vercel and set `NEXT_PUBLIC_ANCESTRY_API_URL` to the public HTTPS engine URL.

## Analysis adapters

BCFtools is installed in the image. PLINK 2, HaploGrep 3, Y-LineageTracker and ADMIXTOOLS 2 are mounted or installed separately and exposed through reviewed command templates. Every adapter must write JSON to `{output}`. Personalized percentages remain unavailable unless a versioned reference panel and reviewed reference pipeline are configured.
