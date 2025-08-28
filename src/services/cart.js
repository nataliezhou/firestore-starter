import { updateProductStock, updateCartItemQuantity, getCart as getCartFromFirestore, watchCart as watchCartFromFirestore } from './firestore.js';
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

export const getCart = () => {
  const userId = getUserId();
  if (!userId) return Promise.resolve([]);
  return getCartFromFirestore(userId);
};

export const watchCart = (callback) => {
  const userId = getUserId();
  if (!userId) return () => {};
  return watchCartFromFirestore(userId, callback);
};
