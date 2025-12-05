# AMBROSIA RESTAURANT WEBSITE

Ambrosia is a student-built restaurant web application that demonstrates a full-stack workflow: a static front-end with dynamic behavior (menu, cart, checkout) backed by a simple Node/Express JSON-file API. The project and requirements are documented in `SRS Doc.pdf` (see that file for full scope, team roles, and design decisions). Rendered utilizing `Render.com`.

Team Ctrl+Alt+Elite (summary - see `SRS Doc.pdf` for full details):
- Contributors and role breakdown are documented inside `SRS Doc.pdf`.

## Features

### User Authentication
- Sign Up: Create new user accounts with validation
- Log In: Simple login system backed by `users.json`
- Session Management: User session stored in `sessionStorage` while browsing
- Dynamic Navigation: Navigation updates based on login status

### Menu System
- Dynamic Menu Loading: Menu items loaded from `menuItems.json`
- Category Filtering: Filter items by Starters, Mains, Desserts, and Beverages
- Responsive Grid Layout: 2-column grid on desktop, stacks on mobile

### Shopping Cart
- Add to Cart: Items can be added to a cart (server-backed for logged-in users)
- Cart Badge: Real-time cart count displayed on cart icon
- Cart Management: View, remove items, and clear cart
- Persistent Storage: Cart data saved to backend (`carts.json`) for logged-in users
- Checkout Page: Full cart review with pricing totals

### Admin Features
- Menu Management: Admin users can add and delete menu items via the admin UI

## Project Structure (actual files in repository)

```
120-Final-Project/
├── index.html
├── menu.html
├── cart.html
├── checkout.html
├── receipt.html
├── log-in.html
├── sign-up.html
├── admin-orders.html
├── past-orders.html
├── specials.html
├── styles.css
├── mobile.css
├── script.js
├── server.js
├── menuItems.json
├── users.json
├── carts.json
├── orders.json
├── package.json
├── package-lock.json
├── node_modules/
├── README.md
├── SRS Doc.pdf
└── Images/
    ├── logo.png
    ├── name.png
    ├── menu-background.jpg
    ├── sausage-pasta.png
    └── photo-1517248135467-4c7edcad34c4.jpg
```

## Getting Started

### Prerequisites
- Node.js (recommended v14+) and npm installed
- Modern web browser

### Installation & Run (recommended)

1. Clone the repository:
```powershell
git clone https://github.com/Knudsonzak/120-Final-Project.git
cd 120-Final-Project
```

2. Install dependencies from `package.json` (recommended):
```powershell
npm install
```

3. Start the backend server (the server serves the static frontend and the API):
```powershell
node server.js
```

4. Open the app in your browser at `http://localhost:3000` (the server hosts the site and API). Note: you must run `node server.js` in a terminal first for the local site + API endpoints to work properly.

Alternative (no backend):
- You can open `index.html` directly in the browser for static-only inspection, but API features (login, cart sync, checkout) will not function without the server running.

## Notes and common gotchas
- The server listens on `process.env.PORT || 3000`. If port 3000 is in use, set `PORT` before starting: `PORT=4000 node server.js` (on Windows PowerShell: `$env:PORT=4000; node server.js`).
- The front-end uses `sessionStorage` for the current user session; update this in the code if you prefer `localStorage` persistence.
- To install a fresh copy of the dependencies on any machine, use `npm install` rather than installing packages one-by-one.

## Technologies Used
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js, Express.js
- Storage: JSON files (users, menu items, carts, orders)

## Authors & Team

Team: Ctrl+Alt+Elite

- Zak Knudson — https://github.com/Knudsonzak
- Jared Scheurer — https://github.com/jared-programming
- Jackson Grocki - https://github.com/JackGrocki

See `SRS Doc.pdf` for full team roles and responsibilities.

---
