// Copyright 2022 Gan Tu
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// A fixed-window rate limiter keyed by uid.
//
// Requiring auth stops anonymous abuse of the metadata fetcher, but anonymous
// sign-in is one API call away — so "authenticated" is a weak identity here.
// This caps how much outbound fetching any single account can drive, which is
// what actually bounds cost and keeps GoList off other sites' abuse lists.

const RATE_LIMIT_COLLECTION = "RateLimits";

/**
 * Consumes `cost` units from the caller's window.
 * Returns { allowed, remaining, resetAt }. Fails open on infrastructure
 * errors: a limiter outage must not take the product down with it.
 */
async function consume(db, uid, action, { limit, windowMs, cost = 1 }) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const ref = db
    .collection(RATE_LIMIT_COLLECTION)
    .doc(`${action}:${uid}:${windowStart}`);

  try {
    return await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const used = snap.exists ? snap.data().used || 0 : 0;

      if (used + cost > limit) {
        return {
          allowed: false,
          remaining: Math.max(0, limit - used),
          resetAt: windowStart + windowMs
        };
      }

      tx.set(
        ref,
        {
          used: used + cost,
          // Lets a TTL policy on `expiresAt` reap these without a cron job.
          expiresAt: new Date(windowStart + windowMs * 2)
        },
        { merge: true }
      );

      return {
        allowed: true,
        remaining: limit - used - cost,
        resetAt: windowStart + windowMs
      };
    });
  } catch (err) {
    console.error(`Rate limiter unavailable, allowing request: ${err.message}`);
    return { allowed: true, remaining: limit, resetAt: windowStart + windowMs };
  }
}

module.exports = { consume, RATE_LIMIT_COLLECTION };
