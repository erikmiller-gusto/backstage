---
'@backstage/plugin-notifications-backend-module-slack': patch
---

Added scope-based message update support. When a notification is re-sent with the same `scope` and `notification.updated` is set, the processor now calls `chat.update()` on the existing Slack message instead of sending a duplicate via `chat.postMessage()`. Message timestamps are persisted using the `CacheService` by default (with 24-hour TTL auto-expiry), requiring no database setup. A new `notificationsSlackTimestampStoreExtensionPoint` allows injecting a custom `TimestampStore` implementation for alternative persistence backends.
