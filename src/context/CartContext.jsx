import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('rizzi_cart');
    return saved ? JSON.parse(saved) : [];
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
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
