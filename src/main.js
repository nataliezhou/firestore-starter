import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import ProductDetail from './views/ProductDetail.vue'
import Cart from './views/Cart.vue'
import SellerProfile from './views/SellerProfile.vue'
import Sell from './views/Sell.vue'
import './style.css'

const routes = [
  { path: '/', component: Home }, // each route obj with path in views
  { path: '/product/:id', component: ProductDetail },
  { path: '/cart', component: Cart },
  { path: '/seller/:id', component: SellerProfile },
  { path: '/sell', name: 'Sell', component: Sell }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
