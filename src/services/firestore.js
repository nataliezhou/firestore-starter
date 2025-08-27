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
    await addDoc(cartsCollection, {
      userId,
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
export const getCart = async (userId) => {
  try {
    const q = query(cartsCollection, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const cartDocRef = doc(db, 'carts', querySnapshot.docs[0].id);
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
    const q = query(cartsCollection, where('userId', '==', userId));
    return onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const cartDocRef = querySnapshot.docs[0].ref;
        const itemsCollection = collection(cartDocRef, 'items');
        // Now listen to the items subcollection
        return onSnapshot(itemsCollection, (itemsSnapshot) => {
          const cartItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(cartItems);
        });
      } else {
        // Cart doesn't exist yet or was deleted
        callback([]);
      }
    });
  } catch (error) {
    console.error('Error watching cart:', error);
    throw error;
  }
}

export const updateCartItemQuantity = async (userId, product) => {
  console.log("update cart item for user", userId, "product", product)
  try {
    const q = query(cartsCollection, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    let cartDocRef;

    if (querySnapshot.empty) {
      // Create a new cart document
      cartDocRef = doc(collection(db, 'carts'), userId);
      await setDoc(cartDocRef, { userId });
    } else {
      // Get the existing cart document
      cartDocRef = querySnapshot.docs[0].ref;
    }
    
    // Reference to the specific item in the subcollection
    const itemRef = doc(collection(cartDocRef, 'items'), product.id);

    if (product.quantity <= 0) {
      await deleteDoc(itemRef);
    } else {

      await setDoc(itemRef, { 
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: product.quantity
        });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const q = query(cartsCollection, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const cartDocRef = querySnapshot.docs[0].ref;
      const itemsCollection = collection(cartDocRef, 'items');
      const itemsSnapshot = await getDocs(itemsCollection);
      itemsSnapshot.docs.forEach(async (itemDoc) => {
        await deleteDoc(itemDoc.ref);
      });
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}
