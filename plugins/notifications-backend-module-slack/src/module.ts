/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { metricsServiceRef } from '@backstage/backend-plugin-api/alpha';
import { notificationsProcessingExtensionPoint } from '@backstage/plugin-notifications-node';
import { SlackNotificationProcessor } from './lib/SlackNotificationProcessor';
import { CacheTimestampStore } from './lib/CacheTimestampStore';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  notificationsSlackBlockKitExtensionPoint,
  notificationsSlackTimestampStoreExtensionPoint,
  SlackBlockKitRenderer,
} from './extensions';
import { TimestampStore } from './lib/types';

/**
 * The Slack notification processor for use with the notifications plugin.
 * This allows sending of notifications via Slack DMs or to channels.
 *
 * @public
 */
export const notificationsModuleSlack = createBackendModule({
  pluginId: 'notifications',
  moduleId: 'slack',
  register(reg) {
    let blockKitRenderer: SlackBlockKitRenderer | undefined;
    reg.registerExtensionPoint(notificationsSlackBlockKitExtensionPoint, {
      setBlockKitRenderer(renderer) {
        if (blockKitRenderer) {
          throw new Error(`Slack block kit renderer was already registered`);
        }
        blockKitRenderer = renderer;
      },
    });

    let customTimestampStore: TimestampStore | undefined;
    reg.registerExtensionPoint(notificationsSlackTimestampStoreExtensionPoint, {
      setTimestampStore(store) {
        if (customTimestampStore) {
          throw new Error(`Slack timestamp store was already registered`);
        }
        customTimestampStore = store;
      },
    });

    reg.registerInit({
      deps: {
        auth: coreServices.auth,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        catalog: catalogServiceRef,
        notifications: notificationsProcessingExtensionPoint,
        metrics: metricsServiceRef,
        cache: coreServices.cache,
      },
      async init({
        auth,
        config,
        logger,
        catalog,
        notifications,
        metrics,
        cache,
      }) {
        const processors = SlackNotificationProcessor.fromConfig(config, {
          auth,
          logger,
          catalog,
          metrics,
          blockKitRenderer,
        });

        if (processors.length === 0) {
          return;
        }

        const timestampStore =
          customTimestampStore ?? new CacheTimestampStore(cache);

        for (const processor of processors) {
          processor.setTimestampStore(timestampStore);
        }

        notifications.addProcessor(processors);
      },
    });
  },
});
