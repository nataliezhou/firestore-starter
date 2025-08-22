import 'dotenv/config';
import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import fs from 'fs';

const UNSPLASH_API_KEY = process.env.VITE_UNSPLASH_API_KEY;

if (!UNSPLASH_API_KEY) {
  console.error("Unsplash API key is missing. Make sure it's in your .env file.");
  process.exit(1);
}

const unsplash = createApi({
  accessKey: UNSPLASH_API_KEY,
  fetch: nodeFetch
});

// --- Data Generation Configuration ---
const categories = ["Vegetables", "Fruits", "Dairy", "Meat", "Bakery", "Herbs"];
const sellerTypes = ["Farm", "Bakery", "Chef", "Garden"];
const NUM_SELLERS = 25;
const NUM_PRODUCTS = 30;

const priceRanges = {
 "Vegetables": { min: 1.5, max: 5.0 },
 "Fruits": { min: 2.0, max: 6.5 },
 "Dairy": { min: 3.0, max: 8.0 },
 "Meat": { min: 5.0, max: 15.0 },
 "Bakery": { min: 2.5, max: 7.0 },
 "Herbs": { min: 1.0, max: 3.0 },
 "Pantry": { min: 1.0, max: 10.0 }
};

const categorySellerMap = {
  "Vegetables": ["Farm", "Garden"],
  "Fruits": ["Farm", "Garden"],
  "Dairy": ["Farm"],
  "Meat": ["Farm"],
  "Bakery": ["Bakery"],
  "Herbs": ["Farm", "Garden"],
  "Pantry": ["Chef", "Farm"],
};


// --- Data Generation Functions ---

/**
 * Generates a list of mock sellers.
 * @returns {Array<Object>} An array of seller objects.
 */
const generateSellers = () => {
  const generatedSellers = [];
  for (let i = 1; i <= NUM_SELLERS; i++) {
    const sellerType = sellerTypes[Math.floor(Math.random() * sellerTypes.length)];
    const name = `${sellerType} #${i}`;
    const description = `Fresh, high-quality products from ${name}.`;
    const longDescription = `At ${name}, we are dedicated to providing the highest quality products. Our ${sellerType.toLowerCase()} has been operating since ${2024 - Math.floor(Math.random() * 20)}. We believe in sustainable practices and community engagement.`;
    const location = `Cityville, ${Math.floor(Math.random() * 25) + 1} miles away`;
    const since = `${2024 - Math.floor(Math.random() * 20)}`;
    const phone = `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    const email = `contact@${name.replace(/ /g, '').replace('#', '')}.com`;
    const website = `www.${name.replace(/ /g, '').replace('#', '')}.com`;
    const address = `${i * 100} Main St, Cityville, ST 12345`;
    const organic = Math.random() > 0.4;
    const local = true;
    const family = Math.random() > 0.5;

    generatedSellers.push({
      id: i,
      name,
      description,
      longDescription,
      location,
      since,
      phone,
      email,
      website,
      address,
      image: `https://source.unsplash.com/400x300/?${sellerType.toLowerCase()}`,
      organic,
      local,
      family,
    });
  }
  return generatedSellers;
};

/**
 * Generates a list of mock products and assigns them to sellers.
 * @param {Array<Object>} sellers - The array of generated sellers.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
 */
const generateProducts = async (sellers) => {
  const generatedProducts = [];
  let productId = 1;

  for (let i = 0; i < NUM_PRODUCTS; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const allowedSellerTypes = categorySellerMap[category] || sellerTypes; // Use fallback if category not mapped

    // Filter sellers by allowed types
    const potentialSellers = sellers.filter(seller => {
      const sellerType = seller.name.split(' ')[0]; // Extract seller type from name
      return allowedSellerTypes.includes(sellerType);
    });

    const seller = potentialSellers.length > 0 ? potentialSellers[Math.floor(Math.random() * potentialSellers.length)] : sellers[Math.floor(Math.random() * sellers.length)]; // Fallback to any seller if no suitable seller is found
    var name = `Organic ${category} #${productId}`;
    var description = `A delicious ${name} from ${seller.name}.`;
    const range = priceRanges[category] || { min: 1, max: 10 }; // Default range
    const price = parseFloat((Math.random() * (range.max - range.min) + range.min).toFixed(2));
    const organic = Math.random() > 0.2;
    const local = true;
    const fresh = Math.random() > 0.3;

    let imageUrl = `https://source.unsplash.com/300x200/?${category}`;
    try {
      const unsplashResponse = await unsplash.photos.getRandom({
        query: `${category}, food, market, fresh, produce`,
        orientation: 'landscape',
      });
      if (unsplashResponse.response) {
        imageUrl = unsplashResponse.response.urls.small;
        description = unsplashResponse.alt_description
      }
    } catch (error) {
      console.error(`Error fetching image for category ${category}:`, error.message);
      // Fallback to source.unsplash.com if API fails
      imageUrl = `https://source.unsplash.com/300x200/?${category},food,market,fresh,produce`;
    }

    generatedProducts.push({
      id: productId,
      name,
      description,
      price,
      image: imageUrl,
      category,
      organic,
      local,
      fresh,
      sellerId: seller.id,
    });
    productId++;
  }
  return generatedProducts;
};

const main = async () => {
  const mockDataPath = './scripts/mockData.json';
  console.log('Generating new mock data...');

  const generatedSellers = generateSellers();
  const generatedProducts = await generateProducts(generatedSellers); // Await the promise

  const data = { sellers: generatedSellers, products: generatedProducts };
  fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));

  console.log(`New mock data generated and saved to ${mockDataPath}`);

};

main();
export { generateSellers, generateProducts };