// src/core/db.ts
import Database from "better-sqlite3"

// 🔹 Initialisation de la base de données SQLite
const db = new Database("database.sqlite")

// Initialisation de la structure de la base de données
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  avatar TEXT DEFAULT 'default.png',
  google_id TEXT UNIQUE,
  two_factor_secret TEXT,
  status TEXT NOT NULL DEFAULT 'offline'
    CHECK(status IN ('online', 'playing', 'offline', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_relationships (
  user_id INTEGER NOT NULL,
  related_user_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('friend', 'blocked')),
  PRIMARY KEY (user_id, related_user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1 TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
    player2 TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
    winner  TEXT NOT NULL REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
    score1 INTEGER NOT NULL,
    score2 INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER NOT NULL
)
`)

export default db
