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
import { createExtensionPoint } from '@backstage/backend-plugin-api';
import { NotificationPayload } from '@backstage/plugin-notifications-common';
import { KnownBlock } from '@slack/web-api';
import { TimestampStore } from './lib/types';

/**
 * @public
 */
export type SlackBlockKitRenderer = (
  payload: NotificationPayload,
) => KnownBlock[];

/**
 * @public
 *
 * Extension point for customizing how notification payloads are rendered into
 * Slack Block Kit messages before they're sent.
 */
export interface NotificationsSlackBlockKitExtensionPoint {
  setBlockKitRenderer(renderer: SlackBlockKitRenderer): void;
}

/**
 * @public
 */
export const notificationsSlackBlockKitExtensionPoint =
  createExtensionPoint<NotificationsSlackBlockKitExtensionPoint>({
    id: 'notifications.slack.blockkit',
  });

/**
 * @public
 *
 * Extension point for providing a custom persistence backend for Slack
 * message timestamps used in scope-based message updates.
 *
 * If no custom store is provided, the module defaults to using the
 * CacheTimestampStore backed by the Backstage CacheService.
 */
export interface NotificationsSlackTimestampStoreExtensionPoint {
  setTimestampStore(store: TimestampStore): void;
}

/**
 * @public
 */
export const notificationsSlackTimestampStoreExtensionPoint =
  createExtensionPoint<NotificationsSlackTimestampStoreExtensionPoint>({
    id: 'notifications.slack.timestampstore',
  });
