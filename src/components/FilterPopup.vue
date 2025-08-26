<template>
  <div v-if="isVisible" class="filter-popup-overlay" @click.self="closePopup">
    <div class="filter-popup-content">
      <h2>Filter Products</h2>
      <form @submit.prevent="applyFilters">
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" v-model="filters.category">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Price Range</label>
          <vue-slider v-model="priceRange" :max="maxPriceValue" :enable-cross="false"></vue-slider>
          <div class="price-range-values">
            <span>Min: ${{ priceRange[0] }}</span>
            <span>Max: ${{ priceRange[1] }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Minimum Rating</label>
          <vue-slider v-model="filters.minRating" :max="5" :interval="0.1"></vue-slider>
          <div class="rating-value">
            <span>Min: {{ filters.minRating }}</span>
          </div>
        </div>

        <div class="actions">
          <button type="submit" class="apply-btn">Apply Filters</button>
          <button type="button" @click="closePopup" class="close-btn">Close</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';

export default {
  name: 'FilterPopup',
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
  },
  components: {
    VueSlider,
  },
  emits: ['apply-filters', 'close'],
  data() {
    return {
      filters: {
        category: 'All',
        minRating: 0,
      },
      priceRange: [0, 25],
      maxPriceValue: 25,
      categories: ['All', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Meat', 'Herbs'],
    };
  },
  methods: {
    applyFilters() {
      const activeFilters = {};
      for (const key in this.filters) {
        if (this.filters[key] !== null && this.filters[key] !== '') {
          activeFilters[key] = this.filters[key];
        }
      }
      activeFilters.minPrice = this.priceRange[0];
      activeFilters.maxPrice = this.priceRange[1];
      this.$emit('apply-filters', activeFilters);
      this.closePopup();
    },
    closePopup() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.filter-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.filter-popup-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 400px;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input[type="number"],
select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; 
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-range span {
  font-weight: bold;
}

.price-range-values, .rating-value {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: #666;
}
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.apply-btn {
  background-color: #4CAF50;
  color: white;
}

.apply-btn:hover {
  background-color: #45a049;
}

.close-btn {
  background-color: #f44336;
  color: white;
}

.close-btn:hover {
  background-color: #da190b;
}
</style>
