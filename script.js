const API_BASE = 'http://localhost:3000';
// API URL Configuration - Works with localhost, Live Share, and Render
const API_URL = (() => {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // Live Share
    if (hostname.includes('app.coder') || hostname.includes('localhost.run') || hostname.includes('github.dev')) {
        return 'http://localhost:3000';
    }
    // Render/Production
    return 'https://ambrosia-zxd3.onrender.com';
})();

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
                    // Debug: show which API URL the client will use
                    console.log('API_URL ->', API_URL);
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
            
            // Handle guest cart on login
            const guestCart = localStorage.getItem('guestCart');
            if (guestCart) {
                const guestItems = JSON.parse(guestCart);
                const serverCart = data.cart || [];
                
                // Only use guest cart if server cart is empty
                if (serverCart.length === 0 && guestItems.length > 0) {
                    // Save guest cart to server
                    fetch(`${API_URL}/cart`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: data.user.email, cart: guestItems })
                    }).catch(err => console.error('Error syncing cart:', err));
                }
                // Clear guest cart
                localStorage.removeItem('guestCart');
            }

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
        const viewPastBtn = document.getElementById('view-past-orders');
        if (viewPastBtn) viewPastBtn.classList.remove('hidden');
    } else {
        // User is not logged in 
        if (loginItem) loginItem.style.display = 'block';
        if (signupItem) signupItem.style.display = 'block';
        if (signoutItem) signoutItem.style.display = 'none';
        if (cartIcon) cartIcon.style.display = 'block';
        const viewPastBtn = document.getElementById('view-past-orders');
        if (viewPastBtn) viewPastBtn.classList.add('hidden');
    }

    if (isAdmin()) {
        if (cartIcon) cartIcon.style.display = 'none';
        
        // Add admin orders link if not already present
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && !document.querySelector('.admin-orders-link')) {
            const menuLink = navMenu.querySelector('a[href="menu.html"]')?.parentElement;
            if (menuLink) {
                const ordersLi = document.createElement('li');
                ordersLi.className = 'admin-orders-link';
                ordersLi.innerHTML = '<a href="admin-orders.html" class="nav-link">ORDERS</a>';
                menuLink.after(ordersLi);
            }
        }
    } else {
        // Remove admin orders link if user is not admin
        const adminOrdersLink = document.querySelector('.admin-orders-link');
        if (adminOrdersLink) adminOrdersLink.remove();
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
        // Fetch cart from server for logged-in users
        return fetch(`${API_URL}/cart/${encodeURIComponent(currentUser.email)}`)
            .then(res => res.json())
            .then(data => data.cart || [])
            .catch(err => {
                console.error('Error fetching cart:', err);
                return [];
            });
    }
    // Use localStorage for guest users
    const guestCart = localStorage.getItem('guestCart');
    return Promise.resolve(guestCart ? JSON.parse(guestCart) : []);
}

function saveCart(cart) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.email) {
        // Save to server for logged-in users
        fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email, cart })
        })
        .catch(err => console.error('Error saving cart to server:', err));
    } else {
        // Save to localStorage for guest users
        localStorage.setItem('guestCart', JSON.stringify(cart));
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

/* ============= CHECKOUT PAGE LOGIC ============= */

// Proceed to Checkout Button (from Cart Page)
const proceedCheckoutBtn = document.getElementById('proceed-checkout');
if (proceedCheckoutBtn) {
    proceedCheckoutBtn.addEventListener('click', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!currentUser) {
            // Guest can proceed
            window.location.href = 'checkout.html';
        } else {
            // Logged in user can proceed
            window.location.href = 'checkout.html';
        }
    });
}

// Checkout Form Logic
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    const emailGroup = document.getElementById('email-group');
    const nameGroup = document.getElementById('name-group');
    const loggedInNote = document.getElementById('logged-in-note');
    const schedulingSection = document.getElementById('scheduling-section');
    const customerEmail = document.getElementById('customer-email');
    const customerName = document.getElementById('customer-name');
    const loggedInUser = document.getElementById('logged-in-user');
    const creditCardFields = document.getElementById('credit-card-fields');
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const tipRadios = document.querySelectorAll('input[name="tip-option"]');
    const customTip = document.getElementById('custom-tip');
    const checkoutError = document.getElementById('checkout-error');

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    // Setup form based on login status
    if (currentUser) {
        // Logged in user
        emailGroup.classList.remove('hidden');
        loggedInNote.classList.remove('hidden');
        schedulingSection.classList.remove('hidden');
        customerEmail.value = currentUser.email;
        loggedInUser.textContent = `${currentUser.name} (${currentUser.email})`;
        customerName.value = currentUser.name;
        // hide manual name input for logged-in users and disable it so validation doesn't run
        nameGroup.classList.add('hidden');
        customerName.disabled = true;
    } else {
        // Guest
        emailGroup.classList.add('hidden');
        loggedInNote.classList.add('hidden');
        schedulingSection.classList.add('hidden');
        // show name input for guests and ensure it's enabled for validation
        nameGroup.classList.remove('hidden');
        customerName.disabled = false;
    }

    // Guest checkbox removed: form automatically adjusts based on login state

    // Payment method toggle
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'credit_card') {
                creditCardFields.style.display = 'block';
            } else {
                creditCardFields.style.display = 'none';
            }
        });
    });

    // Tip calculation
    tipRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTipDisplay();
        });
    });

    customTip.addEventListener('change', updateTipDisplay);

    function updateTipDisplay() {
        const selectedTip = document.querySelector('input[name="tip-option"]:checked').value;
        const cart = JSON.parse(sessionStorage.getItem('currentCheckoutCart') || '[]');
        
        let tipAmount = 0;
        if (selectedTip === 'no-tip') {
            tipAmount = 0;
        } else if (selectedTip === 'percent-10') {
            const subtotal = calculateSubtotal(cart);
            tipAmount = subtotal * 0.1;
        } else if (selectedTip === 'percent-15') {
            const subtotal = calculateSubtotal(cart);
            tipAmount = subtotal * 0.15;
        } else if (selectedTip === 'percent-20') {
            const subtotal = calculateSubtotal(cart);
            tipAmount = subtotal * 0.2;
        }
        
        const customValue = parseFloat(customTip.value) || 0;
        if (customValue > 0) {
            tipAmount = customValue;
        }

        document.getElementById('summary-tip').textContent = '$' + tipAmount.toFixed(2);
        updateSummaryTotal();
    }

    // Form submission
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        checkoutError.textContent = '';

        // Validate cart
        const cart = JSON.parse(sessionStorage.getItem('currentCheckoutCart') || '[]');
        if (cart.length === 0) {
            checkoutError.textContent = 'Your cart is empty.';
            return;
        }

        // Get form data
        // There is no guest checkbox: user is guest when not logged in
        const isGuest = currentUser ? false : true;
        const email = isGuest ? null : currentUser.email;
        const name = isGuest ? customerName.value : currentUser.name;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const scheduledTime = document.getElementById('scheduled-time').value || null;
        
        let tipAmount = 0;
        const selectedTip = document.querySelector('input[name="tip-option"]:checked').value;
        if (selectedTip === 'no-tip') {
            tipAmount = 0;
        } else if (selectedTip === 'percent-10') {
            tipAmount = calculateSubtotal(cart) * 0.1;
        } else if (selectedTip === 'percent-15') {
            tipAmount = calculateSubtotal(cart) * 0.15;
        } else if (selectedTip === 'percent-20') {
            tipAmount = calculateSubtotal(cart) * 0.2;
        }
        const customValue = parseFloat(customTip.value) || 0;
        if (customValue > 0) {
            tipAmount = customValue;
        }

        // Validate required fields
        if (!name) {
            checkoutError.textContent = 'Please enter your name.';
            return;
        }

        if (paymentMethod === 'credit_card') {
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const cardExpiry = document.getElementById('card-expiry').value;
            const cardCVV = document.getElementById('card-cvv').value;
            const cardName = document.getElementById('card-name').value;

            if (!cardNumber || cardNumber.length < 13) {
                checkoutError.textContent = 'Please enter a valid card number.';
                return;
            }
            if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
                checkoutError.textContent = 'Please enter expiry date in MM/YY format.';
                return;
            }
            if (!cardCVV || cardCVV.length !== 3) {
                checkoutError.textContent = 'Please enter a valid CVV.';
                return;
            }
            if (!cardName) {
                checkoutError.textContent = 'Please enter cardholder name.';
                return;
            }
        }

        // Disable button during submission
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Submit order to server
            const response = await fetch(`${API_URL}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    email: email,
                    name: name,
                    paymentMethod: paymentMethod,
                    tip: tipAmount,
                    scheduledTime: scheduledTime,
                    isGuest: isGuest
                })
            });

            let data;
            const contentType = response.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error('Non-JSON response from /checkout:', response.status, response.statusText, text);
                throw new Error(`Server returned ${response.status} ${response.statusText}: ${text ? text.slice(0,300) : '(no body)'}\nCheck API at ${API_URL}/checkout`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Checkout failed');
            }

            // Store order in session storage for receipt page
            sessionStorage.setItem('lastOrder', JSON.stringify(data.order));
            
            // Clear cart
            saveCart([]);

            // Redirect to receipt
            window.location.href = 'receipt.html';
        } catch (err) {
            checkoutError.textContent = err.message;
            checkoutError.style.color = '#ff6b6b';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Place Order';
        }
    });

    // Load cart on page load
    renderCheckoutSummary();
});

// Load Cart Summary on Checkout Page
function renderCheckoutSummary() {
    const summaryItems = document.getElementById('summary-items');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');

    if (!summaryItems) return;

    getCart().then(cart => {
        // Store cart in session storage for form submission
        sessionStorage.setItem('currentCheckoutCart', JSON.stringify(cart));

        summaryItems.innerHTML = '';
        if (cart.length === 0) {
            summaryItems.innerHTML = '<p style="color:#ddd;">Your cart is empty.</p>';
            if (summarySubtotal) summarySubtotal.textContent = '$0.00';
            if (summaryTotal) summaryTotal.textContent = '$0.00';
            return;
        }

        let total = 0;
        cart.forEach(item => {
            const pMatch = (item.price || '').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
            const pVal = pMatch ? parseFloat(pMatch[1]) : 0;
            const itemTotal = pVal * (item.qty || 1);
            total += itemTotal;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'summary-item';
            itemDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <span><strong>${item.name}</strong> x${item.qty || 1}</span>
                    <span>$${itemTotal.toFixed(2)}</span>
                </div>
            `;
            summaryItems.appendChild(itemDiv);
        });

        if (summarySubtotal) summarySubtotal.textContent = '$' + total.toFixed(2);
        if (summaryTotal) summaryTotal.textContent = '$' + total.toFixed(2);
    });
}

function calculateSubtotal(cart) {
    let total = 0;
    cart.forEach(item => {
        const pMatch = (item.price || '').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
        const pVal = pMatch ? parseFloat(pMatch[1]) : 0;
        total += pVal * (item.qty || 1);
    });
    return total;
}

function updateSummaryTotal() {
    const subtotal = calculateSubtotal(JSON.parse(sessionStorage.getItem('currentCheckoutCart') || '[]'));
    const tipAmount = parseFloat(document.getElementById('summary-tip').textContent.replace('$', '')) || 0;
    const total = subtotal + tipAmount;
    document.getElementById('summary-total').textContent = '$' + total.toFixed(2);
}

/* ============= RECEIPT PAGE LOGIC ============= */

document.addEventListener('DOMContentLoaded', function() {
    const receiptOrderId = document.getElementById('receipt-order-id');
    const receiptName = document.getElementById('receipt-name');
    const receiptEmail = document.getElementById('receipt-email');
    const receiptDatetime = document.getElementById('receipt-datetime');
    const receiptItems = document.getElementById('receipt-items');
    const receiptSubtotal = document.getElementById('receipt-subtotal');
    const receiptTip = document.getElementById('receipt-tip');
    const receiptTotal = document.getElementById('receipt-total');
    const receiptPayment = document.getElementById('receipt-payment');
    const scheduledInfo = document.getElementById('scheduled-info');
    const receiptScheduledTime = document.getElementById('receipt-scheduled-time');

    if (!receiptOrderId) return; // Not on receipt page

    // Get last order from session storage
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder') || 'null');

    if (!lastOrder) {
        receiptItems.innerHTML = '<p>No order found. Redirecting...</p>';
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    // Populate receipt
    receiptOrderId.textContent = lastOrder.id;
    receiptName.textContent = lastOrder.name;
    receiptEmail.textContent = lastOrder.email === 'guest' ? 'Guest' : lastOrder.email;
    
    const orderDate = new Date(lastOrder.orderDate);
    receiptDatetime.textContent = orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Show scheduled time if provided
    if (lastOrder.scheduledTime) {
        scheduledInfo.style.display = 'block';
        const scheduledDate = new Date(lastOrder.scheduledTime);
        receiptScheduledTime.textContent = scheduledDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Populate items
    receiptItems.innerHTML = '';
    lastOrder.items.forEach(item => {
        const pMatch = (item.price || '').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
        const pVal = pMatch ? parseFloat(pMatch[1]) : 0;
        const itemTotal = pVal * (item.qty || 1);

        const itemDiv = document.createElement('div');
        itemDiv.className = 'receipt-item';
        itemDiv.innerHTML = `
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-qty">Qty: ${item.qty || 1}</div>
            </div>
            <div class="item-price">$${itemTotal.toFixed(2)}</div>
        `;
        receiptItems.appendChild(itemDiv);
    });

    // Populate summary
    receiptSubtotal.textContent = '$' + lastOrder.subtotal.toFixed(2);
    receiptTip.textContent = '$' + lastOrder.tip.toFixed(2);
    receiptTotal.textContent = '$' + lastOrder.total.toFixed(2);
    receiptPayment.textContent = lastOrder.paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash';

    // Save to past orders
    saveOrderToPastOrders(lastOrder);
});

function saveOrderToPastOrders(order) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) return; // Don't save guest orders to past orders yet

    const pastOrders = JSON.parse(localStorage.getItem('pastOrders') || '[]');
    pastOrders.push(order);
    localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
}

/* ============= ADMIN ORDERS PAGE LOGIC ============= */

document.addEventListener('DOMContentLoaded', function() {
    const adminWarning = document.getElementById('admin-warning');
    const ordersGrid = document.getElementById('orders-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    if (!adminWarning) return; // Not on admin orders page

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
        adminWarning.classList.add('show');
        if (ordersGrid) {
            ordersGrid.innerHTML = '<div class="empty-state"><p>Access Denied. Please log in as an admin.</p></div>';
        }
        return;
    }

    // Load and display orders
    loadAdminOrders('all');

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const status = this.dataset.status;
            loadAdminOrders(status);
        });
    });
});

async function loadAdminOrders(statusFilter = 'all') {
    const ordersGrid = document.getElementById('orders-grid');
    if (!ordersGrid) return;

    try {
        const response = await fetch(`${API_URL}/admin/orders`);
        const data = await response.json();
        const orders = data.orders || [];

        // Filter orders by status or scheduled
        let filtered = orders;
        if (statusFilter !== 'all') {
            if (statusFilter === 'scheduled') {
                const now = new Date();
                filtered = orders.filter(o => o.scheduledTime && new Date(o.scheduledTime) > now);
            } else {
                filtered = orders.filter(o => o.status === statusFilter);
            }
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        if (filtered.length === 0) {
            ordersGrid.innerHTML = '<div class="empty-state"><p>No ' + (statusFilter !== 'all' ? statusFilter : '') + ' orders found.</p></div>';
            return;
        }

        ordersGrid.innerHTML = '';

        filtered.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersGrid.appendChild(orderCard);
        });
    } catch (err) {
        console.error('Error loading orders:', err);
        ordersGrid.innerHTML = '<div class="empty-state"><p>Error loading orders. Please try again.</p></div>';
    }
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.setAttribute('data-order-id', order.id);

    const orderDate = new Date(order.orderDate);
    const dateString = orderDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusClass = `status-${order.status}`;
    const statusDisplay = order.status.charAt(0).toUpperCase() + order.status.slice(1);

    // Build items list
    let itemsHTML = '';
    order.items.forEach(item => {
        itemsHTML += `<div class="order-item">${item.name} x${item.qty || 1} - ${item.price}</div>`;
    });

    // Build scheduled time info if available
    let scheduledHTML = '';
    if (order.scheduledTime) {
        const scheduledDate = new Date(order.scheduledTime);
        const scheduledString = scheduledDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        scheduledHTML = `<div class="order-scheduled">📅 Scheduled for: ${scheduledString}</div>`;
    }

    // Build action buttons
    let actionsHTML = '';
    const now = new Date();
    const isScheduled = order.scheduledTime && new Date(order.scheduledTime) > now;
    const adminCancelEmail = 'admin@ambrosia.com';
    const cancelEmailForAction = isAdmin() ? adminCancelEmail : order.email;

    if (isScheduled) {
        // Admin can delete scheduled orders; other actions not applicable
        if (isAdmin()) {
            actionsHTML = `
                <button class="action-btn btn-cancel" onclick="deleteOrder('${order.id}')">Delete Scheduled</button>
            `;
        } else {
            // For non-admins viewing (shouldn't normally be here), allow cancel if owner
            actionsHTML = `
                <button class="action-btn btn-cancel" onclick="cancelOrder('${order.id}', '${order.email}')">Cancel Scheduled</button>
            `;
        }
    } else if (order.status === 'confirmed') {
        actionsHTML = `
            <button class="action-btn btn-complete" onclick="markOrderComplete('${order.id}')">Mark Complete</button>
            <button class="action-btn btn-cancel" onclick="cancelOrder('${order.id}', '${cancelEmailForAction}')">Cancel Order</button>
        `;
    } else if (order.status === 'cancelled') {
        actionsHTML = '<button class="action-btn btn-disabled" disabled>Order Cancelled</button>';
    } else if (order.status === 'completed') {
        actionsHTML = '<button class="action-btn btn-disabled" disabled>Order Completed</button>';
    }

    card.innerHTML = `
        <div class="order-header">
            <div class="order-info">
                <div class="order-id">Order #${order.id}</div>
                <div class="order-date">${dateString}</div>
            </div>
            <div class="order-status ${statusClass}">${statusDisplay}</div>
        </div>

        <div class="order-customer">
            <div class="customer-detail">
                <strong>Customer:</strong>
                <span>${order.name}</span>
            </div>
            <div class="customer-detail">
                <strong>Email:</strong>
                <span>${order.email === 'guest' ? 'Guest' : order.email}</span>
            </div>
            <div class="customer-detail">
                <strong>Payment:</strong>
                <span>${order.paymentMethod === 'credit_card' ? 'Credit Card' : 'Cash'}</span>
            </div>
        </div>

        <div class="order-items">
            <h4>Items</h4>
            <div class="order-item-list">
                ${itemsHTML}
            </div>
        </div>

        ${scheduledHTML}

        <div class="order-totals">
            <div class="total-item">
                <span>Subtotal:</span>
                <span>$${order.subtotal.toFixed(2)}</span>
            </div>
            <div class="total-item">
                <span>Tip:</span>
                <span>$${order.tip.toFixed(2)}</span>
            </div>
            <div class="total-item">
                <span>Total:</span>
                <span>$${order.total.toFixed(2)}</span>
            </div>
        </div>

        <div class="order-actions">
            ${actionsHTML}
        </div>
    `;

    return card;
}

async function markOrderComplete(orderId) {
    if (!confirm('Mark this order as completed?')) return;

    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('Error completing order');
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Error completing order');
    }
}

async function cancelOrder(orderId, email) {
    if (!confirm('Cancel this order? This action cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/cancel-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, email: email })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Order cancelled successfully');
            // Remove the cancelled order from display immediately
            const orderCard = document.querySelector(`[data-order-id="${orderId}"]`);
            if (orderCard) {
                orderCard.remove();
            } else {
                location.reload();
            }
        } else {
            alert('Error: ' + (data.message || 'Could not cancel order'));
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Error cancelling order');
    }
}

/* ============= PAST ORDERS + CART UI ======== */
document.addEventListener('DOMContentLoaded', function() {
    // Show 'View Past Orders' button in cart when logged in
    const viewPastBtn = document.getElementById('view-past-orders');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (viewPastBtn) {
        if (currentUser && currentUser.email) {
            viewPastBtn.classList.remove('hidden');
        } else {
            viewPastBtn.classList.add('hidden');
        }
    }

    // If we're on the past-orders page, fetch and render orders
    const pastContainer = document.getElementById('past-orders-container');
    if (pastContainer) {
        renderPastOrders(pastContainer);
    }
});

async function renderPastOrders(container) {
    container.innerHTML = '<p class="muted">Loading your past orders...</p>';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || !currentUser.email) {
        container.innerHTML = '<p class="muted">Please log in to view your past orders.</p>';
        return;
    }

    try {
        const resp = await fetch(`${API_URL}/orders/${encodeURIComponent(currentUser.email)}`);
        if (!resp.ok) throw new Error('Failed to fetch orders from server');
        const data = await resp.json();
        const orders = data.orders || [];

        if (orders.length === 0) {
            // Fallback to localStorage pastOrders if available
            const local = JSON.parse(localStorage.getItem('pastOrders') || '[]');
            if (local.length === 0) {
                container.innerHTML = '<p class="muted">No past orders found.</p>';
                return;
            } else {
                renderOrdersList(container, local.reverse());
                return;
            }
        }

        // Sort newest first
        orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        renderOrdersList(container, orders);
    } catch (err) {
        console.error('Error loading past orders:', err);
        const local = JSON.parse(localStorage.getItem('pastOrders') || '[]');
        if (local.length) {
            renderOrdersList(container, local.reverse());
        } else {
            container.innerHTML = '<p class="muted">Could not load past orders. Please try again later.</p>';
        }
    }
}

function renderOrdersList(container, orders) {
    container.innerHTML = '';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const now = new Date();
    orders.forEach(order => {
        // Don't show cancelled orders to users
        if (order.status === 'cancelled') return;
        
        const card = document.createElement('div');
        card.className = 'order-card';
        card.setAttribute('data-order-id', order.id);

        const date = order.orderDate ? new Date(order.orderDate) : new Date();
        const dateStr = date.toLocaleString();

        let itemsHtml = '';
        (order.items || []).forEach(it => {
            itemsHtml += `<div class="order-item">${it.name} x${it.qty || 1} <span style="float:right">${it.price}</span></div>`;
        });

        // Determine if this is a future scheduled order
        const isScheduled = order.scheduledTime && new Date(order.scheduledTime) > now;

        let actionsHtml = '';
        if (isScheduled) {
            // allow user to cancel their own scheduled orders
            if (currentUser && currentUser.email === order.email) {
                actionsHtml = `<div class="order-actions"><button class="action-btn btn-cancel" onclick="cancelOrder('${order.id}', '${currentUser.email}')">Cancel Scheduled</button></div>`;
            }
        }

        card.innerHTML = `
            <div class="order-meta">
                <div><strong>Order #${order.id}</strong> — <span class="muted">${dateStr}</span></div>
                <div><strong>Total:</strong> $${(order.total || order.subtotal || 0).toFixed ? (order.total || order.subtotal).toFixed(2) : order.total}</div>
            </div>
            <div class="order-items">${itemsHtml}</div>
            ${isScheduled ? `<div class="order-scheduled">📅 Scheduled for: ${new Date(order.scheduledTime).toLocaleString()}</div>` : ''}
            ${actionsHtml}
        `;

        container.appendChild(card);
    });
}

async function deleteOrder(orderId) {
    if (!confirm('Permanently delete this order? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/admin/orders/${orderId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@ambrosia.com' })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Order deleted successfully');
            location.reload();
        } else {
            alert('Error: ' + (data.message || 'Could not delete order'));
        }
    } catch (err) {
        console.error('Error deleting order:', err);
        alert('Error deleting order');
    }
}