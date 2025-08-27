import { updateProductStock, updateCartItemQuantity } from './firestore.js';
import { getUserId } from './auth.js';

export const incrementQuantity = async (product) => {
  const userId = getUserId();
  if (userId) {
    await updateProductStock(product.id, -1);
    await updateCartItemQuantity(userId, product, 1);
  }
};

export const decrementQuantity = async (product) => {
  const userId = getUserId();
  if (userId) {
    await updateProductStock(product.id, 1);
    await updateCartItemQuantity(userId, product, -1);
  }
};
