const API_BASE = 'http://localhost:3000';
// API URL Configuration - Change this when deploying to Render
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000' 
    : 'https://ambrosia-zxd3.onrender.com';

// Sign up 
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('signup-error');
        
        // Clear localStorage !!!!!REMOVE AFTER TESTING!!!!!
        //localStorage.clear();
        
        //  success message
        errorDiv.textContent = '';

        fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
        errorDiv.textContent = 'Account created successfully! Redirecting to login...';
        errorDiv.style.color = '#4CAF50';
        errorDiv.style.marginTop = '1rem';
        
        // Redirect to login page 
        setTimeout(() => {
            window.location.href = 'log-in.html';
        }, 2000);
        })
        .catch(err => {
            errorDiv.textContent = err.message;
            errorDiv.style.color = '#ff6b6b';
            errorDiv.style.marginTop = '1rem';
        });
    });
}

// Log in 
const loginForm = document.getElementById('login-form');
if (loginForm) {
    console.log('Login form found');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const nameOrEmail = document.getElementById('nameOrEmail').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = '';

        console.log('Attempting login with:', nameOrEmail);

        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nameOrEmail, password })
        })
        .then(async response => {
            console.log('Response received:', response.status);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            localStorage.setItem('currentUser', JSON.stringify(data.user));
            // Cart is now managed by server, no need to store locally

            errorDiv.textContent = 'Login successful! Redirecting...';
            errorDiv.style.color = '#4CAF50';
            errorDiv.style.marginTop = '1rem';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        })
        .catch(err => {
            errorDiv.textContent = err.message;
            errorDiv.style.color = '#ff6b6b';
            errorDiv.style.marginTop = '1rem';
        });
    });
}

// Check authentication and update nav
function updateNavigation() {
    const currentUser = localStorage.getItem('currentUser');
    const loginItem = document.querySelector('.login-item');
    const signupItem = document.querySelector('.signup-item');
    const signoutItem = document.querySelector('.signout-item');
    const cartIcon = document.querySelector('.cart-icon');
    
    if (currentUser) {
        // User is logged in 
        if (loginItem) loginItem.style.display = 'none';
        if (signupItem) signupItem.style.display = 'none';
        if (signoutItem) signoutItem.style.display = 'block';
        if (cartIcon) cartIcon.style.display = 'block';
    } else {
        // User is not logged in 
        if (loginItem) loginItem.style.display = 'block';
        if (signupItem) signupItem.style.display = 'block';
        if (signoutItem) signoutItem.style.display = 'none';
        if (cartIcon) cartIcon.style.display = 'block';
    }

    if (isAdmin()) {
        if (cartIcon) cartIcon.style.display = 'none';
    }
}

// Sign out 
const signoutBtn = document.getElementById('signout-btn');
if (signoutBtn) {
    signoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        localStorage.removeItem('currentUser');
    
        updateNavigation();
        
        window.location.href = 'index.html';
    });
}
updateNavigation();

// Cart functionality
function getCart() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.email) {
        // Fetch cart from server
        return fetch(`${API_URL}/cart/${encodeURIComponent(currentUser.email)}`)
            .then(res => res.json())
            .then(data => data.cart || [])
            .catch(err => {
                console.error('Error fetching cart:', err);
                return [];
            });
    }
    return Promise.resolve([]);
}

function saveCart(cart) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.email) {
        fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, cart })
        })
        .catch(err => console.error('Error saving cart to server:', err));
    }
}

function updateCartCount() {
    getCart().then(cart => {
        const count = cart.reduce((sum, it) => sum + (it.qty || 1), 0);
        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(b => b.textContent = count);
    });
}

function addToCart(item) {
    return getCart().then(cart => {
        const existing = cart.find(i => i.name === item.name && i.price === item.price);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            item.qty = 1;
            cart.push(item);
        }
        saveCart(cart);
        updateCartCount();
    });
}

// Menu filtering + cart button injection
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    // Category filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const categorySections = document.querySelectorAll('#menu-items > div[data-category]');
    
    if (categoryBtns.length && categorySections.length) {
        function showCategory(cat) {
            categorySections.forEach(sec => {
                if (cat === 'all' || sec.dataset.category === cat) {
                    sec.style.display = '';
                } else {
                    sec.style.display = 'none';
                }
            });
        }

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const cat = btn.dataset.category;
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showCategory(cat);
            });
        });

        const active = Array.from(categoryBtns).find(b => b.classList.contains('active'));
        showCategory(active ? active.dataset.category : 'all');
    }

    // Inject Add to Cart buttons on menu items (only if logged in)
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const menuItems = document.querySelectorAll('.item');
        menuItems.forEach(mi => {
            if (mi.querySelector('.add-cart-btn')) return;
            const nameEl = mi.querySelector('h4');
            const descEl = mi.querySelector('p');
            const priceEl = mi.querySelector('.price');
            if (!nameEl || !priceEl) return;

            const btn = document.createElement('button');
            btn.className = 'add-cart-btn';
            btn.type = 'button';
            btn.textContent = 'Add to Cart';
            btn.addEventListener('click', function() {
                const item = {
                    name: nameEl.textContent.trim(),
                    desc: descEl ? descEl.textContent.trim() : '',
                    price: priceEl.textContent.trim()
                };
                btn.textContent = 'Adding...';
                addToCart(item).then(() => {
                    btn.textContent = 'Added!';
                    setTimeout(() => btn.textContent = 'Add to Cart', 900);
                });
            });

            mi.appendChild(btn);
        });
    }

    // Render cart on checkout page
    const cartContainer = document.getElementById('cart-contents');
    if (cartContainer) {
        renderCart();
        const clearBtn = document.getElementById('clear-cart');
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                clearCart();
            });
        }
    }
});

// Render cart on checkout page
function renderCart() {
    const container = document.getElementById('cart-contents');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;
    
    getCart().then(cart => {
        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = '<p style="color:#ddd;">Your cart is empty.</p>';
            if (totalEl) totalEl.textContent = '$0.00';
            return;
        }

        let total = 0;
        cart.forEach((it, idx) => {
        const row = document.createElement('div');
        row.className = 'cart-row';
        
        const name = document.createElement('div');
        name.className = 'cart-name';
        name.textContent = `${it.name} x${it.qty || 1}`;
        
        const price = document.createElement('div');
        price.className = 'cart-price';
        const pMatch = (it.price || '').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
        const pVal = pMatch ? parseFloat(pMatch[1]) : 0;
        total += (pVal * (it.qty || 1));
        price.textContent = it.price;

        const remove = document.createElement('button');
        remove.className = 'cart-remove';
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
            getCart().then(current => {
                current.splice(idx, 1);
                saveCart(current);
                renderCart();
                updateCartCount();
            });
        });

        row.appendChild(name);
        row.appendChild(price);
        row.appendChild(remove);
        container.appendChild(row);
        });

        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
    });
}

function clearCart() {
    saveCart([]);
    updateCartCount();
    renderCart();
}

/* ADMIN Controls */

/* Check if current user is admin */
function isAdmin() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    return currentUser && currentUser.role === "admin";
}
/* Add Menu Item */
document.addEventListener('click', e => {
    if (e.target.id === 'add-menu-item-btn') {

        const newItem = {
            id: Date.now(),
            name: document.getElementById("new-item-name").value,
            desc: document.getElementById("new-item-desc").value,
            price: parseFloat(document.getElementById("new-item-price").value),
            category: document.getElementById("new-item-category").value
        };

        if (!newItem.name || !newItem.desc || isNaN(newItem.price) || !newItem.category) {
            alert("Please fill in all fields correctly.");
            return;
        }

        fetch(`${API_URL}/saveMenuItem`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newItem)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            loadMenu();

            /* Clear form */
            document.getElementById("new-item-name").value = "";
            document.getElementById("new-item-desc").value = "";
            document.getElementById("new-item-price").value = "";
            document.getElementById("new-item-category").value = "starters";
        })
        .catch(error => console.error("Error adding menu item:", error));
    }
});
/* Delete Menu Item */
document.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const idToDelete = Number(e.target.dataset.id);

        console.log("Deleting item with ID:", idToDelete);

        fetch(`${API_URL}/deleteMenuItem`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: idToDelete })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            loadMenu();
        })
        .catch(error => console.error("Error deleting menu item:", error));
    }
});

/* Menu Item List */
/* Load Menu Items */
function loadMenu(category = "all") {
    fetch("menuItems.json?cacheBust=" + new Date().getTime())
        .then(response => response.json())
        .then(menuItems => {
            localStorage.setItem("menuItems", JSON.stringify(menuItems));

            const menuContainer = document.getElementById("menu-items");

            if (!menuContainer) {
                return;
            }
            
            menuContainer.innerHTML = "";

            const filtered = category === "all" ? menuItems : menuItems.filter(item => item.category === category);
            
            filtered.forEach((item, index) => {
            menuContainer.innerHTML += `
                <div class="item">
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                    <span class="price">$${item.price.toFixed(2)}</span>

                    ${isAdmin() ? `<button class="delete-btn" data-id="${item.id}"> 🗑 Delete</button>`
                    :
                    `<button class="add-cart-btn" data-name="${item.name}" data-desc="${item.desc}" data-price="${item.price.toFixed(2)}">Add to Cart</button>`}
                </div>
            `;
            });

            if (isAdmin()) {
                menuContainer.innerHTML += `
                    <div class="admin-form">
                        <h3>Add New Menu Item</h3>
                        <input type="text" id="new-item-name" placeholder="Name" />
                        <input type="text" id="new-item-desc" placeholder="Description" />
                        <input type="number" id="new-item-price" placeholder="Price" step="0.01" />
                        <select id="new-item-category">
                            <option value="starters">Starters</option>
                            <option value="mains">Mains</option>
                            <option value="desserts">Desserts</option>
                            <option value="beverages">Beverages</option>
                        </select>
                        <button id="add-menu-item-btn">Add Item</button>
                    </div>
                `;
            }

            // Add event listeners to cart buttons after they're created
            if (!isAdmin()) {
                document.querySelectorAll('.add-cart-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const item = {
                            name: btn.dataset.name,
                            desc: btn.dataset.desc,
                            price: '$' + btn.dataset.price
                        };
                        btn.textContent = 'Adding...';
                        addToCart(item).then(() => {
                            btn.textContent = 'Added!';
                            setTimeout(() => btn.textContent = 'Add to Cart', 900);
                        });
                    });
                });
            }
        });
}
/* Filter Menu by Category */
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const category = btn.dataset.category;
        loadMenu(category);

        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
/* Menu Items for testing purposes */
document.addEventListener('DOMContentLoaded', function() {
        loadMenu();
});