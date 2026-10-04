const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bill_splitter.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            tax REAL DEFAULT 0,
            discount REAL DEFAULT 0
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS people (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER,
            name TEXT,
            FOREIGN KEY(bill_id) REFERENCES bills(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER,
            name TEXT,
            price REAL,
            FOREIGN KEY(bill_id) REFERENCES bills(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS item_assignments (
            item_id INTEGER,
            person_id INTEGER,
            FOREIGN KEY(item_id) REFERENCES items(id),
            FOREIGN KEY(person_id) REFERENCES people(id)
        )`);
    });
}

module.exports = db;