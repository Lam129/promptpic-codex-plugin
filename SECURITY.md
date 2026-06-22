# Security Notes

This repository is designed to be public.

It must not contain:

- PromptPic backend source code
- Database URLs or credentials
- API keys
- R2, Neon, Stripe, OpenAI, or provider secrets
- User data
- Private deployment configuration

Authentication is handled by the PromptPic web app. This plugin does not store PromptPic session cookies or account credentials.

If a secret is accidentally committed, rotate it immediately in the relevant provider dashboard.
