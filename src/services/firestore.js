import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  limit,
  orderBy,
  serverTimestamp,
  startAfter
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
    console.log("products have filtered")
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
      return querySnapshot.docs[0].data().items || []
    }
    return []
  } catch (error) {
    console.error('Error getting cart:', error)
    throw error
  }
}

export const addToCart = async (userId, product) => {
  try {
    // Check product stock
    const productRef = doc(db, 'products', product.id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      throw new Error('Product not found.');
    }

    const productData = productSnap.data();
    let currentStock = productData.stock || 0;

    if (currentStock <= 0) {
      throw new Error('Product is out of stock.');
    }

    // Add to user's cart
    const q = query(cartsCollection, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      // Create new cart
      await addDoc(cartsCollection, {
        userId,
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        }],
        createdAt: serverTimestamp()
      })
    } else {
      // Update existing cart
      const cartDoc = querySnapshot.docs[0]
      const cartData = cartDoc.data()
      const existingItem = cartData.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cartData.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1
        })
      }
      
      await updateDoc(doc(db, 'carts', cartDoc.id), {
        items: cartData.items,
        updatedAt: serverTimestamp()
      })
    }

    // Decrement product stock
    const newStock = currentStock - 1;
    if (newStock === 0) {
      await deleteDoc(productRef);
    } else {
      await updateDoc(productRef, { stock: newStock });
    }

  } catch (error) {
    console.error('Error adding to cart:', error)
    throw error
  }
}

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  try {
    const q = query(cartsCollection, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const cartDoc = querySnapshot.docs[0]
      const cartData = cartDoc.data()
      const itemIndex = cartData.items.findIndex(item => item.id === productId)
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          cartData.items.splice(itemIndex, 1)
        } else {
          cartData.items[itemIndex].quantity = quantity
        }
        
        await updateDoc(doc(db, 'carts', cartDoc.id), {
          items: cartData.items,
          updatedAt: serverTimestamp()
        })
      }
    }
  } catch (error) {
    console.error('Error updating cart item:', error)
    throw error
  }
}

export const clearCart = async (userId) => {
  try {
    const q = query(cartsCollection, where('userId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, 'carts', querySnapshot.docs[0].id))
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    throw error
  }
}
