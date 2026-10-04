# AuraSplit — Executive Bill Splitter & POS Studio

> **AuraSplit** is an architectural expense distribution tool designed with a luxury boutique aesthetic. It transforms tedious group calculations into a streamlined, print-ready POS invoice statement.

---

## ✨ Key Features

* **Boutique Editorial Aesthetic:** Crafted with high-fashion typography (*Playfair Display* & *Plus Jakarta Sans*) paired with a refined parchment-and-charcoal color palette.
* **Authentic POS Receipt Generation:** Automatically compiles line items, quantities, transaction types, custom order numbers, live timestamps, and line-item apportionments into an authentic invoice view.
* **Flexible Gratuity & Adjustments:** Features one-click tip preset selectors (**10%**, **20%**, **30%**) alongside custom tip inputs, taxes, and discounts.
* **Granular Stakeholder Apportionment:** Easily assign specific items and item quantities to individual stakeholders for precise cost distribution.

---

## 📁 Project Structure

```text
smart-bill-splitter/
├── backend/
│   ├── src/
│   │   ├── bill_splitter.db       # SQLite local database
│   │   ├── database.js            # Database configuration and queries
│   │   └── server.js              # Express backend server entry
│   ├── package.json               # Backend dependencies
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── index.html             # Executive application interface
│   │   ├── style.css              # Custom studio styles & receipt layout
│   │   └── app.js                 # Core splitting logic & receipt renderer
└── README.md