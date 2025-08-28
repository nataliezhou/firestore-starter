<template>
  <div class="home">
    <div class="hero">
      <h1>Fresh Local Food</h1>
      <p>Support Bay Area local farmers, bakers, and artisans</p>
    </div>

    <div class="filters mb-4">
      <div class="category-filters">
        <button 
          v-for="category in categories" 
          :key="category"
          @click="handleCategoryFilter(category)"
          :class="['filter-btn', { active: selectedCategory === category }]"
        >
          {{ category }}
        </button>
      </div>

      <div class="slider-filters">
        <div class="form-group">
          <label>Price Range</label>
          <vue-slider v-model="priceRange" :max="maxPriceValue" :enable-cross="false" @mouseup="applyFilters"></vue-slider>
          <div class="price-range-values">
            <span>Min: ${{ priceRange[0] }}</span>
            <span>Max: ${{ priceRange[1] }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Minimum Rating</label>
          <vue-slider v-model="minRating" :max="5" :interval="0.1" @mouseup="applyFilters"></vue-slider>
          <div class="rating-value">
            <span>Min: {{ minRating }}</span>
          </div>
        </div>
      </div>
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
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
          <div v-if="product.avgRating" class="product-rating">
            <i class="fas fa-star"></i>
            <span>Rating: {{ product.avgRating.toFixed(1) }} ★</span>

          </div>
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

    <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
      <p>No products found. Try adjusting your search or filters.</p>
    </div>
  </div>
</template>

<script>
import { filterProducts, watchProduct } from '../services/firestore';
import { incrementQuantity, decrementQuantity, getCart, watchCart } from '../services/cart';
import { isAuthenticated, getUserId, onAuthStateChange } from '../services/auth';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';

export default {
  name: 'Home',
  components: { VueSlider },
  data() {
    return {
      searchQuery: '',
      selectedCategory: 'All',
      categories: ['All', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Herbs'],
      filteredProducts: [],
      loading: false,
      error: null,
      isAuthenticated: false,
      cart: [],
      lastDoc: null,
      hasMore: true,
      productListeners: {},
      priceRange: [0, 25],
      maxPriceValue: 25,
      minRating: 0,
      cartUnwatch: null,
    };
  },
  async mounted() {
    this.isAuthenticated = isAuthenticated()
    onAuthStateChange((user) => {
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        this.setupCartWatcher();
      } else if (this.cartUnwatch) {
        this.cartUnwatch();
        this.cart = [];
      }
    });
    await this.applyFilters() // Load all products initially
  },
  beforeUnmount() {
    for (const productId in this.productListeners) {
      if (this.productListeners[productId]) {
        this.productListeners[productId]();
        delete this.productListeners[productId];
      }
    }
    if (this.cartUnwatch) {
      this.cartUnwatch();
    }
  },
  methods: { 
    async setupCartWatcher() {
      this.cart = await getCart();
      this.updateProductQuantities();
      this.cartUnwatch = watchCart((cart) => {
        this.cart = cart;
        this.updateProductQuantities();
      });
    },
    updateProductQuantities() {
      this.filteredProducts.forEach(product => {
        const cartItem = this.cart.find(item => item.id === product.id);
        product.quantity = cartItem ? cartItem.quantity : 0;
      });
    },
    async handleCategoryFilter(category) {
      this.selectedCategory = category;
      await this.applyFilters();
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

    async applyFilters(loadMore = false) {
      this.loading = true;
      this.error = null;
      
      const filters = {
        category: this.selectedCategory,
        minPrice: this.priceRange[0],
        maxPrice: this.priceRange[1],
        minRating: this.minRating
      };

      try {
        const newProducts = await filterProducts(filters, loadMore ? this.lastDoc : null);

        this.filteredProducts = newProducts.map(product => ({
          ...product,
          quantity: 0
        }));

        this.updateProductQuantities();

        this.filteredProducts.forEach(product => {
          if (!this.productListeners[product.id]) {
            this.productListeners[product.id] = watchProduct(product.id, (updatedProductData) => { 
              const index = this.filteredProducts.findIndex(p => p.id === updatedProductData.id);
              if (index !== -1) {
                if (updatedProductData.stock === 0) {
                  this.filteredProducts.splice(index, 1);
                  if (this.productListeners[updatedProductData.id]) {
                    this.productListeners[updatedProductData.id]();
                    delete this.productListeners[updatedProductData.id];
                  }
                } else {
                  this.filteredProducts[index].stock = updatedProductData.stock;
                }
              }
            });
          }
        });

        this.hasMore = newProducts.length === 20; // Assuming page size is 20
        if (newProducts.length > 0) {
          this.lastDoc = newProducts[newProducts.length - 1];
        }
      } catch (error) {
        this.error = 'Failed to load products. Please try again.';
      }
      this.loading = false;
    },
    async incrementQuantity(product) {
      product.quantity++;
      await incrementQuantity(product);
    },
    async decrementQuantity(product) {
      if (product.quantity > 0) {
        product.quantity--;
        await decrementQuantity(product);
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
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.slider-filters {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.form-group {
  width: 200px;
}

.price-range-values, .rating-value {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: #666;
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

.filter-btn:first-child {
  border-color: #ccc;
  color: #666;
}

.filter-btn:first-child.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.filter-btn:not(:first-child):hover,
.filter-btn:not(:first-child).active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

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
  line-height: 1.2;
  color: #333;
}

.product-price {
  font-weight: bold;
  color: #4CAF50;
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

.seller-link {
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
}

.seller-link:hover {
  color: #4CAF50;
}

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
  font-size: 60px;
 color: #42b983;
}

.add-product-card-content p {
  font-size: 15px;
 color: #555;
}
.stock {
 font-size: 0.9rem;
 margin-bottom: 0.2rem;
}
.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.2rem 0.5rem;
  font-size: 1.5rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}
</style>