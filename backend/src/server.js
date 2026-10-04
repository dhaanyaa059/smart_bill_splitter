const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. Create a Bill
app.post('/api/bills', (req, res) => {
    const { name, tax, discount } = req.body;
    db.run(`INSERT INTO bills (name, tax, discount) VALUES (?, ?, ?)`, [name, tax || 0, discount || 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ bill_id: this.lastID, name, tax, discount });
    });
});

// 2. Add Person to Bill
app.post('/api/bills/:id/people', (req, res) => {
    const bill_id = req.params.id;
    const { name } = req.body;
    db.run(`INSERT INTO people (bill_id, name) VALUES (?, ?)`, [bill_id, name], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ person_id: this.lastID, name });
    });
});

// 3. Add Item & Assign to People
app.post('/api/bills/:id/items', (req, res) => {
    const bill_id = req.params.id;
    const { name, price, assigned_people } = req.body; // assigned_people is array of person IDs

    db.run(`INSERT INTO items (bill_id, name, price) VALUES (?, ?, ?)`, [bill_id, name, price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const item_id = this.lastID;

        if (assigned_people && assigned_people.length > 0) {
            const stmt = db.prepare(`INSERT INTO item_assignments (item_id, person_id) VALUES (?, ?)`);
            assigned_people.forEach(person_id => stmt.run(item_id, person_id));
            stmt.finalize();
        }
        res.json({ item_id, name, price, assigned_people });
    });
});

// 4. Get Bill Summary & Calculations
app.get('/api/bills/:id/summary', (req, res) => {
    const bill_id = req.params.id;

    db.get(`SELECT * FROM bills WHERE id = ?`, [bill_id], (err, bill) => {
        if (err || !bill) return res.status(404).json({ error: "Bill not found" });

        db.all(`SELECT * FROM people WHERE bill_id = ?`, [bill_id], (err, people) => {
            db.all(`SELECT * FROM items WHERE bill_id = ?`, [bill_id], (err, items) => {
                db.all(`SELECT * FROM item_assignments`, [], (err, assignments) => {
                    
                    let subtotal = items.reduce((sum, item) => sum + item.price, 0);
                    let personTotals = {};

                    people.forEach(p => {
                        personTotals[p.id] = { name: p.name, itemCost: 0, tax: 0, discount: 0, final: 0 };
                    });

                    // Calculate item split costs
                    items.forEach(item => {
                        const itemAssigned = assignments.filter(a => a.item_id === item.id);
                        if (itemAssigned.length > 0) {
                            const costPerPerson = item.price / itemAssigned.length;
                            itemAssigned.forEach(a => {
                                if (personTotals[a.person_id]) {
                                    personTotals[a.person_id].itemCost += costPerPerson;
                                }
                            });
                        }
                    });

                    // Proportional Tax and Discount distribution
                    Object.keys(personTotals).forEach(pid => {
                        let p = personTotals[pid];
                        let proportion = subtotal > 0 ? (p.itemCost / subtotal) : 0;
                        p.tax = proportion * (bill.tax || 0);
                        p.discount = proportion * (bill.discount || 0);
                        p.final = p.itemCost + p.tax - p.discount;
                    });

                    res.json({
                        bill_name: bill.name,
                        subtotal,
                        tax: bill.tax,
                        discount: bill.discount,
                        total: subtotal + bill.tax - bill.discount,
                        breakdown: personTotals
                    });
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});