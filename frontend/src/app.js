let currentBill = {
    name: '',
    orderNo: '',
    diningType: 'Dine-In Table',
    transactionType: 'Cash',
    startDate: '',
    date: '',
    tax: 0,
    discount: 0,
    tip: 0,
    people: [],
    items: [],
    payerIds: []
};

function formatTimestamp(d) {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function showError(message) {
    const banner = document.getElementById('status-banner');
    banner.innerText = message;
    banner.className = 'banner error';
    setTimeout(() => { banner.className = 'banner hidden'; }, 4000);
}

function showSuccessToast(message) {
    let toast = document.getElementById('fun-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'fun-toast';
        toast.className = 'fun-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

function toggleSelectAll(masterCheckbox) {
    document.querySelectorAll('.person-checkbox').forEach(cb => {
        cb.checked = masterCheckbox.checked;
        const qtyInput = document.querySelector('.person-qty[data-person-id="' + cb.value + '"]');
        if (qtyInput) {
            qtyInput.disabled = !cb.checked;
            if (cb.checked && (!qtyInput.value || qtyInput.value === '0')) qtyInput.value = '1';
        }
    });
}

function onPersonCheckChange(cb) {
    const qtyInput = document.querySelector('.person-qty[data-person-id="' + cb.value + '"]');
    if (qtyInput) {
        qtyInput.disabled = !cb.checked;
        if (cb.checked && (!qtyInput.value || qtyInput.value === '0')) qtyInput.value = '1';
    }
}

function setTipPercentage(percentage) {
    document.querySelectorAll('.btn-tip').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentBill.tipPercentage = percentage;
    let subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
    if (subtotal > 0 && percentage > 0) {
        let calculatedTip = (subtotal * percentage) / 100;
        document.getElementById('bill-tip').value = calculatedTip.toFixed(2);
        currentBill.tip = calculatedTip;
    } else if (percentage === 0) {
        document.getElementById('bill-tip').value = '';
        currentBill.tip = 0;
    }
}

function getFoodPixel(name) {
    const n = (name || '').toLowerCase();
    if (/pizza|pie/.test(n)) return '🍕';
    if (/burger|fries|sandwich/.test(n)) return '🍔';
    if (/ramen|noodle|pho|udon|pasta|spaghetti/.test(n)) return '🍜';
    if (/sushi|sashimi|maki|roll/.test(n)) return '🍣';
    if (/coke|cola|soda|drink|juice|lemonade|sprite|pepsi|mocktail/.test(n)) return '🥤';
    if (/coffee|latte|espresso|cappuccino|mocha/.test(n)) return '☕';
    if (/tea|chai|matcha/.test(n)) return '🍵';
    if (/cake|dessert|ice.?cream|brownie|cookie|pastry|donut|waffle/.test(n)) return '🍰';
    if (/taco|burrito|nacho/.test(n)) return '🌮';
    if (/chicken|wings|nugget/.test(n)) return '🍗';
    if (/rice|biryani|fried.?rice/.test(n)) return '🍚';
    if (/salad|veggie|vegetable/.test(n)) return '🥗';
    if (/soup|stew/.test(n)) return '🥣';
    if (/beer|wine|alcohol|cocktail/.test(n)) return '🍹';
    if (/bbq|grill|steak|meat/.test(n)) return '🥩';
    if (/fries|chips|potato/.test(n)) return '🍟';
    if (/egg|omelette|breakfast/.test(n)) return '🍳';
    if (/bread|toast|bun/.test(n)) return '🍞';
    if (/fruit|apple|banana|mango/.test(n)) return '🍎';
    return '🍽️';
}

function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.add('active');
    const colors = ['#3b5bdb', '#0ca678', '#fa5252', '#fcc419', '#f06595', '#845ef7', '#ff922b'];
    const emojis = ['🍕', '🍔', '🍜', '🥤', '🍰', '✨', '💖', '🎉', '⭐'];
    const pieces = [];
    for (let i = 0; i < 80; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 80,
            w: 6 + Math.random() * 8,
            h: 8 + Math.random() * 10,
            color: colors[Math.floor(Math.random() * colors.length)],
            emoji: Math.random() > 0.55 ? emojis[Math.floor(Math.random() * emojis.length)] : null,
            speedY: 6 + Math.random() * 8,
            speedX: -3 + Math.random() * 6,
            rot: Math.random() * 360,
            rotSpeed: -10 + Math.random() * 20,
            opacity: 1
        });
    }
    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;
        let alive = false;
        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rot += p.rotSpeed;
            if (frame > 45) p.opacity -= 0.035;
            if (p.opacity <= 0) return;
            alive = true;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            if (p.emoji) {
                ctx.font = '18px serif';
                ctx.fillText(p.emoji, -9, 6);
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }
            ctx.restore();
        });
        if (alive) requestAnimationFrame(draw);
        else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.classList.remove('active');
        }
    }
    draw();
}

function loadOrderHistory() {
    try {
        return JSON.parse(localStorage.getItem('dhaanyaaOrderHistory') || '[]');
    } catch (e) {
        return [];
    }
}

function saveBillToHistory(snapshot) {
    const history = loadOrderHistory();
    history.unshift(snapshot);
    localStorage.setItem('dhaanyaaOrderHistory', JSON.stringify(history.slice(0, 30)));
    renderOrderHistory();
}

function renderOrderHistory() {
    const list = document.getElementById('order-history-list');
    if (!list) return;
    const history = loadOrderHistory();
    if (history.length === 0) {
        list.innerHTML = '<p class="history-empty">No previous splits yet — finish a bill to see it here.</p>';
        return;
    }
    list.innerHTML = history.map((h) => `
        <div class="history-item">
            <div class="history-item-top">
                <strong>${h.name}</strong>
                <span class="history-date">${h.date}</span>
            </div>
            <div class="history-item-meta">
                ${h.diningType || ''} · ${h.transactionType || ''} · <b>₹${Number(h.grandTotal).toFixed(2)}</b>
            </div>
            <div class="history-item-people">${(h.peopleNames || []).join(', ')}</div>
        </div>
    `).join('');
}

function clearOrderHistory() {
    localStorage.removeItem('dhaanyaaOrderHistory');
    renderOrderHistory();
}

function updatePayerUI() {
    const box = document.getElementById('payer-checkboxes');
    if (!box) return;
    box.innerHTML = '';
    currentBill.people.forEach(p => {
        box.innerHTML += `
            <label class="payer-label">
                <input type="checkbox" class="payer-checkbox" value="${p.person_id}">
                ${p.name}
            </label>
        `;
    });
}

function getSelectedPayerIds() {
    return Array.from(document.querySelectorAll('.payer-checkbox:checked')).map(cb => parseInt(cb.value, 10));
}

function createBill(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('bill-name').value.trim();
    const orderNo = document.getElementById('bill-order-no').value.trim() || '000' + Math.floor(100000 + Math.random() * 900000);
    const diningType = document.getElementById('bill-dining-type').value;
    const transactionType = document.getElementById('bill-transaction-type').value;
    const tax = parseFloat(document.getElementById('bill-tax').value) || 0;
    const discount = parseFloat(document.getElementById('bill-discount').value) || 0;
    const tip = parseFloat(document.getElementById('bill-tip').value) || 0;

    if (!name) {
        showError('🌸 Please enter a restaurant or event name!');
        return;
    }

    currentBill.name = name;
    currentBill.orderNo = orderNo;
    currentBill.diningType = diningType;
    currentBill.transactionType = transactionType;
    currentBill.startDate = formatTimestamp(new Date());
    currentBill.tax = tax;
    currentBill.discount = discount;
    currentBill.tip = tip;
    currentBill.people = [];
    currentBill.items = [];

    document.getElementById('current-bill-title').innerText = name;
    document.getElementById('people-list').innerHTML = '';
    document.getElementById('items-list').innerHTML = '';
    document.getElementById('item-assignments-checkboxes').innerHTML = '';
    document.getElementById('payer-checkboxes').innerHTML = '';

    document.getElementById('bill-setup').classList.add('hidden');
    document.getElementById('workflow-section').classList.remove('hidden');
    if (typeof renderOrderHistory === 'function') renderOrderHistory();
    showSuccessToast('🎈 Ledger ready — add your besties!');
}

function addPerson(event) {
    if (event) event.preventDefault();
    const nameInput = document.getElementById('person-name');
    const name = nameInput.value.trim();
    if (!name) return;
    const newPerson = {
        person_id: currentBill.people.length + 1,
        name: name
    };
    currentBill.people.push(newPerson);
    nameInput.value = '';
    updatePeopleUI();
    updatePayerUI();
    showSuccessToast('✨ ' + name + ' joined the split!');
}

function updatePeopleUI() {
    const list = document.getElementById('people-list');
    const checkboxesDiv = document.getElementById('item-assignments-checkboxes');
    list.innerHTML = '';
    checkboxesDiv.innerHTML = '';
    currentBill.people.forEach(p => {
        list.innerHTML += `<li class="list-pop"><span>✨ ${p.name}</span></li>`;
        checkboxesDiv.innerHTML += `
            <label class="assign-row">
                <input type="checkbox" value="${p.person_id}" class="person-checkbox" onchange="onPersonCheckChange(this)">
                <span class="assign-name">${p.name}</span>
                <input type="number" class="person-qty" data-person-id="${p.person_id}" min="0" step="1" value="1" disabled title="How many this person had" placeholder="qty">
            </label>
        `;
    });
    const selectAllCb = document.getElementById('select-all-checkbox');
    if (selectAllCb) selectAllCb.checked = false;
}

function getAssignmentShares() {
    const shares = [];
    document.querySelectorAll('.person-checkbox:checked').forEach(cb => {
        const pid = parseInt(cb.value, 10);
        const qtyInput = document.querySelector('.person-qty[data-person-id="' + pid + '"]');
        let q = qtyInput ? parseFloat(qtyInput.value) : 1;
        if (isNaN(q) || q < 0) q = 0;
        if (q > 0) shares.push({ person_id: pid, qty: q });
    });
    return shares;
}

function addItem(event) {
    if (event) event.preventDefault();
    if (!tryRecordPendingItem()) {
        showError('🍱 Fill item name, total price, tick people, and set how many each person had!');
        return;
    }
    showSuccessToast('Item recorded!');
}

function tryRecordPendingItem() {
    const nameEl = document.getElementById('item-name');
    const qtyEl = document.getElementById('item-qty');
    const priceEl = document.getElementById('item-price');
    if (!nameEl || !priceEl) return false;

    const name = nameEl.value.trim();
    const qty = parseInt(qtyEl.value) || 1;
    const price = parseFloat(priceEl.value);
    const shares = getAssignmentShares();

    if (!name || isNaN(price) || shares.length === 0) {
        return false;
    }

    const shareTotal = shares.reduce((s, x) => s + x.qty, 0);
    if (shareTotal <= 0) return false;

    const assigned_people = shares.map(s => s.person_id);
    currentBill.items.push({
        name,
        qty,
        price,
        assigned_people,
        shares
    });

    const icon = getFoodPixel(name);
    const shareText = shares.map(s => {
        const person = currentBill.people.find(p => p.person_id === s.person_id);
        return (person ? person.name : s.person_id) + '×' + s.qty;
    }).join(', ');
    const list = document.getElementById('items-list');
    if (list) {
        list.innerHTML += `<li class="list-pop"><span>${icon} ${qty}x ${name}</span> <b>₹${price.toFixed(2)}</b><br><small style="color:#868e96;font-weight:600;">${shareText}</small></li>`;
    }
    nameEl.value = '';
    qtyEl.value = '1';
    priceEl.value = '';
    document.querySelectorAll('.person-checkbox').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.person-qty').forEach(q => { q.disabled = true; q.value = '1'; });
    const selectAllCb = document.getElementById('select-all-checkbox');
    if (selectAllCb) selectAllCb.checked = false;

    if (currentBill.tipPercentage && currentBill.tipPercentage > 0) {
        let subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
        let calculatedTip = (subtotal * currentBill.tipPercentage) / 100;
        document.getElementById('bill-tip').value = calculatedTip.toFixed(2);
        currentBill.tip = calculatedTip;
    }
    return true;
}

function getSummary(event) {
    if (event) event.preventDefault();

    tryRecordPendingItem();

    if (currentBill.people.length === 0) {
        showError('🥺 Add at least one person first!');
        return;
    }
    if (currentBill.items.length === 0) {
        showError('🍱 Add item name + price, set how many each person had, then Record Item!');
        return;
    }

    currentBill.date = formatTimestamp(new Date());
    currentBill.tip = parseFloat(document.getElementById('bill-tip').value) || currentBill.tip || 0;
    currentBill.payerIds = getSelectedPayerIds();

    let subtotal = currentBill.items.reduce((sum, item) => sum + item.price, 0);
    let personTotals = {};
    currentBill.people.forEach(p => {
        personTotals[p.person_id] = { name: p.name, itemCost: 0, tax: 0, tip: 0, discount: 0, final: 0 };
    });

    // Split by how many each person had (not equally)
    currentBill.items.forEach(item => {
        let shares = item.shares;
        if (!shares || shares.length === 0) {
            shares = (item.assigned_people || []).map(pid => ({ person_id: pid, qty: 1 }));
            if (shares.length === 0) return;
        }
        const shareTotal = shares.reduce((s, x) => s + x.qty, 0);
        if (shareTotal <= 0) return;
        shares.forEach(s => {
            if (personTotals[s.person_id]) {
                personTotals[s.person_id].itemCost += (s.qty / shareTotal) * item.price;
            }
        });
    });

    Object.keys(personTotals).forEach(pid => {
        let p = personTotals[pid];
        let proportion = subtotal > 0 ? (p.itemCost / subtotal) : 0;
        p.tax = proportion * currentBill.tax;
        p.tip = proportion * currentBill.tip;
        p.discount = proportion * currentBill.discount;
        p.final = p.itemCost + p.tax + p.tip - p.discount;
    });

    let grandTotal = subtotal + currentBill.tax + currentBill.tip - currentBill.discount;
    const payerIds = currentBill.payerIds;
    const allIds = currentBill.people.map(p => p.person_id);
    const everyonePaysOwn = payerIds.length === 0 || payerIds.length === allIds.length;

    let html = `
        <div class="inv-top-heading">INVOICE</div>
        <div class="inv-top-sub">${currentBill.name}</div>
        <div class="inv-pixel-decor" aria-hidden="true">
            <span>🍕</span><span>🍔</span><span>🍜</span><span>🥤</span><span>🍰</span>
        </div>
        <div class="inv-header-grid">
            <div class="inv-title-area">
                <h2>Invoice</h2>
                <div style="font-size: 0.75rem; font-weight: 700; color: #3b5bdb; margin-top: 4px;">DHAANYAA'S STUDIO</div>
                <div style="font-size: 0.7rem; color: #555; margin-top: 2px;">Smart Splitting Bill</div>
            </div>
            <div class="inv-meta-right">
                <div><b>INVOICE NO.</b> ${currentBill.orderNo}</div>
                <div><b>ACCOUNT NO.</b> 000-2387-56778</div>
                <div><b>INVOICE DATE</b> ${currentBill.date}</div>
                <div><b>DINING TYPE</b> ${currentBill.diningType}</div>
                <div><b>TRANSACTION</b> ${currentBill.transactionType}</div>
            </div>
        </div>
        <table class="inv-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    currentBill.items.forEach(item => {
        let unitPrice = item.price / item.qty;
        const icon = getFoodPixel(item.name);
        html += `
            <tr class="inv-row-fun">
                <td>
                    <span class="inv-item-name">
                        <span class="inv-item-pixel">${icon}</span>
                        ${item.name}
                    </span>
                </td>
                <td>${String(item.qty).padStart(2, '0')}</td>
                <td>₹${unitPrice.toFixed(2)}</td>
                <td>₹${item.price.toFixed(2)}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
        <div class="inv-bottom-grid">
            <div class="inv-bestie-box">
                <div style="font-size: 0.72rem; font-weight: 800; color: #2b2b2b; margin-bottom: 6px; text-transform: uppercase;">Bestie Share Breakdown</div>
    `;

    for (let pid in personTotals) {
        let p = personTotals[pid];
        html += `
            <div class="inv-bestie-row">
                <span><b>${p.name}</b></span>
                <span style="font-weight: 800; color: #0ca678;">₹${p.final.toFixed(2)}</span>
            </div>
        `;
    }

    html += `
            </div>
            <div class="inv-totals-stack">
                <div class="inv-total-line"><span>Sub Total</span><span>₹${subtotal.toFixed(2)}</span></div>
                <div class="inv-total-line"><span>Tax & Tip</span><span>+₹${(currentBill.tax + currentBill.tip).toFixed(2)}</span></div>
                <div class="inv-total-line"><span>Discount</span><span>-₹${currentBill.discount.toFixed(2)}</span></div>
                <div class="inv-total-line grand grand-pulse"><span>Grand Total</span><span>₹${grandTotal.toFixed(2)}</span></div>
            </div>
        </div>
    `;

    if (!everyonePaysOwn && payerIds.length > 0) {
        const payerNames = payerIds.map(id => personTotals[id].name);
        html += `
            <div class="settle-box">
                <div class="settle-title">Who paid · Settlements 💸</div>
                <div class="settle-paid-by"><b>Paid by:</b> ${payerNames.join(' & ')}</div>
        `;
        if (payerIds.length === 1) {
            const payerId = payerIds[0];
            const payerName = personTotals[payerId].name;
            html += `<div class="settle-note">${payerName} covered the full bill. Others pay them back:</div>`;
            for (let pid in personTotals) {
                const id = parseInt(pid, 10);
                if (id === payerId) continue;
                const p = personTotals[pid];
                if (p.final <= 0) continue;
                html += `
                    <div class="settle-row">
                        <span><b>${p.name}</b> → pays <b>${payerName}</b></span>
                        <span class="settle-amt">₹${p.final.toFixed(2)}</span>
                    </div>
                `;
            }
            html += `<div class="settle-row settle-own"><span>${payerName}'s own share</span><span>₹${personTotals[payerId].final.toFixed(2)}</span></div>`;
        } else {
            html += `<div class="settle-note">${payerNames.join(' & ')} covered the bill. Each non-payer splits their share among the payers:</div>`;
            for (let pid in personTotals) {
                const id = parseInt(pid, 10);
                if (payerIds.includes(id)) continue;
                const p = personTotals[pid];
                if (p.final <= 0) continue;
                const each = p.final / payerIds.length;
                payerIds.forEach(payerId => {
                    const payerName = personTotals[payerId].name;
                    html += `
                        <div class="settle-row">
                            <span><b>${p.name}</b> → pays <b>${payerName}</b></span>
                            <span class="settle-amt">₹${each.toFixed(2)}</span>
                        </div>
                    `;
                });
            }
            payerIds.forEach(payerId => {
                html += `<div class="settle-row settle-own"><span>${personTotals[payerId].name}'s own share</span><span>₹${personTotals[payerId].final.toFixed(2)}</span></div>`;
            });
        }
        html += `</div>`;
    } else {
        html += `
            <div class="settle-box settle-everyone">
                <div class="settle-title">Everyone pays their own share ✨</div>
                <div class="settle-note">No single payer selected — each person pays the amount in Bestie Share Breakdown.</div>
            </div>
        `;
    }

    if (currentBill.transactionType === 'Net Banking') {
        const payText = encodeURIComponent(
            'DHAANYAA STUDIO | ' + currentBill.name +
            ' | Invoice ' + currentBill.orderNo +
            ' | Amount INR ' + grandTotal.toFixed(2) +
            ' | Pay via Net Banking / UPI'
        );
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=' + payText;
        html += `
            <div class="netbanking-qr-box">
                <div class="netbanking-qr-title">Net Banking / UPI — Scan to Pay</div>
                <img class="netbanking-qr-img" src="${qrUrl}" alt="Payment QR Code" width="140" height="140">
                <div class="netbanking-qr-note">Amount: ₹${grandTotal.toFixed(2)} · Invoice ${currentBill.orderNo}</div>
            </div>
        `;
    }

    document.getElementById('summary-results').innerHTML = html;
    document.getElementById('workflow-section').classList.add('hidden');
    document.getElementById('summary-section').classList.remove('hidden');

    saveBillToHistory({
        name: currentBill.name,
        orderNo: currentBill.orderNo,
        date: currentBill.date,
        diningType: currentBill.diningType,
        transactionType: currentBill.transactionType,
        grandTotal: grandTotal,
        peopleNames: currentBill.people.map(p => p.name),
        itemCount: currentBill.items.length
    });

    launchConfetti();
    showSuccessToast('🎉 Invoice ready — splits locked in!');
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') event.preventDefault();
});