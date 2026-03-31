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
import { CacheService } from '@backstage/backend-plugin-api';
import { TimestampStore } from './types';

const CACHE_KEY_PREFIX = 'slack-msg-ts';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * A {@link TimestampStore} implementation backed by the Backstage
 * {@link @backstage/backend-plugin-api#CacheService}.
 *
 * Entries automatically expire after 24 hours via the cache TTL,
 * so no manual cleanup is required.
 *
 * @public
 */
export class CacheTimestampStore implements TimestampStore {
  private readonly cache: CacheService;

  constructor(cache: CacheService) {
    this.cache = cache.withOptions({ defaultTtl: DEFAULT_TTL_MS });
  }

  private key(origin: string, scope: string, channel: string): string {
    return [CACHE_KEY_PREFIX, origin, scope, channel].join('\0');
  }

  async get(
    origin: string,
    scope: string,
    channel: string,
  ): Promise<string | undefined> {
    return this.cache.get<string>(this.key(origin, scope, channel));
  }

  async set(
    origin: string,
    scope: string,
    channel: string,
    ts: string,
  ): Promise<void> {
    await this.cache.set(this.key(origin, scope, channel), ts);
  }
}
