
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where,
  limit,
  orderBy,
  serverTimestamp,
  startAfter,
  onSnapshot,
  increment
} from 'firebase/firestore';


import { db } from '../firebase'

// Products Collection
export const productsCollection = collection(db, 'products')
export const sellersCollection = collection(db, 'sellers')
export const cartsCollection = collection(db, 'carts')


// Product Operations
export const getProducts = async (lastDoc = null) => {
  try {
    let productsQuery = query(
      productsCollection,
      orderBy('createdAt', 'desc'), // Order by createdAt descending
      limit(20) // Limit to 20 results
    );
  if (lastDoc) {
    productsQuery = query(productsQuery, startAfter(lastDoc));
    }
      const querySnapshot = await getDocs(productsQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
  } catch (error) {
    console.error('Error getting products:', error)
    throw error
    }
}

export const addProduct = async (productData) => {
  try {
    await addDoc(collection(db, 'products'), productData);
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      productsCollection, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting products by category:', error)
    throw error
  }
}

export const createCart = async (userId) => {
  try {
    // Use the userId as the document ID for the cart
    const cartRef = getCartDocRef(userId)
    await setDoc(cartRef, {
      userId, // We can still store the userId in the document if needed
      createdAt: serverTimestamp(),
    });
    console.log("Cart created for user:", userId);
  } catch (error) {
    console.error('Error creating cart:', error);
    throw error;
  }
};

export const updateProductStock = async (productId, amount) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, { stock: increment(amount) });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

export const watchProduct = (productId, callback) => {
  try {
    const productRef = doc(db, 'products', productId);
    return onSnapshot(productRef, (docSnap) => {
      console.log("watched")
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null); // Product was likely deleted
      }
    });
  } catch (error) {
    console.error('Error watching product:', error);
    throw error;
  }
};

export const searchProducts = (products, searchTerm) => {
  return products.filter(product => 
 product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sellerName && product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) // Added check for sellerName
 )

}

export const filterProducts = async (filters) => {
  try {   
    let productQuery = query(productsCollection);
    if (filters.minPrice !== undefined && filters.minPrice !== null) {     
      productQuery = query(productQuery, where('price', '>=', filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      productQuery = query(productQuery, where('price', '<=', filters.maxPrice));
    }
    if (filters.minRating !== undefined && filters.minRating !== null) {
      productQuery = query(productQuery, where('avgRating', '>=', filters.minRating));
    }
    if (filters.category && filters.category !== 'All') {
      productQuery = query(productQuery, where('category', '==', filters.category));
    }

    const querySnapshot = await getDocs(productQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error filtering products:', error);
    throw error;
  }
};

// Seller Operations
export const getSellerById = async (sellerId) => {
  try {
    const docRef = doc(db, 'sellers', sellerId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      throw new Error('Seller not found')
    }
  } catch (error) {
    console.error('Error getting seller:', error)
    throw error
  }
}

export const getSellerProducts = async (sellerId) => {
  try {
    const q = query(
      productsCollection, 
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting seller products:', error)
    throw error
  }
}

// Cart Operations
const cartDocRefs = {};
const getCartDocRef = (userId) => {
  if (!cartDocRefs[userId]) {
    cartDocRefs[userId] = doc(db, 'carts', userId);
  }
  return cartDocRefs[userId];
};


export const getCart = async (userId) => {
  try {
    const cartDocRef = getCartDocRef(userId)
    const cartSnap = await getDoc(cartDocRef);

    if (cartSnap.exists()) {
      const itemsCollection = collection(cartDocRef, 'items');
      const itemsSnapshot = await getDocs(itemsCollection);
      return itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    return []
  } catch (error) {
    console.error('Error getting cart:', error)
    throw error;
  }
}

export const watchCart = (userId, callback) => {
  try {
    const cartDocRef = getCartDocRef(userId);
    const itemsCollection = collection(cartDocRef, 'items');

    return onSnapshot(itemsCollection, (itemsSnapshot) => {
      const cartItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(cartItems);
    }, (error) => {
      // This error handler is likely to be called if the user's cart document doesn't exist yet.
      // Calling the callback with an empty array to signify an empty cart.
      console.log("Watching cart resulted in an error, returning empty cart. This is expected if the user has no items.", error);
      callback([]);
    });
  } catch (error) {
    console.error('Error watching cart:', error);
    throw error;
  }
}

export const updateCartItemQuantity = async (userId, product, amount) => {
  try {
    console.log("update cart")
    const cartDocRef = getCartDocRef(userId);
    
    // We need to ensure the cart document exists before we can add items to it.
    const cartSnap = await getDoc(cartDocRef);
    if (!cartSnap.exists()) {
        await setDoc(cartDocRef, { userId, createdAt: serverTimestamp() });
    }
    
    const itemRef = doc(collection(cartDocRef, 'items'), product.id);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists() && itemSnap.data().quantity + amount <= 0) {
      await deleteDoc(itemRef);
    } else {
      await setDoc(itemRef, { 
        quantity: increment(amount),
        // also add product details to the cart item, this is better than having to fetch them separately
        name: product.name,
        price: product.price,
        imageUrl: product.image || ''
        }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};


export const clearCart = async (userId) => {
  try {
    const cartDocRef = getCartDocRef(userId)
    const itemsCollection = collection(cartDocRef, 'items');
    const itemsSnapshot = await getDocs(itemsCollection);
    
    // No need to check if cart exists, if it doesn't, itemsSnapshot will be empty
    itemsSnapshot.docs.forEach(async (itemDoc) => {
      await deleteDoc(itemDoc.ref);
    });
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}
