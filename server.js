const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const cors = require('cors');

app.use(cors( {origin: 'http://127.0.0.1:5500' }));

app.use(express.json());

// Load JSON
let menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'menuItems.json'), 'utf-8'));

// Endpoints
app.post('/saveMenuItem', (req, res) => {
    menuData.push(req.body);

    fs.writeFileSync(path.join(__dirname, 'menuItems.json'), JSON.stringify(menuData, null, 2), 'utf-8');
    res.json({ message: "Menu item saved" });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

//Delete Menu Item
app.post('/deleteMenuItem', (req, res) => {
    console.log("Delete request received:", req.body);

    const idToDelete = Number(req.body.id);
    menuData = menuData.filter(item => item.id !== idToDelete);

    fs.writeFileSync(path.join(__dirname, 'menuItems.json'), JSON.stringify(menuData, null, 2), 'utf-8');
    res.json({ message: "Menu item deleted" });
});