import { db } from '../src/firebase.js'
import mockData from './mockSellers.json' with { type: "json" }
import { addDoc, collection, query, orderBy, limit, getDocs, writeBatch } from 'firebase/firestore';

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
    await deleteQueryBatch(db, query);
  }
}


const addSellerToStore = async (seller) => {
    await addDoc(collection(db, 'sellers'), seller);
}   

const addProductToStore = async (product) => {
    await addDoc(collection(db, 'products'), product);
}   

/**
 * Adds a list of generated sellers to Firestore database.
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
      photo: seller.image,
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
 * Adds a list of generated products to Firestore database.
 * @param {Product[]} productsArr
 * @returns {Promise[]} List of promises
 */
const addMockProducts = async (dataFile) => {
    await deleteCollection('products');
    const products = [];

  dataFile.allProducts.forEach(product => {

    // Creating mock data for keys that don't exist in the source data
    const numRatings = Math.floor(Math.random() * 500) + 50; // Random number between 50 and 550
    const avgRating = (Math.random() * 2) + 3; // Random number between 3.0 and 5.0

    products.push({
      name: product.name,
      category: product.category,
      price: product.price,
      numRatings: numRatings,
      avgRating: parseFloat(avgRating.toFixed(2)),
      photo: product.image,
    });
  });

  try {
  // now add to firestore
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
};

main();