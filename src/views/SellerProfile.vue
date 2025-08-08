<template>
  <div class="seller-profile" v-if="seller">
    <div class="seller-header">
      <div class="seller-info">
        <h1>{{ seller.name }}</h1>
        <p class="seller-description">{{ seller.description }}</p>
        <div class="seller-meta">
          <span class="meta-item">
            <strong>Location:</strong> {{ seller.location }}
          </span>
          <span class="meta-item">
            <strong>Since:</strong> {{ seller.since }}
          </span>
          <span class="meta-item">
            <strong>Products:</strong> {{ sellerProducts.length }}
          </span>
        </div>
        <div class="seller-badges">
          <span v-if="seller.organic" class="badge badge-organic">Organic Certified</span>
          <span v-if="seller.local" class="badge badge-local">Local Producer</span>
          <span v-if="seller.family" class="badge badge-fresh">Family Owned</span>
        </div>
      </div>
      
      <div class="seller-image">
        <img :src="seller.image" :alt="seller.name">
      </div>
    </div>
    
    <div class="seller-content">
      <div class="about-section">
        <h2>About {{ seller.name }}</h2>
        <p>{{ seller.longDescription }}</p>
        
        <div class="contact-info">
          <h3>Contact Information</h3>
          <div class="contact-grid">
            <div class="contact-item">
              <strong>Phone:</strong> {{ seller.phone }}
            </div>
            <div class="contact-item">
              <strong>Email:</strong> {{ seller.email }}
            </div>
            <div class="contact-item">
              <strong>Website:</strong> 
              <a :href="seller.website" target="_blank">{{ seller.website }}</a>
            </div>
            <div class="contact-item">
              <strong>Address:</strong> {{ seller.address }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="products-section">
        <h2>Products from {{ seller.name }}</h2>
        
        <div v-if="sellerProducts.length === 0" class="no-products">
          <p>No products available at the moment.</p>
        </div>
        
        <div v-else class="products-grid">
          <div 
            v-for="product in sellerProducts" 
            :key="product.id" 
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
                <router-link :to="`/product/${product.id}`" class="btn">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="loading">
    <p>Loading seller information...</p>
  </div>
</template>

<script>
export default {
  name: 'SellerProfile',
  data() {
    return {
      seller: null,
      sellers: [
        {
          id: 1,
          name: 'Green Valley Farm',
          description: 'Organic produce grown with sustainable farming practices',
          longDescription: 'Green Valley Farm has been growing organic produce for over 20 years. We believe in sustainable farming practices and providing the community with the freshest, most nutritious food possible. Our farm spans 50 acres of certified organic land where we grow a wide variety of vegetables, fruits, and herbs.',
          location: 'Green Valley, 15 miles away',
          since: '2003',
          phone: '(555) 123-4567',
          email: 'info@greenvalleyfarm.com',
          website: 'https://greenvalleyfarm.com',
          address: '123 Farm Road, Green Valley, CA 90210',
          image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
          organic: true,
          local: true,
          family: true
        },
        {
          id: 2,
          name: 'Rustic Bakery',
          description: 'Traditional bread-making with locally sourced ingredients',
          longDescription: 'Rustic Bakery specializes in traditional bread-making techniques. We use only the finest ingredients and time-honored methods to create breads that are both delicious and nutritious. Our sourdough starter is over 100 years old and we source our flour from local mills.',
          location: 'Downtown, 5 miles away',
          since: '2010',
          phone: '(555) 234-5678',
          email: 'hello@rusticbakery.com',
          website: 'https://rusticbakery.com',
          address: '456 Main Street, Downtown, CA 90211',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
          organic: false,
          local: true,
          family: true
        },
        {
          id: 3,
          name: 'Happy Hen Farm',
          description: 'Free-range eggs from humanely raised chickens',
          longDescription: 'Happy Hen Farm raises chickens in a humane, sustainable way. Our birds have plenty of space to roam and access to fresh air and sunshine year-round. We feed them a natural diet of organic grains and allow them to forage for insects and greens.',
          location: 'Happy Valley, 8 miles away',
          since: '2015',
          phone: '(555) 345-6789',
          email: 'eggs@happyhenfarm.com',
          website: 'https://happyhenfarm.com',
          address: '789 Chicken Lane, Happy Valley, CA 90212',
          image: 'https://images.unsplash.com/photo-1569288063648-5d2194db4b13?w=400&h=300&fit=crop',
          organic: true,
          local: true,
          family: true
        },
        {
          id: 4,
          name: 'Herb Garden Co',
          description: 'Fresh culinary herbs grown without pesticides',
          longDescription: 'Herb Garden Co grows a wide variety of culinary herbs using organic methods. We focus on flavor and freshness, ensuring you get the best herbs for your kitchen. Our greenhouse allows us to provide fresh herbs year-round.',
          location: 'Herb Garden, 12 miles away',
          since: '2018',
          phone: '(555) 456-7890',
          email: 'herbs@herbgardenco.com',
          website: 'https://herbgardenco.com',
          address: '321 Herb Way, Herb Garden, CA 90213',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
          organic: true,
          local: true,
          family: false
        },
        {
          id: 5,
          name: 'Prairie Ranch',
          description: 'Grass-fed beef from pasture-raised cattle',
          longDescription: 'Prairie Ranch raises cattle using traditional ranching methods. Our animals graze on natural grasslands and are never given growth hormones or unnecessary antibiotics. We believe in raising animals the way nature intended.',
          location: 'Prairie Ranch, 25 miles away',
          since: '2008',
          phone: '(555) 567-8901',
          email: 'beef@prairieranch.com',
          website: 'https://prairieranch.com',
          address: '654 Ranch Road, Prairie Ranch, CA 90214',
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
          organic: false,
          local: true,
          family: true
        }
      ],
      allProducts: [
        {
          id: 1,
          name: 'Fresh Organic Tomatoes',
          description: 'Sweet, juicy tomatoes grown without pesticides',
          price: 3.99,
          image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=200&fit=crop',
          category: 'Vegetables',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 1
        },
        {
          id: 2,
          name: 'Artisan Sourdough Bread',
          description: 'Traditional sourdough made with local flour',
          price: 5.50,
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop',
          category: 'Bakery',
          organic: false,
          local: true,
          fresh: true,
          sellerId: 2
        },
        {
          id: 3,
          name: 'Fresh Eggs',
          description: 'Farm fresh eggs from free-range chickens',
          price: 4.99,
          image: 'https://images.unsplash.com/photo-1569288063648-5d2194db4b13?w=300&h=200&fit=crop',
          category: 'Dairy',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 3
        },
        {
          id: 4,
          name: 'Mixed Herbs Bundle',
          description: 'Fresh basil, rosemary, and thyme',
          price: 2.99,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
          category: 'Herbs',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 4
        },
        {
          id: 5,
          name: 'Grass-Fed Beef',
          description: 'Premium beef from pasture-raised cattle',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop',
          category: 'Meat',
          organic: false,
          local: true,
          fresh: true,
          sellerId: 5
        },
        {
          id: 6,
          name: 'Fresh Strawberries',
          description: 'Sweet, ripe strawberries picked this morning',
          price: 4.50,
          image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=200&fit=crop',
          category: 'Fruits',
          organic: true,
          local: true,
          fresh: true,
          sellerId: 1
        }
      ]
    }
  },
  computed: {
    sellerProducts() {
      const sellerId = parseInt(this.$route.params.id)
      return this.allProducts.filter(product => product.sellerId === sellerId)
    }
  },
  mounted() {
    const sellerId = parseInt(this.$route.params.id)
    this.seller = this.sellers.find(s => s.id === sellerId)
  }
}
</script>

<style scoped>
.seller-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.seller-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.seller-info h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.seller-description {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.seller-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  color: #666;
}

.seller-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.seller-image {
  display: flex;
  align-items: center;
}

.seller-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}

.seller-content {
  display: grid;
  gap: 3rem;
}

.about-section,
.products-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.about-section h2,
.products-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.about-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.contact-info {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.contact-info h3 {
  margin-bottom: 1rem;
  color: #333;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.contact-item {
  color: #666;
}

.contact-item a {
  color: #4CAF50;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
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
}

.no-products {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .seller-header {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .seller-image img {
    height: 250px;
  }
  
  .seller-meta {
    flex-direction: column;
    gap: 1rem;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
