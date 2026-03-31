# @backstage/plugin-notifications-backend-module-slack

The Slack backend module for the notifications plugin.

See [Built-in Processors](https://backstage.io/docs/notifications/processors/#built-in-processors) for detailed documentation

## Scope-Based Message Updates

When notifications use the `scope` field, the module stores Slack message
timestamps so that subsequent notifications with the same scope update the
existing Slack message instead of posting a duplicate.

By default, timestamps are stored using the Backstage `CacheService`
(in-memory by default, or backed by Redis/Memcache if configured via
`backend.cache.store`). Entries automatically expire after 24 hours.

### Custom Timestamp Store

You can provide a custom `TimestampStore` implementation via the
`notificationsSlackTimestampStoreExtensionPoint`. This allows you to use
any persistence backend (e.g., a database, Redis, or an external service).

```typescript
import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  notificationsSlackTimestampStoreExtensionPoint,
  TimestampStore,
} from '@backstage/plugin-notifications-backend-module-slack';

class MyCustomTimestampStore implements TimestampStore {
  async get(origin: string, scope: string, channel: string) {
    // your lookup logic
  }
  async set(origin: string, scope: string, channel: string, ts: string) {
    // your persistence logic
  }
}

export default createBackendModule({
  pluginId: 'notifications',
  moduleId: 'slack-custom-timestamp-store',
  register(reg) {
    reg.registerInit({
      deps: {
        timestampStore: notificationsSlackTimestampStoreExtensionPoint,
      },
      async init({ timestampStore }) {
        timestampStore.setTimestampStore(new MyCustomTimestampStore());
      },
    });
  },
});
```

Then register it alongside the Slack module in your backend:

```typescript
backend.add(import('@backstage/plugin-notifications-backend-module-slack'));
backend.add(import('./plugins/my-custom-timestamp-store'));
```
