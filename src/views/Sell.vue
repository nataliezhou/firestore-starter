<template>
  <div class="sell-page">
    <h2>List a New Product</h2>
    <form @submit.prevent="addProduct">
      <div class="form-group">
        <label for="name">Product Name</label>
        <input type="text" id="name" v-model="name" required />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="description" required></textarea>
      </div>
      <div class="form-group">
        <label for="price">Price</label>
        <input type="number" id="price" v-model.number="price" required min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label for="stock">Stock</label>
        <input type="number" id="stock" v-model.number="stock" required min="0" />
      </div>
      <div class="form-group">
        <label for="image">Product Image</label>
        <input type="file" id="image" ref="imageInput" accept="image/*" @change="handleFileUpload" required />
      </div>
      <div class="form-group">
        <label for="category">Category</label>
        <select id="category" v-model="category" required>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <button type="submit">List Product</button>
    </form>
  </div>
</template>

<script>
import { addProduct } from '../services/firestore.js';
import { getUserId } from '../services/auth.js';
import { getCurrentUser } from '../services/auth.js';


export default {
  name: 'SellPage',
  data() {
    return {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      categories: ['Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Herbs'],
      selectedFile: null,
    };
  },
  methods: {
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    },
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    async addProduct() {
      const sellerId = getUserId();
      if (!sellerId) {
        alert('You must be logged in to list a product.');
        return;
      }
      const seller = getCurrentUser();
      let imageUrl = ''; // Initialize imageUrl
      if (this.selectedFile) {
        imageUrl = await this.getBase64(this.selectedFile); // Encode image as Base64
      } else {
        alert('Please select an image to upload.');
        return; // Stop the function if no file is selected
      }
      const newProduct = {
        name: this.name,
        category: this.category,
        description: this.description,
        price: parseFloat(this.price),
        stock: parseInt(this.stock),
        image: imageUrl,
        numRatings: 0,
        avgRating: 0,
        sellerId: sellerId,
        sellerName: seller ? seller.displayName : 'Unknown',
             sellerImage: seller && seller.image ? seller.image : 'https://www.gravatar.com/avatar/?d=mp',
      };
      // Call the addProduct function from firestore.js to save to Firestore
      await addProduct(newProduct);
      this.$router.push('/'); // Redirect to home page after adding
    },
  },
};
</script>

<style scoped>
.sell-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background-color: #36a46f;
}
</style>
