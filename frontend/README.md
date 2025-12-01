# Samui Transfers Frontend

## AI Agent Context Management (Admin)

We store long-form system context for the AI agent in the database via the `ChatbotContext` model. Admins can manage this content using the following API endpoints. Authentication requires an admin session.

- GET `/api/admin/agent-context?key=ai-agent-default&locale=en&enabled=true`
	- List contexts, optionally filtered by `key`, `locale`, or `enabled`.
- POST `/api/admin/agent-context`
	- Body: `{ key: string, locale?: string = "en", content: string, title?: string, enabled?: boolean = true }`
- PUT `/api/admin/agent-context?id=<id>`
	- Body: any subset of `{ key, locale, content, title, enabled }`
- DELETE `/api/admin/agent-context?id=<id>`

Keying convention:
- Default agent key: `ai-agent-default`
- Per-agent key: `ai-agent-<agentNameLowercased>` (e.g., `ai-agent-assistant`)

The runtime AI endpoint `/api/ai-agent` will attempt to load context in this order:
1. `key=ai-agent-<agent>`, matching requested `locale` if provided
2. `key=ai-agent-<agent>`, any locale
3. `key=ai-agent-default`, any locale
4. Fallback to a light scraped context from `/about-us`

Run migrations and seed:

```
pnpm prisma:generate
pnpm dlx prisma migrate dev
pnpm prisma:seed
```

Admin UI tips:
- Visit `/admin/agent-context` to manage entries.
- Use the Filters bar to narrow by `key`, `locale`, or `enabled`.
- Use the “Duplicate” action on a row to quickly create a localized variant.

