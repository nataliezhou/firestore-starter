<template>
  <div class="cart">
    <h1>Shopping Cart</h1>
    
    <div v-if="!isAuthenticated" class="auth-required">
      <p>Please log in to view your cart</p>
      <button @click="$emit('show-login')" class="btn">Login</button>
    </div>
    
    <div v-else-if="loading" class="loading">
      <p>Loading cart...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <p>Your cart is empty</p>
      <router-link to="/" class="btn">Continue Shopping</router-link>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div 
          v-for="item in cartItems" 
          :key="item.id" 
          class="cart-item card"
        >
          <div class="item-image">
            <img :src="item.image" :alt="item.name">
          </div>
          
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p class="item-price">${{ item.price }} each</p>
          </div>
          
          <div class="item-quantity">
            <label>Quantity:</label>
            <div class="quantity-controls">
              <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
              <span class="quantity-display">{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
            </div>
          </div>
          
          <div class="item-total">
            <span class="total-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          
          <button @click="removeItem(item)" class="remove-btn">Remove</button>
        </div>
      </div>
      
      <div class="cart-summary card">
        <h2>Order Summary</h2>
        
        <div class="summary-item">
          <span>Subtotal:</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        
        <div class="summary-item">
          <span>Delivery:</span>
          <span>${{ deliveryFee.toFixed(2) }}</span>
        </div>
        
        <div class="summary-item total">
          <span>Total:</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>
        
        <div class="delivery-info">
          <h3>Delivery Information</h3>
          <p>Local delivery within 24 hours</p>
          <p>Free delivery on orders over $50</p>
        </div>
        
        <button @click="checkout" class="btn checkout-btn">
          Proceed to Checkout
        </button>
        
        <router-link to="/" class="btn btn-secondary continue-shopping">
          Continue Shopping
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getCart, updateCartItemQuantity, clearCart } from '../services/firestore'
import { getUserId, isAuthenticated } from '../services/auth'

export default {
  name: 'Cart',
  data() {
    return {
      cartItems: [],
      deliveryFee: 5.99,
      loading: false,
      error: null,
      isAuthenticated: false
    }
  },
  computed: {
    subtotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },
    total() {
      return this.subtotal + this.deliveryFee
    }
  },
  async mounted() {
    this.isAuthenticated = isAuthenticated()
    if (this.isAuthenticated) {
      await this.loadCart()
    }
  },
  methods: {
    async loadCart() {
      this.loading = true
      this.error = null
      
      try {
        const userId = getUserId()
        this.cartItems = await getCart(userId)
      } catch (error) {
        this.error = 'Failed to load cart. Please try again.'
        console.error('Error loading cart:', error)
      } finally {
        this.loading = false
      }
    },
    
    async increaseQuantity(item) {
      try {
        const userId = getUserId()
        await updateCartItemQuantity(userId, item.id, item.quantity + 1)
        item.quantity++
      } catch (error) {
        alert('Failed to update quantity. Please try again.')
        console.error('Error updating quantity:', error)
      }
    },
    
    async decreaseQuantity(item) {
      if (item.quantity > 1) {
        try {
          const userId = getUserId()
          await updateCartItemQuantity(userId, item.id, item.quantity - 1)
          item.quantity--
        } catch (error) {
          alert('Failed to update quantity. Please try again.')
          console.error('Error updating quantity:', error)
        }
      }
    },
    
    async removeItem(item) {
      try {
        const userId = getUserId()
        await updateCartItemQuantity(userId, item.id, 0) // Remove item
        const index = this.cartItems.findIndex(cartItem => cartItem.id === item.id)
        if (index > -1) {
          this.cartItems.splice(index, 1)
        }
      } catch (error) {
        alert('Failed to remove item. Please try again.')
        console.error('Error removing item:', error)
      }
    },
    
    async checkout() {
      // In a real app, this would redirect to a payment processor
      alert('Checkout functionality would be integrated with a payment processor like Stripe or PayPal. For now, this is a demo.')
      
      try {
        // Clear cart after successful checkout
        const userId = getUserId()
        await clearCart(userId)
        this.cartItems = []
      } catch (error) {
        console.error('Error clearing cart:', error)
      }
    }
  }
}
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 0 auto;
}

.cart h1 {
  margin-bottom: 2rem;
  color: #333;
}

.auth-required, .loading, .error, .empty-cart {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.auth-required p, .loading p, .error p, .empty-cart p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.error {
  color: #d32f2f;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
}

.item-image {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.item-price {
  color: #666;
  font-size: 0.9rem;
}

.item-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.item-quantity label {
  font-size: 0.9rem;
  color: #666;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.quantity-btn:hover {
  background: #f0f0f0;
}

.quantity-display {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  text-align: center;
}

.total-price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #4CAF50;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.remove-btn:hover {
  background: #c82333;
}

.cart-summary {
  padding: 2rem;
  height: fit-content;
}

.cart-summary h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item.total {
  font-size: 1.2rem;
  font-weight: bold;
  color: #4CAF50;
  border-bottom: none;
  border-top: 2px solid #4CAF50;
  padding-top: 1rem;
  margin-top: 1rem;
}

.delivery-info {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.delivery-info h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.delivery-info p {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.continue-shopping {
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    grid-template-rows: auto auto auto;
    gap: 0.5rem;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
  
  .item-quantity,
  .item-total {
    grid-column: 2;
  }
  
  .remove-btn {
    grid-column: 1 / -1;
    justify-self: center;
  }
}
</style>
