<template>
  <div class="product-detail" v-if="product">
    <div class="product-layout">
      <div class="product-image-section">
        <img :src="product.image" :alt="product.name" class="product-image">
      </div>
      
      <div class="product-info-section">
        <h1>{{ product.name }}</h1>
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
export default {
  name: 'ProductDetail',
  data() {
    return {
      quantity: 1,
      product: null,
      products: [
        {
          id: 1,
          name: 'Fresh Organic Tomatoes',
          description: 'Sweet, juicy tomatoes grown without pesticides',
          longDescription: 'These tomatoes are grown using traditional farming methods without the use of synthetic pesticides or fertilizers. They are picked at peak ripeness to ensure maximum flavor and nutritional value.',
          price: 3.99,
          unit: 'lb',
          image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&h=400&fit=crop',
          category: 'Vegetables',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 1,
          sellerName: 'Green Valley Farm',
          sellerDescription: 'Green Valley Farm has been growing organic produce for over 20 years. We believe in sustainable farming practices and providing the community with the freshest, most nutritious food possible.',
          location: 'Green Valley, 15 miles away'
        },
        {
          id: 2,
          name: 'Artisan Sourdough Bread',
          description: 'Traditional sourdough made with local flour',
          longDescription: 'Our sourdough bread is made using a 100-year-old starter culture and locally sourced flour. Each loaf is hand-shaped and baked in a stone oven for that perfect crust and texture.',
          price: 5.50,
          unit: 'loaf',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
          category: 'Bakery',
          organic: false,
          local: true,
          fresh: true,
          sellerId: 2,
          sellerName: 'Rustic Bakery',
          sellerDescription: 'Rustic Bakery specializes in traditional bread-making techniques. We use only the finest ingredients and time-honored methods to create breads that are both delicious and nutritious.',
          location: 'Downtown, 5 miles away'
        },
        {
          id: 3,
          name: 'Fresh Eggs',
          description: 'Farm fresh eggs from free-range chickens',
          longDescription: 'Our eggs come from chickens that roam freely on our farm, eating a natural diet of grass, insects, and organic feed. This results in eggs with rich, golden yolks and superior taste.',
          price: 4.99,
          unit: 'dozen',
          image: 'https://images.unsplash.com/photo-1569288063648-5d2194db4b13?w=600&h=400&fit=crop',
          category: 'Dairy',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 3,
          sellerName: 'Happy Hen Farm',
          sellerDescription: 'Happy Hen Farm raises chickens in a humane, sustainable way. Our birds have plenty of space to roam and access to fresh air and sunshine year-round.',
          location: 'Happy Valley, 8 miles away'
        },
        {
          id: 4,
          name: 'Mixed Herbs Bundle',
          description: 'Fresh basil, rosemary, and thyme',
          longDescription: 'This bundle includes fresh basil, rosemary, and thyme, all grown in our greenhouse without pesticides. Perfect for cooking and garnishing your favorite dishes.',
          price: 2.99,
          unit: 'bundle',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
          category: 'Herbs',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 4,
          sellerName: 'Herb Garden Co',
          sellerDescription: 'Herb Garden Co grows a wide variety of culinary herbs using organic methods. We focus on flavor and freshness, ensuring you get the best herbs for your kitchen.',
          location: 'Herb Garden, 12 miles away'
        },
        {
          id: 5,
          name: 'Grass-Fed Beef',
          description: 'Premium beef from pasture-raised cattle',
          longDescription: 'Our beef comes from cattle that graze on natural grass pastures year-round. This results in leaner, more flavorful meat that is higher in beneficial nutrients.',
          price: 12.99,
          unit: 'lb',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop',
          category: 'Meat',
          organic: false,
          local: true,
          fresh: true,
          sellerId: 5,
          sellerName: 'Prairie Ranch',
          sellerDescription: 'Prairie Ranch raises cattle using traditional ranching methods. Our animals graze on natural grasslands and are never given growth hormones or unnecessary antibiotics.',
          location: 'Prairie Ranch, 25 miles away'
        },
        {
          id: 6,
          name: 'Fresh Strawberries',
          description: 'Sweet, ripe strawberries picked this morning',
          longDescription: 'These strawberries are picked at peak ripeness for maximum sweetness and flavor. Grown without synthetic pesticides and delivered fresh to your door.',
          price: 4.50,
          unit: 'pint',
          image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&h=400&fit=crop',
          category: 'Fruits',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 1,
          sellerName: 'Green Valley Farm',
          sellerDescription: 'Green Valley Farm has been growing organic produce for over 20 years. We believe in sustainable farming practices and providing the community with the freshest, most nutritious food possible.',
          location: 'Green Valley, 15 miles away'
        }
      ]
    }
  },
  mounted() {
    const productId = parseInt(this.$route.params.id)
    this.product = this.products.find(p => p.id === productId)
  },
  methods: {
    increaseQuantity() {
      this.quantity++
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    addToCart() {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find(item => item.id === this.product.id)
      
      if (existingItem) {
        existingItem.quantity += this.quantity
      } else {
        cart.push({
          id: this.product.id,
          name: this.product.name,
          price: this.product.price,
          image: this.product.image,
          quantity: this.quantity
        })
      }
      
      localStorage.setItem('cart', JSON.stringify(cart))
      alert(`Added ${this.quantity} ${this.product.unit || 'item(s)'} to cart!`)
    }
  }
}
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
