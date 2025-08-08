<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">
          🥕 Local Food Market
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/cart" class="nav-link cart-link">
            🛒 Cart ({{ cartItemCount }})
          </router-link>
          <div v-if="!isAuthenticated" class="auth-links">
            <button @click="showLoginModal = true" class="nav-link auth-btn">Login</button>
            <button @click="showRegisterModal = true" class="nav-link auth-btn">Register</button>
          </div>
          <div v-else class="user-menu">
            <span class="user-name">{{ currentUser?.displayName || 'User' }}</span>
            <button @click="logout" class="nav-link auth-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2025 Local Food Marketplace. Supporting local farmers and artisans.</p>
    </footer>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="modal-overlay" @click="showLoginModal = false">
      <div class="modal" @click.stop>
        <h2>Login</h2>
        <form @submit.prevent="login">
          <div class="form-group">
            <label>Email:</label>
            <input v-model="loginForm.email" type="email" required>
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input v-model="loginForm.password" type="password" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn">Login</button>
            <button type="button" class="btn btn-secondary" @click="showLoginModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click="showRegisterModal = false">
      <div class="modal" @click.stop>
        <h2>Register</h2>
        <form @submit.prevent="register">
          <div class="form-group">
            <label>Name:</label>
            <input v-model="registerForm.displayName" type="text" required>
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input v-model="registerForm.email" type="email" required>
          </div>
          <div class="form-group">
            <label>Password:</label>
            <input v-model="registerForm.password" type="password" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn">Register</button>
            <button type="button" class="btn btn-secondary" @click="showRegisterModal = false">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { getCart } from './services/firestore'
import { loginUser, registerUser, logoutUser, onAuthStateChange, getCurrentUser } from './services/auth'

export default {
  name: 'App',
  data() {
    return {
      cartItemCount: 0,
      isAuthenticated: false,
      currentUser: null,
      showLoginModal: false,
      showRegisterModal: false,
      loginForm: {
        email: '',
        password: ''
      },
      registerForm: {
        displayName: '',
        email: '',
        password: ''
      }
    }
  },
  async mounted() {
    // Listen for auth state changes
    onAuthStateChange((user) => {
      this.isAuthenticated = !!user
      this.currentUser = user
      if (user) {
        this.loadCart()
      } else {
        this.cartItemCount = 0
      }
    })
  },
  methods: {
    async loadCart() {
      try {
        const userId = this.currentUser?.uid
        if (userId) {
          const cartItems = await getCart(userId)
          this.cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    },
    
    async login() {
      try {
        await loginUser(this.loginForm.email, this.loginForm.password)
        this.showLoginModal = false
        this.loginForm = { email: '', password: '' }
      } catch (error) {
        alert('Login failed: ' + error.message)
      }
    },
    
    async register() {
      try {
        await registerUser(this.registerForm.email, this.registerForm.password, this.registerForm.displayName)
        this.showRegisterModal = false
        this.registerForm = { displayName: '', email: '', password: '' }
      } catch (error) {
        alert('Registration failed: ' + error.message)
      }
    },
    
    async logout() {
      try {
        await logoutUser()
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.1);
}

.cart-link {
  background-color: rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 0.5rem 1rem;
}

.auth-links, .user-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.auth-btn {
  background-color: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
}

.auth-btn:hover {
  background-color: rgba(255,255,255,0.2);
}

.user-name {
  color: white;
  font-weight: 500;
}

.main-content {
  min-height: calc(100vh - 140px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 1rem;
  color: #666;
  border-top: 1px solid #ddd;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
}

.modal h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form-actions .btn {
  flex: 1;
}
</style>
