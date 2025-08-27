import { updateProductStock, updateCartItemQuantity } from './firestore.js';
import { getUserId } from './auth.js';

export const incrementQuantity = async (product) => {
  product.quantity++;
  const userId = getUserId();
  if (userId) {
    await updateProductStock(product.id, -1);
    await updateCartItemQuantity(userId, product);
  }
};

export const decrementQuantity = async (product) => {
  if (product.quantity >= 1) {
    product.quantity--;
    const userId = getUserId();
    if (userId) {
      await updateProductStock(product.id, 1);
      await updateCartItemQuantity(userId, product);
    }
  }
};