import { DEFAULT_SETTINGS, sanitizeColor } from "./utils.js";
import { SCHEMA_SQL } from "./schema.js";

let schemaReady = false;

export async function ensureSchema(db) {
  if (schemaReady) return;
  try {
    const row = await db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'")
      .first();
    if (row) {
      schemaReady = true;
      return;
    }
  } catch {
    /* create below */
  }
  if (typeof db.exec === "function") {
    await db.exec(SCHEMA_SQL);
  }
  schemaReady = true;
}

export async function getSettings(db) {
  const settings = { ...DEFAULT_SETTINGS };
  try {
    const { results } = await db.prepare("SELECT key, value FROM settings").all();
    for (const row of results || []) {
      settings[row.key] = row.value ?? "";
    }
  } catch {
    /* unmigrated */
  }
  settings.primary_color = sanitizeColor(settings.primary_color, DEFAULT_SETTINGS.primary_color);
  settings.secondary_color = sanitizeColor(
    settings.secondary_color,
    DEFAULT_SETTINGS.secondary_color,
  );
  return settings;
}

export async function setSetting(db, key, value) {
  await db
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(key, value ?? "")
    .run();
}

export async function listPlatforms(db) {
  const { results } = await db
    .prepare(
      "SELECT id, name, review_url, deep_link, web_fallback, icon, enabled, is_primary, sort_order, created_at, updated_at FROM platforms ORDER BY is_primary DESC, sort_order ASC, created_at ASC",
    )
    .all();
  return results || [];
}

export async function getPlatform(db, id) {
  return db
    .prepare(
      "SELECT id, name, review_url, deep_link, web_fallback, icon, enabled, is_primary, sort_order, created_at, updated_at FROM platforms WHERE id = ?",
    )
    .bind(id)
    .first();
}

export async function getPrimaryPlatform(db) {
  const primary = await db
    .prepare(
      "SELECT id, name, review_url, deep_link, web_fallback, icon, enabled, is_primary FROM platforms WHERE is_primary = 1 AND enabled = 1 LIMIT 1",
    )
    .first();
  if (primary) return primary;
  return db
    .prepare(
      "SELECT id, name, review_url, deep_link, web_fallback, icon, enabled, is_primary FROM platforms WHERE enabled = 1 ORDER BY sort_order ASC, created_at ASC LIMIT 1",
    )
    .first();
}

export async function savePlatform(db, platform) {
  const existing = platform.id ? await getPlatform(db, platform.id) : null;
  const id = existing?.id || platform.id;

  const statements = [];
  if (platform.is_primary) {
    statements.push(db.prepare("UPDATE platforms SET is_primary = 0"));
  }

  if (existing) {
    statements.push(
      db
        .prepare(
          `UPDATE platforms SET
            name = ?, review_url = ?, deep_link = ?, web_fallback = ?,
            icon = ?, enabled = ?, is_primary = ?, updated_at = datetime('now')
          WHERE id = ?`,
        )
        .bind(
          platform.name,
          platform.review_url,
          platform.deep_link || "",
          platform.web_fallback || "",
          platform.icon,
          platform.enabled ? 1 : 0,
          platform.is_primary ? 1 : 0,
          id,
        ),
    );
  } else {
    statements.push(
      db
        .prepare(
          `INSERT INTO platforms (
            id, name, review_url, deep_link, web_fallback, icon, enabled, is_primary, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          platform.name,
          platform.review_url,
          platform.deep_link || "",
          platform.web_fallback || "",
          platform.icon || "",
          platform.enabled ? 1 : 0,
          platform.is_primary ? 1 : 0,
          Date.now() % 100000,
        ),
    );
  }

  await db.batch(statements);
  return id;
}

export async function deletePlatform(db, id) {
  await db.prepare("DELETE FROM platforms WHERE id = ?").bind(id).run();
}

export async function setPrimaryPlatform(db, id) {
  const platform = await getPlatform(db, id);
  if (!platform) return false;
  await db.batch([
    db.prepare("UPDATE platforms SET is_primary = 0"),
    db
      .prepare(
        "UPDATE platforms SET is_primary = 1, enabled = 1, updated_at = datetime('now') WHERE id = ?",
      )
      .bind(id),
  ]);
  return true;
}

export async function setPlatformEnabled(db, id, enabled) {
  await db
    .prepare("UPDATE platforms SET enabled = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(enabled ? 1 : 0, id)
    .run();
}

export async function logEvent(db, { type, rating = null, branch = null, platform_id = null }) {
  await db
    .prepare(
      "INSERT INTO events (type, rating, branch, platform_id) VALUES (?, ?, ?, ?)",
    )
    .bind(type, rating, branch || null, platform_id || null)
    .run();
}

export async function insertFeedback(db, { rating, comment, name, phone, branch }) {
  await db
    .prepare(
      "INSERT INTO feedback (rating, comment, name, phone, branch) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(rating, comment, name || "", phone || "", branch || null)
    .run();
}

export async function listFeedback(db, limit = 100) {
  const { results } = await db
    .prepare(
      "SELECT id, rating, comment, name, phone, branch, created_at FROM feedback ORDER BY created_at DESC LIMIT ?",
    )
    .bind(limit)
    .all();
  return results || [];
}

export async function getDashboardStats(db) {
  const empty = {
    visits: 0,
    ratings: 0,
    rating1: 0,
    rating2: 0,
    rating3: 0,
    rating4: 0,
    rating5: 0,
    redirects: 0,
    feedback: 0,
  };

  const totals = await db
    .prepare(
      `SELECT
        SUM(CASE WHEN type = 'page_opened' THEN 1 ELSE 0 END) AS visits,
        SUM(CASE WHEN type = 'rating_selected' THEN 1 ELSE 0 END) AS ratings,
        SUM(CASE WHEN type = 'review_redirect' THEN 1 ELSE 0 END) AS redirects
      FROM events`,
    )
    .first();

  const distribution = await db
    .prepare(
      "SELECT rating, COUNT(*) AS c FROM events WHERE type = 'rating_selected' AND rating BETWEEN 1 AND 5 GROUP BY rating",
    )
    .all();

  const feedback = await db.prepare("SELECT COUNT(*) AS c FROM feedback").first();

  const stats = {
    ...empty,
    visits: Number(totals?.visits || 0),
    ratings: Number(totals?.ratings || 0),
    redirects: Number(totals?.redirects || 0),
    feedback: Number(feedback?.c || 0),
  };

  for (const row of distribution.results || []) {
    if (row.rating >= 1 && row.rating <= 5) {
      stats[`rating${row.rating}`] = Number(row.c || 0);
    }
  }

  return stats;
}

export async function rateLimit(db, key, limit, windowSec) {
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare("SELECT count, reset_at FROM rate_limits WHERE id = ?")
    .bind(key)
    .first();

  if (!row || row.reset_at < now) {
    await db
      .prepare("INSERT OR REPLACE INTO rate_limits (id, count, reset_at) VALUES (?, 1, ?)")
      .bind(key, now + windowSec)
      .run();
    return { ok: true };
  }

  if (row.count >= limit) return { ok: false };

  await db
    .prepare("UPDATE rate_limits SET count = count + 1 WHERE id = ?")
    .bind(key)
    .run();
  return { ok: true };
}
