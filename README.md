# Local Food Marketplace

A modern Vue.js application for connecting local farmers, bakers, and artisans with customers in their community. Built with Vue 3, Vue Router, and Firebase/Firestore.

## Features

### 🛒 Shopping Experience
- **Product Browsing**: Browse local products with beautiful cards
- **Category Filtering**: Filter by Vegetables, Fruits, Bakery, Dairy, Meat, Herbs
- **Search Functionality**: Search products by name, description, or seller
- **Shopping Cart**: Add items, update quantities, persistent cart storage
- **Seller Profiles**: View seller information and their products

### 🔐 User Authentication
- **User Registration**: Create new accounts with email/password
- **User Login**: Secure authentication with Firebase Auth
- **Session Management**: Persistent login sessions
- **Protected Features**: Cart functionality requires authentication

### 🏪 Backend Integration
- **Firebase Firestore**: Real-time database for products, users, and carts
- **Firebase Authentication**: Secure user management
- **Real-time Updates**: Live cart count and product updates
- **Scalable Architecture**: Built for production deployment

## Tech Stack

- **Frontend**: Vue 3, Vue Router
- **Backend**: Firebase Firestore, Firebase Authentication
- **Styling**: CSS3 with modern design patterns
- **Build Tool**: Vite
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd firestore-starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Follow the [Firebase Setup Guide](FIREBASE_SETUP.md)
   - Update `src/firebase.js` with your Firebase configuration

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Register a new account
   - Start exploring local products!

## Project Structure

```
firestore-starter/
├── src/
│   ├── views/           # Page components
│   │   ├── Home.vue     # Product listing page
│   │   ├── Cart.vue     # Shopping cart
│   │   ├── ProductDetail.vue
│   │   └── SellerProfile.vue
│   ├── services/        # Firebase services
│   │   ├── firestore.js # Firestore operations
│   │   └── auth.js      # Authentication service
│   ├── App.vue          # Root component
│   ├── main.js          # App entry point
│   ├── firebase.js      # Firebase configuration
│   └── style.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
└── vite.config.js       # Build configuration
```

## Key Components

### Home.vue
- Product grid with filtering and search
- Real-time product loading from Firestore
- Add to cart functionality
- Responsive design

### Cart.vue
- Shopping cart with quantity controls
- Real-time cart updates
- Order summary with delivery fees
- Checkout simulation

### App.vue
- Navigation with authentication
- User login/register modals
- Real-time cart count
- Responsive layout

## Firebase Collections

### Products
```javascript
{
  id: "product1",
  name: "Fresh Organic Tomatoes",
  description: "Sweet, juicy tomatoes grown without pesticides",
  price: 3.99,
  image: "https://...",
  category: "Vegetables",
  organic: true,
  local: true,
  fresh: true,
  sellerId: "seller1",
  sellerName: "Green Valley Farm",
  createdAt: timestamp
}
```

### Carts
```javascript
{
  userId: "user123",
  items: [
    {
      id: "product1",
      name: "Fresh Organic Tomatoes",
      price: 3.99,
      image: "https://...",
      quantity: 2
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Sellers
```javascript
{
  id: "seller1",
  name: "Green Valley Farm",
  description: "Family-owned organic farm",
  location: "Local Area",
  rating: 4.8,
  image: "https://..."
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Deployment

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Other Platforms
- **Vercel**: Connect GitHub repository
- **Netlify**: Drag and drop `dist` folder
- **AWS S3**: Upload built files to S3 bucket

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
1. Check the [Firebase Setup Guide](FIREBASE_SETUP.md)
2. Review Firebase Console documentation
3. Open an issue on GitHub

## Roadmap

- [ ] Payment processing integration
- [ ] Order management system
- [ ] User profile management
- [ ] Admin panel for sellers
- [ ] Image upload functionality
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced search filters
- [ ] Review and rating system
