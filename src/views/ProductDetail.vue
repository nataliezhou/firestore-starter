<template>
  <div class="product-detail" v-if="product">
    <div class="product-layout">
      <div class="product-image-section">
        <img :src="product.image" :alt="product.name" class="product-image">
      </div>
      
      <div class="product-info-section">
        <h1>{{ product.name }}</h1>
        <div v-if="product.avgRating" class="product-rating">
          <i class="fas fa-star"></i>
          <span>{{ product.avgRating.toFixed(1) }}</span>
        </div>
        <p class="product-description">{{ product.description }}</p>
        
        <div class="product-badges">
          <span v-if="product.organic" class="badge badge-organic">Organic</span>
          <span v-if="product.local" class="badge badge-local">Local</span>
          <span v-if="product.fresh" class="badge badge-fresh">Fresh</span>
        </div>
        
        <div class="product-meta">
          <div class="meta-item">
            <strong>Category:</strong> {{ product.category }}
          </div>
          <div class="meta-item">
            <strong>Seller:</strong> 
            <router-link :to="`/seller/${product.sellerId}`" class="seller-link">
              {{ product.sellerName }}
            </router-link>
          </div>
          <div class="meta-item">
            <strong>Location:</strong> {{ product.location || 'Local Area' }}
          </div>
        </div>
        
        <div class="purchase-section">
          <div class="price-section">
            <span class="price">${{ product.price }}</span>
            <span class="unit">per {{ product.unit || 'item' }}</span>
          </div>
          
          <div class="quantity-section">
            <label for="quantity">Quantity:</label>
            <div class="quantity-controls">
              <button @click="decreaseQuantity" class="quantity-btn">-</button>
              <input 
                id="quantity"
                v-model.number="quantity" 
                type="number" 
                min="1" 
                class="quantity-input"
              >
              <button @click="increaseQuantity" class="quantity-btn">+</button>
            </div>
          </div>
          
          <div class="total-section">
            <strong>Total: ${{ (product.price * quantity).toFixed(2) }}</strong>
          </div>
          
          <button @click="addToCart" class="btn add-to-cart-btn">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
    
    <div class="additional-info">
      <h2>About this product</h2>
      <p>{{ product.longDescription || 'This is a high-quality local product sourced from trusted farmers and artisans in your community.' }}</p>
      
      <div class="seller-info">
        <h3>About the seller</h3>
        <p>{{ product.sellerDescription || `${product.sellerName} is a trusted local producer committed to quality and sustainability.` }}</p>
        <router-link :to="`/seller/${product.sellerId}`" class="btn btn-secondary">
          View Seller Profile
        </router-link>
      </div>
    </div>
  </div>
  
  <div v-else class="loading">
    <p>Loading product...</p>
  </div>
</template>

<script>
import { watchProduct, updateCartItemQuantity } from '../services/firestore';
import { getUserId, isAuthenticated } from '../services/auth';

export default {
  name: 'ProductDetail',
  data() {
    return {
      quantity: 1,
      product: null,
      isAuthenticated: false
    };
  },
  mounted() {
    this.isAuthenticated = isAuthenticated();
    const productId = this.$route.params.id;
    watchProduct(productId, (product) => {
      this.product = product;
    });
  },
  methods: {
    increaseQuantity() {
      this.quantity++;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    async addToCart() {
      if (!this.isAuthenticated) {
        alert('Please log in to add items to your cart.');
        return;
      }
      try {
        const userId = getUserId();
        await updateCartItemQuantity(userId, this.product, this.quantity);
        alert(`Added ${this.quantity} ${this.product.unit || 'item(s)'} to cart!`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.product-image-section {
  display: flex;
  align-items: center;
}

.product-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info-section h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #f59e0b; /* Gold color for stars */
}

.product-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.product-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.product-meta {
  margin-bottom: 2rem;
}

.meta-item {
  margin-bottom: 0.5rem;
  color: #666;
}

.seller-link {
  color: #4CAF50;
  text-decoration: none;
}

.seller-link:hover {
  text-decoration: underline;
}

.purchase-section {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.price-section {
  margin-bottom: 1.5rem;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: #4CAF50;
}

.unit {
  color: #666;
  margin-left: 0.5rem;
}

.quantity-section {
  margin-bottom: 1.5rem;
}

.quantity-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
}

.quantity-btn:hover {
  background: #f0f0f0;
}

.quantity-input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.total-section {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
}

.additional-info {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.additional-info h2 {
  margin-bottom: 1rem;
  color: #333;
}

.additional-info p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.seller-info {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.seller-info h3 {
  margin-bottom: 1rem;
  color: #333;
}

.seller-info p {
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-image {
    height: 300px;
  }
}
</style>