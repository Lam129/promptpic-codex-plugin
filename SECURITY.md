# Security Notes

This repository is designed to be public.

It must not contain:

- PromptPic backend source code
- Database URLs or credentials
- API keys
- R2, Neon, Stripe, OpenAI, or provider secrets
- User data
- Private deployment configuration

Authentication is handled by the PromptPic web app and a scoped PromptPic Codex token.
This plugin does not store PromptPic session cookies, account passwords, database URLs, R2 credentials, or provider secrets.

Configure only:

```text
PROMPTPIC_CODEX_TOKEN=ppc_codex_xxx
```

Do not commit real tokens. Use local Codex/plugin secret configuration instead.

If a secret is accidentally committed, rotate it immediately in the relevant provider dashboard.
