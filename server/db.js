const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'adverts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS adverts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL,
    location TEXT,
    image TEXT,
    category_id INTEGER,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed categories
const cats = ['Real Estate', 'Vehicles', 'Electronics', 'Jobs', 'Services', 'Fashion', 'Food & Drinks', 'Other'];
const insert = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
cats.forEach(c => insert.run(c));

module.exports = db;
