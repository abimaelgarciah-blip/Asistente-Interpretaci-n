import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "studies.db");
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS studies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        user_name TEXT,
        findings TEXT NOT NULL,
        analysis TEXT NOT NULL,
        cache_hit INTEGER DEFAULT 0,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cache_read_tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}
