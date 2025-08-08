# Firebase & Firestore Setup Guide

## Prerequisites
- Node.js and npm installed
- Firebase account (free tier available)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "local-food-marketplace"
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## Step 3: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

## Step 4: Get Firebase Configuration

1. In Firebase Console, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web"
4. Register app with name: "local-food-marketplace"
5. Copy the configuration object

## Step 5: Update Firebase Configuration

Replace the placeholder config in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
}
```

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Set Up Firestore Security Rules

In Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read products and sellers
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /sellers/{sellerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow users to manage their own cart
    match /carts/{cartId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Step 8: Add Sample Data (Optional)

You can add sample products and sellers through the Firebase Console or create a data seeding script.

### Sample Product Structure:
```javascript
{
  name: "Fresh Organic Tomatoes",
  description: "Sweet, juicy tomatoes grown without pesticides",
  price: 3.99,
  image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop",
  category: "Vegetables",
  organic: true,
  local: true,
  fresh: true,
  sellerId: "seller1",
  sellerName: "Green Valley Farm",
  createdAt: serverTimestamp()
}
```

### Sample Seller Structure:
```javascript
{
  name: "Green Valley Farm",
  description: "Family-owned organic farm",
  location: "Local Area",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=300&h=200&fit=crop"
}
```

## Step 9: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser
3. Register a new account
4. Test adding products to cart
5. Verify cart persistence across page refreshes

## Features Now Available

✅ **User Authentication**
- Registration and login
- Session management
- Protected cart functionality

✅ **Product Management**
- Load products from Firestore
- Category filtering
- Search functionality
- Product details

✅ **Cart System**
- Add/remove items
- Update quantities
- Persistent cart storage
- Real-time cart count

✅ **Seller Profiles**
- View seller information
- Browse seller products

## Next Steps

1. **Add Payment Processing**: Integrate Stripe or PayPal
2. **Order Management**: Create orders collection
3. **User Profiles**: Add user profile management
4. **Admin Panel**: Create admin interface for sellers
5. **Image Upload**: Add Firebase Storage for product images
6. **Real-time Updates**: Add Firestore listeners for live updates

## Troubleshooting

### Common Issues:

1. **Authentication Errors**
   - Check Firebase config is correct
   - Verify Email/Password auth is enabled
   - Check browser console for errors

2. **Firestore Permission Errors**
   - Verify security rules are set correctly
   - Check if user is authenticated
   - Ensure proper collection/document structure

3. **CORS Issues**
   - Add your domain to Firebase Auth authorized domains
   - Check Firebase project settings

4. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for syntax errors in configuration files

## Security Best Practices

1. **Never expose Firebase config in production**
   - Use environment variables
   - Set up proper security rules
   - Enable App Check for production

2. **Validate user input**
   - Sanitize data before storing
   - Use proper data types
   - Implement rate limiting

3. **Monitor usage**
   - Set up Firebase Analytics
   - Monitor Firestore usage
   - Set up billing alerts

## Production Deployment

1. **Update Security Rules** for production
2. **Enable App Check** for additional security
3. **Set up proper authentication** methods
4. **Configure custom domains** if needed
5. **Set up monitoring** and alerts
6. **Test thoroughly** before going live
