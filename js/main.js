// Dynamic loading of products from CMS JSON file
let products = [];

// Inicijalizacija Korpe iz LocalStorage-a
let cart = JSON.parse(localStorage.getItem('sl_cart')) || [];

// Pokretanje funkcija nakon učitavanja stranice
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCMSProducts();
    updateCartBadge();
    loadFeaturedProducts();
    renderCartTable();
    loadProductDetails();
});

// Funkcija za preuzimanje proizvoda iz CMS JSON fajla
async function fetchCMSProducts() {
    try {
        const response = await fetch('./content/products.json');
        if (response.ok) {
            const data = await response.json();
            products = data.items || [];
        }
    } catch (err) {
        console.error("Greška pri učitavanju proizvoda iz CMS-a:", err);
    }
}

// 2. Inicijalizacija Korpe iz LocalStorage-a
let cart = JSON.parse(localStorage.getItem('sl_cart')) || [];

// 3. Pokretanje funkcija nakon učitavanja stranice
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadFeaturedProducts();
    renderCartTable();
});

// 4. Prikaz proizvoda u mrežici (Home / Shop)
function loadFeaturedProducts() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <a href="product-details.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.title}">
                </a>
            </div>
            <div class="product-info">
                <span class="category">${product.category}</span>
                <h3><a href="product-details.html?id=${product.id}" style="text-decoration:none; color:inherit;">${product.title}</a></h3>
                <div class="product-bottom">
                    <span class="price">${product.price.toLocaleString('sr-RS')} RSD</span>
                    <button onclick="addToCart(${product.id})" class="btn-add-cart">
                        <i class="fa-solid fa-cart-plus"></i> Naruči
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 5. Dodavanje u korpu sa modernim obaveštenjem
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartBadge();
    
    // Prikaz novog custom obaveštenja
    showToastNotification(product.title, product.image);
}

// Funkcija za prikaz Toast obaveštenja
function showToastNotification(title, image) {
    // Proveri da li već postoji staro obaveštenje i ukloni ga
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    // Kreiraj novi oblačić
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid fa-circle-check"></i></div>
        <img src="${image}" alt="${title}" class="toast-img">
        <div class="toast-content">
            <strong>Dodato u korpu!</strong>
            <p>${title}</p>
        </div>
        <a href="cart.html" class="toast-btn">Vidi korpu</a>
    `;

    document.body.appendChild(toast);

    // Animacija ulaska
    setTimeout(() => toast.classList.add('show'), 10);

    // Automatsko uklanjanje posle 4 sekunde
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
// 6. Prikaz tabele na stranici korpe (cart.html)
function renderCartTable() {
    const tableBody = document.getElementById('cart-items-body');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const totalPriceEl = document.getElementById('cart-total-price');
    if (!tableBody) return;

    if (cart.length === 0) {
        tableBody.parentElement.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (totalPriceEl) totalPriceEl.textContent = '0 RSD';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    tableBody.parentElement.style.display = 'table';

    let total = 0;
    tableBody.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <tr>
                <td style="display:flex; align-items:center; gap:10px;">
                    <img src="${item.image}" alt="${item.title}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
                    <span>${item.title}</span>
                </td>
                <td>${item.price.toLocaleString('sr-RS')} RSD</td>
                <td>${item.quantity}</td>
                <td>${itemTotal.toLocaleString('sr-RS')} RSD</td>
                <td>
                    <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#e74c3c; cursor:pointer; font-size:1.1rem;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    if (totalPriceEl) {
        totalPriceEl.textContent = `${total.toLocaleString('sr-RS')} RSD`;
    }
}

// 7. Uklanjanje stavke iz korpe
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartBadge();
    renderCartTable();
}

// 8. Osvežavanje brojača u zaglavlju
function updateCartBadge() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
    }
}

// 9. Čuvanje u LocalStorage
function saveCart() {
    localStorage.setItem('sl_cart', JSON.stringify(cart));
}

// U DOMContentLoaded dodajemo poziv za detalje proizvoda
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadFeaturedProducts();
    renderCartTable();
    loadProductDetails(); // Učitava pojedinačni proizvod ako smo na product-details.html
});

// Funkcija za prikaz detalja i povezivanje dugmeta
function loadProductDetails() {
    const detailContainer = document.querySelector('.product-detail-container'); // prilagodi selektor po potrebi
    if (!detailContainer) return;

    // Uzimamo ID iz URL-a (npr. product-details.html?id=2)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1; // Default je 1 ako nema ID-a

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Popunjavamo podatke na stranici (ako postoje odgovarajući elementi)
    const titleEl = document.getElementById('detail-title');
    const priceEl = document.getElementById('detail-price');
    const imgEl = document.getElementById('detail-img');
    const catEl = document.getElementById('detail-category');

    if (titleEl) titleEl.textContent = product.title;
    if (priceEl) priceEl.textContent = `${product.price.toLocaleString('sr-RS')} RSD`;
    if (imgEl) imgEl.src = product.image;
    if (catEl) catEl.textContent = product.category;

    // Povezujemo dugme "Dodaj u korpu"
    const addBtn = document.getElementById('btn-add-to-cart-detail');
    if (addBtn) {
        addBtn.onclick = () => {
            // Ako na stranici postoji polje za količinu, pročitaj ga, u suprotnom dodaj 1
            const qtyInput = document.getElementById('detail-qty');
            const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
            
            addToCartWithQty(product.id, qty);
        };
    }
}

// Proširena funkcija za dodavanje sa proizvoljnom količinom
function addToCartWithQty(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }

    saveCart();
    updateCartBadge();
    showToastNotification(product.title, product.image);
}
