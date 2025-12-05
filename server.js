const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Account Data
const usersFile = path.join(__dirname, 'users.json');
const cartsFile = path.join(__dirname, 'carts.json');
const ordersFile = path.join(__dirname, 'orders.json');

// Load Users
let users = [];
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}
else {
    users = [{
        name: 'Admin',
        email: 'admin@ambrosia.com',
        password: 'admin123',
        role: 'admin'
    }];
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
}

// Lead Carts
let carts = {};
if (fs.existsSync(cartsFile)) {
    carts = JSON.parse(fs.readFileSync(cartsFile, 'utf-8'));
}
else {
    carts = {};
    fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), 'utf-8');
}

// Load Orders
let orders = [];
if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
}
else {
    orders = [];
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');
}

// Load Menu
let menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'menuItems.json'), 'utf-8'));

// Endpoints

// Save Menu Item
app.post('/saveMenuItem', (req, res) => {
    menuData.push(req.body);

    fs.writeFileSync(path.join(__dirname, 'menuItems.json'), JSON.stringify(menuData, null, 2), 'utf-8');
    res.json({ message: "Menu item saved" });
});

//Delete Menu Item
app.post('/deleteMenuItem', (req, res) => {
    console.log("Delete request received:", req.body);

    const idToDelete = Number(req.body.id);
    menuData = menuData.filter(item => item.id !== idToDelete);

    fs.writeFileSync(path.join(__dirname, 'menuItems.json'), JSON.stringify(menuData, null, 2), 'utf-8');
    res.json({ message: "Menu item deleted" });
});

// Sign Up
app.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    console.log('Signup attempt:', { name, email, password });

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.'});
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.'});
    }
    
    const newUser = {
        name,
        email,
        password,
        role: 'user'
    };
    
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
    
    console.log('User created successfully:', newUser.email);
    console.log('Total users now:', users.length);

    const { password: _, ...safeUser } = newUser;
        res.status(201).json({
            message: 'Account created successfully.',
            user: safeUser
        });
});

// Log In
app.post('/login', (req, res) => {
    try {
        const { nameOrEmail, password } = req.body;

        console.log('Login attempt:', { nameOrEmail, password });
        
        const user = users.find(u => {
            const emailMatch = u.email && u.email.toLowerCase() === (nameOrEmail || '').toLowerCase();
            const nameMatch = u.name && u.name.toLowerCase() === (nameOrEmail || '').toLowerCase();
            const passwordMatch = u.password === password;
            return (emailMatch || nameMatch) && passwordMatch;
        });

        console.log('Found user:', user ? user.name : 'none');

        if (!user) {
            return res.status(401).json({ message: 'Invalid username/email or password.'});
        }

        const { password: _, ...safeUser } = user;
        const userCart = carts[user.email] || [];

        res.json({
            message: 'Login successful.',
            user: safeUser,
            cart: userCart
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// Save cart
app.post('/cart', (req, res) => {
    const { email, cart } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required to save cart.'});
    }

    carts[email] = cart || [];
    fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), 'utf-8');
    res.json({ message: 'Cart saved.' });
});

// Get cart
app.get('/cart/:email', (req, res) => {
    const email = req.params.email;
    const cart = carts[email] || [];
    res.json({ cart });
});

// Checkout - Create Order
app.post('/checkout', (req, res) => {
    try {
        const { items, email, name, paymentMethod, tip, scheduledTime, isGuest } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart cannot be empty.' });
        }

        // Calculate total
        let total = 0;
        items.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            total += price * (item.qty || 1);
        });

        const order = {
            id: Date.now(),
            email: email || 'guest',
            name: name || 'Guest',
            items: items,
            subtotal: total,
            tip: parseFloat(tip) || 0,
            total: total + (parseFloat(tip) || 0),
            paymentMethod: paymentMethod,
            scheduledTime: scheduledTime || null,
            orderDate: new Date().toISOString(),
            status: 'confirmed'
        };

        orders.push(order);
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');

        // Clear cart for this user
        if (email) {
            carts[email] = [];
            fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), 'utf-8');
        }

        res.json({ 
            message: 'Order created successfully.',
            order: order
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Server error during checkout.' });
    }
});

// Get Orders (for user or admin)
app.get('/orders/:email', (req, res) => {
    try {
        const email = req.params.email;
        const currentUser = JSON.parse(req.headers['x-user'] || 'null');

        // Admin can see all orders
        if (currentUser && currentUser.role === 'admin') {
            return res.json({ orders: orders });
        }

        // Users can only see their own orders
        const userOrders = orders.filter(order => order.email === email);
        res.json({ orders: userOrders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error fetching orders.' });
    }
});

// Get All Orders (Admin only)
app.get('/admin/orders', (req, res) => {
    try {
        res.json({ orders: orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Server error fetching orders.' });
    }
});

// Cancel Order
app.post('/cancel-order', (req, res) => {
    try {
        const { orderId, email } = req.body;

        const orderIndex = orders.findIndex(o => o.id === parseInt(orderId));
        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const order = orders[orderIndex];
        
        // Check if user can cancel (must be their order or admin)
        if (order.email !== email && email !== 'admin@ambrosia.com') {
            return res.status(403).json({ message: 'You cannot cancel this order.' });
        }

        order.status = 'cancelled';
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');

        res.json({ message: 'Order cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error cancelling order.' });
    }
});

// Mark Order as Complete (Admin only)
app.post('/admin/orders/:orderId/complete', (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        orders[orderIndex].status = 'completed';
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');

        res.json({ message: 'Order marked as completed.' });
    } catch (error) {
        console.error('Error completing order:', error);
        res.status(500).json({ message: 'Server error completing order.' });
    }
});

// Delete Order (Admin only - hard delete)
app.delete('/admin/orders/:orderId', (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const email = (req.body && req.body.email) || req.headers['x-user-email'];

        // Simple admin check: must present admin email (no auth system in this demo)
        if (email !== 'admin@ambrosia.com') {
            return res.status(403).json({ message: 'Unauthorized. Admin email required.' });
        }

        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Remove the order permanently
        const removed = orders.splice(index, 1)[0];
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');

        console.log(`Order ${orderId} deleted by admin ${email}`);

        res.json({ message: 'Order deleted successfully.', order: removed });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Server error deleting order.' });
    }
});

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running!', 
        message: 'AMBROSIA Restaurant API',
        endpoints: ['/signup', '/login', '/cart', '/saveMenuItem', '/deleteMenuItem']
    });
});

// Serve static files AFTER API routes
app.use(express.static(__dirname));

// Start the server - must be at the end after all routes are defined
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});