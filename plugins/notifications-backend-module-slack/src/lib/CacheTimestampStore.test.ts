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
import { CacheTimestampStore } from './CacheTimestampStore';

describe('CacheTimestampStore', () => {
  function createMockCache(): CacheService {
    const data = new Map<string, any>();
    const cache: CacheService = {
      get: jest.fn(async (key: string) => data.get(key)),
      set: jest.fn(async (key: string, value: any) => {
        data.set(key, value);
      }),
      delete: jest.fn(async (key: string) => {
        data.delete(key);
      }),
      withOptions: jest.fn(() => cache),
    };
    return cache;
  }

  it('should configure cache with 24h default TTL', () => {
    const cache = createMockCache();
    const store = new CacheTimestampStore(cache);

    // Verify TTL was configured during construction
    expect(cache.withOptions).toHaveBeenCalledWith({
      defaultTtl: 24 * 60 * 60 * 1000,
    });
    // Store is functional
    expect(store).toBeDefined();
  });

  it('should get a stored timestamp', async () => {
    const cache = createMockCache();
    const store = new CacheTimestampStore(cache);

    // Pre-populate
    await cache.set(
      'slack-msg-ts\0origin\0scope\0channel',
      '1234567890.123456',
    );

    const result = await store.get('origin', 'scope', 'channel');
    expect(result).toBe('1234567890.123456');
    expect(cache.get).toHaveBeenCalledWith(
      'slack-msg-ts\0origin\0scope\0channel',
    );
  });

  it('should return undefined when no timestamp is stored', async () => {
    const cache = createMockCache();
    const store = new CacheTimestampStore(cache);

    const result = await store.get('origin', 'scope', 'channel');
    expect(result).toBeUndefined();
  });

  it('should set a timestamp with the correct composite key', async () => {
    const cache = createMockCache();
    const store = new CacheTimestampStore(cache);

    await store.set('my-origin', 'my-scope', 'C12345678', '9999999999.999999');

    expect(cache.set).toHaveBeenCalledWith(
      'slack-msg-ts\0my-origin\0my-scope\0C12345678',
      '9999999999.999999',
    );
  });

  it('should use distinct keys for different origin/scope/channel combinations', async () => {
    const cache = createMockCache();
    const store = new CacheTimestampStore(cache);

    await store.set('origin-a', 'scope', 'channel', '1111111111.111111');
    await store.set('origin-b', 'scope', 'channel', '2222222222.222222');

    expect(await store.get('origin-a', 'scope', 'channel')).toBe(
      '1111111111.111111',
    );
    expect(await store.get('origin-b', 'scope', 'channel')).toBe(
      '2222222222.222222',
    );
  });
});
