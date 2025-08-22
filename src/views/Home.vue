<template>
  <div class="home">
    <div class="hero">
      <h1>Fresh Local Food</h1>
      <p>Support local farmers, bakers, and artisans in your community</p>
      <div>
        <button class="btn" @click="openFilterPopup">Filter</button>
        <!-- <button class="btn" @click="handleSearch">Search</button> -->
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
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-details">
            <div>
              <p class="stock" v-if="product.stock > 0">In Stock: {{ product.stock }}</p>
              <router-link :to="`/seller/${product.sellerId}`" class="seller-link">
                By {{ product.sellerName }}
              </router-link>
            </div>
            <div v-if="isAuthenticated" class="quantity-controls">
              <button class="btn btn-sm" @click.prevent.stop="decrementQuantity(product)">-</button>
              <span class="quantity">{{ product.quantity }}</span>
              <button class="btn btn-sm" @click.prevent.stop="incrementQuantity(product)">+</button>
            </div>
          </div>
          
        </div>
      </div>
    </div>

    <div v-if="hasMore && filteredProducts.length > 0" class="text-center mt-4">
      <button class="btn">Load More</button>
    </div>



    <FilterPopup 
      :isVisible="isFilterPopupVisible"
      @apply-filters="applyFilters"
      @close="closeFilterPopup"
    />

    <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
      <p>No products found. Try adjusting your search or filters.</p>
    </div>
  </div>
</template>

<script>
import { getProducts, getProductsByCategory, addToCart, filterProducts, updateProductStock } from '../services/firestore';
import { isAuthenticated, getUserId, onAuthStateChange } from '../services/auth';
import FilterPopup from '../components/FilterPopup.vue';

export default {
  name: 'Home',
  components: { FilterPopup }, // Register FilterPopup
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'All',
      categories: ['All', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Herbs'],
      filteredProducts: [],
      loading: false,
      error: null,
      isAuthenticated: false,
      isFilterPopupVisible: false, // Added filter popup visibility
      cart: [], // Initialize cart as an empty array
      lastDoc: null, // To store the last fetched document for pagination
      hasMore: true, // To indicate if there are more products to load
    };
  },
  async mounted() {
    this.isAuthenticated = isAuthenticated()
    onAuthStateChange((user) => {
      // Update local isAuthenticated state when auth state changes
      this.isAuthenticated = !!user;
    });
    // Load initial products or apply default filters if needed
    await this.applyFilters({}) // Load all products initially
  },
  methods: { 
    async loadProducts() {
      try {
        if (category === 'All') {
          this.filteredProducts = await getProducts()
        } else {
          this.filteredProducts = await getProductsByCategory(category)
        }
      } catch (error) {
        this.error = 'Failed to filter products. Please try again.'
        console.error('Error filtering products:', error)
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
    },

    openFilterPopup() {
      this.isFilterPopupVisible = true;
    },

    closeFilterPopup() {
      this.isFilterPopupVisible = false;
    },

    async applyFilters(filters, loadMore = false) {
      this.loading = true;
      this.error = null;
      
      try {
        const newProducts = await filterProducts(filters, loadMore ? this.lastDoc : null);

        // Add quantity property to each product and initialize to 0
        const productsWithQuantity = newProducts.map(product => ({
          ...product,
          quantity: 0
        }));

        if (loadMore) {
          this.filteredProducts = [...this.filteredProducts, ...productsWithQuantity];
        } else {
          this.filteredProducts = productsWithQuantity;
        }

        // Debugging log to check product quantities
        console.log('Filtered products with quantities:', this.filteredProducts);

        this.hasMore = newProducts.length === 20; // Assuming page size is 20
        if (newProducts.length > 0) {
          this.lastDoc = newProducts[newProducts.length - 1];
        }
      } catch (error) {
        this.error = 'Failed to load products. Please try again.';
      }
      this.loading = false;
      this.closeFilterPopup();
    },
    incrementQuantity(product) {
      console.log('Incrementing quantity for:', product.name); // Debugging log
      if (product.stock > 0) {
        product.quantity++;
        product.stock--; // Decrement local stock
        try {
          updateProductStock(product.id, product.stock);
        } catch (error) {
          console.error('Error updating product stock:', error);
        }
      }
    },
    decrementQuantity(product) {
      console.log('Decrementing quantity for:', product.name); // Debugging log
      if (product.quantity > 0) {
        product.quantity--;
        product.stock++; // Increment local stock
        try {
          updateProductStock(product.id, product.stock);
        } catch (error) {
          console.error('Error updating product stock:', error);
        }
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

.product-name {
  margin-bottom: 0.5rem;
}

.product-info h3 {
  margin-bottom: 0.5rem;
  line-height: 1.2; /* Adjust line height for smaller space */
  color: #333;
}

.product-description {
  color: #666;
  margin-bottom: 1rem;
  flex: 1;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.product-footer {
  margin-top: auto; /* Push footer to the bottom */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-to-cart-btn {
  width: 100%;
}

.seller-link {
  color: #555;
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
.stock {
 font-size: 0.9rem;
 margin-bottom: 0.2rem; /* Adjust spacing between stock and seller */
}
.quantity-controls {
  display: flex;
  align-items: center; /* Align buttons to the top */
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.2rem 0.5rem;
  font-size: 1.5rem;
}
</style>


