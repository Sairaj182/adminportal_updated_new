## 1. Applying DB migrations: 

- Given migration: abc.sql

```bash
Get-Content -Raw .\migrations\2026-11-17-03-phd-seminar-other-supervisor-email.sql | mysql -h localhost -P 3306 -u root -p shadow_nitp
```

this applies the migration to your Database (wiz. shadow_nitp)

## 2. Exposing a cloudflare tunnel

- cloudflared tunnel --url http://localhost:3000