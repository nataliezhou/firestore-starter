import { updateProductStock, updateCartItemQuantity } from './firestore.js';
import { getUserId } from './auth.js';

export const incrementQuantity = async (product) => {
  if (product.stock > 0) {
    product.quantity++;
    product.stock--;
    const userId = getUserId();
    if (userId) {
      await updateProductStock(product);
      await updateCartItemQuantity(userId, product);
    }
  }
};

export const decrementQuantity = async (product) => {
  if (product.quantity >= 1) {
    product.quantity--;
    product.stock++;
    const userId = getUserId();
    if (userId) {
      await updateProductStock(product);
      await updateCartItemQuantity(userId, product);
    }
  }
};