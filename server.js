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

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Account Data
const usersFile = path.join(__dirname, 'users.json');
const cartsFile = path.join(__dirname, 'carts.json');

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
        res.json({ message: 'Account created successfully.', user: safeUser });
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

// Start the server - must be at the end after all routes are defined
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});