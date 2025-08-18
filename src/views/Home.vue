<template>
  <div class="home">
    <div class="hero">
      <h1>Fresh Local Food</h1>
      <p>Support local farmers, bakers, and artisans in your community</p>
      <div class="search-container">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search for products..."
          class="search-input"
          @input="handleSearch"
        >
        <button class="btn" @click="handleSearch">Search</button>
      </div>
    </div>

    <div class="filters mb-4">
      <button 
        v-for="category in categories" 
        :key="category"
        @click="handleCategoryFilter(category)"
        :class="['filter-btn', { active: selectedCategory === category }]"
      >
        {{ category }}
      </button>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading products...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else class="products-grid">
      <router-link to="/sell" class="add-product-card card">
        <div class="add-product-card-content">
          <span class="plus-icon">+</span>
          <h3>List Your Product</h3>
          <p>Join our community of sellers.</p>
        </div>
      </router-link>
      <div 
        v-for="product in filteredProducts" :key="product.id" 
        class="product-card card"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name">
        </div>
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-badges">
            <span v-if="product.organic" class="badge badge-organic">Organic</span>
            <span v-if="product.local" class="badge badge-local">Local</span>
            <span v-if="product.fresh" class="badge badge-fresh">Fresh</span>
          </div>
          <div class="product-footer">
            <span class="price">${{ product.price }}</span>
            <button @click="addToCart(product)" class="btn" :disabled="!isAuthenticated">
              {{ isAuthenticated ? 'Add to Cart' : 'Login to Add' }}
            </button>
          </div>
          <router-link :to="`/seller/${product.sellerId}`" class="seller-link">
            By {{ product.sellerName }}
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
      <p>No products found. Try adjusting your search or filters.</p>
    </div>
  </div>
</template>

<script>
import { getProducts, getProductsByCategory, searchProducts, addToCart } from '../services/firestore'
import { isAuthenticated, getUserId } from '../services/auth'

export default {
  name: 'Home',
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'All',
      categories: ['All', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Herbs'],
      products: [],
      filteredProducts: [],
      loading: false,
      error: null,
      isAuthenticated: false
    }
  },
  async mounted() {
    this.isAuthenticated = isAuthenticated()
    await this.loadProducts()
  },
  methods: {
    async loadProducts() {
      this.loading = true
      this.error = null
      
      try {
        this.products = await getProducts()
        this.filteredProducts = this.products
      } catch (error) {
        this.error = 'Failed to load products. Please try again.'
        console.error('Error loading products:', error)
      } finally {
        this.loading = false
      }
    },

    async handleCategoryFilter(category) {
      this.selectedCategory = category
      this.loading = true
      
      try {
        if (category === 'All') {
          this.products = await getProducts()
        } else {
          this.products = await getProductsByCategory(category)
        }
        this.filteredProducts = this.products
      } catch (error) {
        this.error = 'Failed to filter products. Please try again.'
        console.error('Error filtering products:', error)
      } finally {
        this.loading = false
      }
    },

    async handleSearch() {
      if (!this.searchQuery.trim()) {
        this.filteredProducts = this.products
        return
      }
      
      this.loading = true
      
      try {
        this.filteredProducts = await searchProducts(this.searchQuery)
      } catch (error) {
        this.error = 'Failed to search products. Please try again.'
        console.error('Error searching products:', error)
      } finally {
        this.loading = false
      }
    },

    async addToCart(product) {
      if (!this.isAuthenticated) {
        alert('Please log in to add items to your cart.')
        return
      }
      
      try {
        const userId = getUserId()
        await addToCart(userId, product)
        alert('Added to cart!')
      } catch (error) {
        alert('Failed to add to cart. Please try again.')
        console.error('Error adding to cart:', error)
      }
    }
  }
}
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.search-container {
  display: flex;
  max-width: 500px;
  margin: 0 auto;
  gap: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #4CAF50;
  background: white;
  color: #4CAF50;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

/* Style for the 'All' category button */
.filter-btn:first-child {
  border-color: #ccc;
  color: #666;
}

.filter-btn:first-child.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

/* Styles for category buttons other than 'All' */
.filter-btn:not(:first-child):hover,
.filter-btn:not(:first-child).active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

/* Remove the old sell button style */
/*
.sell-button {
  background-color: #ff9800; 
}
*/
.loading, .error, .no-products {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #d32f2f;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.product-card {
  display: flex;
  flex-direction: column;
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 1rem;
  flex: 1;
}

.product-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.seller-link {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.seller-link:hover {
  color: #4CAF50;
}

.btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Card for adding a new product */
.add-product-card {
 display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
 background-color: #E8F5E9;
 border: 1px solid #ccc;
  cursor: pointer;
}

.add-product-card:hover {
 background-color: #d7e9d8;
}

.add-product-card-content {
 display: flex;
 flex-direction: column;
 align-items: center;
  margin-bottom: 0.5rem;
}

.add-product-card-content h3 {
  color: black;
  margin-bottom: 0.5rem;
}

.plus-icon {
  font-weight: bold;
  font-size: 60px; /* Larger plus sign */
 color: #42b983;
}

.add-product-card-content p {
  font-size: 15px; /* Slightly larger subtext font size */
 color: #555;
}
</style>


