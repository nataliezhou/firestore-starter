import 'dotenv/config' // Load environment variables

import { initializeApp } from 'firebase/app'; // Import initializeApp
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, writeBatch, serverTimestamp, terminate } from 'firebase/firestore'; // Import necessary Firestore functions, including serverTimestamp and terminate
import mockData from './mockSellers.json' with { type: "json" };
// Define firebaseConfig using process.env (Node.js environment)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET, // need to use process instead of meta bc nodejs vs vite
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID, // Ensure this matches your .env
};


// Initialize Firebase app and Firestore for this script
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * @param {FirebaseFirestore.Firestore} db 
 * @param {string} collectionPath
 * @param {number} batchSize
 * @returns {Promise}
 * 
 * Deletes all documents in a Firestore collection in batches.
 */
async function deleteCollection(collectionPath) {
  const batchSize = 500; // Adjust batch size as needed
  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef, orderBy('__name__'), limit(batchSize));

  await deleteQueryBatch(q);
}

async function deleteQueryBatch(query) {
  const snapshot = await getDocs(query);

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    return;
  }

  // Delete documents in a batch
  const batch = writeBatch(db)
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  if (batchSize === 500) {
    await new Promise(resolve => process.nextTick(resolve));
    await deleteQueryBatch(query);
  }
}


const addSellerToStore = async (seller) => {
    await addDoc(collection(db, 'sellers'), seller);
}   

const addProductToStore = async (product) => {
    await addDoc(collection(db, 'products'), product);
}   



/**
 * Adds a list of sellers to Firestore database.
 * @param {Seller[]} sellersArr
 * @returns {Promise[]} List of promises
 */
const addMockSellers = async (dataFile) => {
  await deleteCollection('sellers');
  const sellers = [];

  dataFile.sellers.forEach(seller => {
    const city = seller.location.split(',')[0].trim();
    
    // Creating mock data for keys that don't exist in the source data
    const category = seller.name.includes('Bakery') ? 'Bakery' : (seller.name.includes('Farm') || seller.name.includes('Ranch') ? 'Farm-to-Table' : 'Organic');
    const price = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
    const numRatings = Math.floor(Math.random() * 500) + 50; // Random number between 50 and 550
    const avgRating = (Math.random() * 2) + 3; // Random number between 3.0 and 5.0
    
    sellers.push({
      name: seller.name,
      category: category,
      price: price,
      city: city,
      numRatings: numRatings,
      avgRating: parseFloat(avgRating.toFixed(2)),
      image: seller.image,
    });
  });

  try {
  // now add to firestore
    const promises = sellers.map(seller => {
        return addSellerToStore(seller);
    }); 

    return promises; // Returns the results of each addDoc call.
  } catch (error) {
    console.error('Error adding mock sellers to Firestore:', error);
    throw error;
  } 
};


/**
 * Adds a list of products to Firestore database.
 * @param {Product[]} productsArr
 * @param {Seller[]} sellers The list of sellers to get seller name and image
 */
const addMockProducts = async (dataFile) => {
    await deleteCollection('products');

     // Create a map for quick seller lookup by ID
    const sellersMap = new Map();
    dataFile.sellers.forEach(seller => {
      sellersMap.set(seller.id, {
        name: seller.name,
        image: seller.image,
      });
    });

    const products = [];

    dataFile.allProducts.forEach(product => {

      // get relevant product info
      const seller = sellersMap.get(product.sellerId);
      const numRatings = Math.floor(Math.random() * 500) + 50; // Random number between 50 and 550
      const avgRating = (Math.random() * 2) + 3; // Random number between 3.0 and 5.0

      products.push({
        name: product.name,
        category: product.category,
        price: product.price,
        numRatings: numRatings,
        avgRating: parseFloat(avgRating.toFixed(2)),
        image: product.image,
        sellerId: product.sellerId,
        sellerName: seller ? seller.name : 'Unknown',
        sellerImage: seller ? seller.image : '',
        createdAt: serverTimestamp(),
      });
    });
  try {
    const promises = products.map(product => {
        return addProductToStore(product);
    });

    return promises; // Returns the results of each addDoc call.
  } catch (error) {
    console.error('Error adding mock sellers to Firestore:', error);
    throw error;
  } 
};


const main = async () => {
  await Promise.all([addMockSellers(mockData), addMockProducts(mockData)]);
  console.log(`Successfully added sellers and products to Firestore.`);
  await terminate(db);
};

main();