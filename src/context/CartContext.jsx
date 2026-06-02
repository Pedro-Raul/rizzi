import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const normalizeCartItems = (value) => (Array.isArray(value) ? value : []);
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rizzi_cart');
      return saved ? normalizeCartItems(JSON.parse(saved)) : [];
    } catch {
      localStorage.removeItem('rizzi_cart');
      return [];
    }
  });
  const [businessId, setBusinessId] = useState(() => {
    const saved = localStorage.getItem('rizzi_cart_business');
    return saved ? saved : null;
  });

  useEffect(() => {
    localStorage.setItem('rizzi_cart', JSON.stringify(items));
    if (businessId) {
      localStorage.setItem('rizzi_cart_business', businessId);
    } else {
      localStorage.removeItem('rizzi_cart_business');
    }
  }, [items, businessId]);

  const buildCartItem = (product, quantity) => ({
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    image_url: product.image_url,
    business_id: product.business_id,
    quantity
  });

  const addToCart = (product, quantity = 1, options = {}) => {
    if (businessId && businessId !== product.business_id && !options.replace) {
      throw new Error('DIFFERENT_BUSINESS');
    }

    if (options.replace) {
      setBusinessId(product.business_id);
      setItems([buildCartItem(product, quantity)]);
      return;
    }

    if (!businessId) {
      setBusinessId(product.business_id);
    }

    setItems((prevItems) => {
      const existing = prevItems.find((item) => item.product_id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, buildCartItem(product, quantity)];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.product_id !== productId);
      if (newItems.length === 0) {
        setBusinessId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setBusinessId(null);
  };

  const cartItems = normalizeCartItems(items);
  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const itemCount = cartItems.reduce((count, item) => count + Number(item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        items: cartItems,
        businessId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
