# AMBROSIA Restaurant Website

A full-featured restaurant website with user authentication, dynamic menu management, and shopping cart functionality.

## 🌟 Features

### User Authentication
- **Sign Up**: Create new user accounts with validation
- **Log In**: Secure user login system
- **Session Management**: Persistent user sessions across pages
- **Dynamic Navigation**: Nav menu updates based on login status

### Menu System
- **Dynamic Menu Loading**: Menu items loaded from JSON file
- **Category Filtering**: Filter items by Starters, Mains, Desserts, and Beverages
- **Responsive Grid Layout**: 2-column grid on desktop, stacks on mobile
- **Background Image**: Custom menu background with overlay effects

### Shopping Cart
- **Add to Cart**: Authenticated users can add items to cart
- **Cart Badge**: Real-time cart count displayed on cart icon
- **Cart Management**: View, remove items, and clear cart
- **Persistent Storage**: Cart data saved to backend
- **Checkout Page**: Full cart review with pricing totals

### Admin Features
- **Menu Management**: Admin users can add and delete menu items
- **Dynamic Form**: Add new items with name, description, price, and category
- **Delete Items**: Remove menu items with styled delete buttons

### Responsive Design
- **Mobile-First**: Fully responsive across all devices
- **Custom Styling**: Gold theme with elegant typography (Playfair Display + Poppins)
- **Smooth Animations**: Hover effects, transitions, and scale animations
- **Hamburger Menu**: Mobile navigation with toggle menu

## 📁 Project Structure

```
120-Final-Project/
├── index.html          # Homepage
├── menu.html           # Menu page with filtering
├── specials.html       # Specials page
├── checkout.html       # Shopping cart and checkout
├── log-in.html         # Login page
├── sign-up.html        # Sign up page
├── admin-orders.html   # Admin orders management
├── past-orders.html    # User order history
├── styles.css          # Main stylesheet
├── mobile.css          # Mobile responsive styles
├── script.js           # Main JavaScript (auth, cart, menu)
├── server.js           # Express backend server
├── menuItems.json      # Menu data
├── users.json          # User database
├── carts.json          # Cart storage
└── Images/             # Image assets
    ├── logo.png
    ├── name.png
    ├── menu-background.jpg
    └── sausage-pasta.png
```

## 🚀 Getting Started

### Prerequisites
- Node.js and npm installed
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Knudsonzak/120-Final-Project.git
cd 120-Final-Project
```

2. Install dependencies:
```bash
npm install express cors
```

3. Start the backend server:
```bash
node server.js
```

4. Open `index.html` in your browser or use a local server

## 🎨 Design Features

### Color Scheme
- Primary Color: `#979770` (Gold)
- Background: Dark theme with overlays
- Accents: Gold gradients and red for delete actions

### Typography
- Headings: Playfair Display (serif)
- Body: Poppins (sans-serif)

### Interactive Elements
- Category filter buttons with active states
- Add to Cart buttons (login-required)
- Styled delete buttons with red gradient
- Admin form with gold theme
- Smooth hover animations and scale effects

## 🔐 Authentication Flow

1. Users sign up with name, email, and password
2. Credentials stored in `users.json` via backend API
3. Login validates credentials and stores session
4. CurrentUser stored in localStorage
5. Navigation and features update based on auth status

## 🛒 Cart System

1. Users must be logged in to see "Add to Cart" buttons
2. Items added with name, description, price, and quantity
3. Cart data synced to backend (`carts.json`)
4. Cart count badge updates in real-time
5. Full cart management on checkout page

## 🔧 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Storage**: JSON files (users, menu items, carts)
- **Fonts**: Google Fonts
- **Layout**: Flexbox, CSS Grid
- **API**: Fetch API for backend communication

## 📱 Responsive Breakpoints

- Desktop: Default styles
- Tablet: `max-width: 900px`
- Mobile: `max-width: 480px`

## 👨‍💼 Admin Features

Admins can:
- Add new menu items via form
- Delete existing menu items
- View and manage orders (admin-orders.html)

## 🎯 Future Enhancements

- Payment integration
- Order history tracking
- Email confirmations
- Real-time order status
- User profile management
- Reviews and ratings

## 📄 License

This project is part of a university course (120 Final Project).

## 👤 Author

**Zak Knudson**
- GitHub: [@Knudsonzak](https://github.com/Knudsonzak)

---

