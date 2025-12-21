import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Buat Context
const CartContext = createContext();

// 2. Buat Provider (Pembungkus)
export const CartProvider = ({ children }) => {
  // Ambil data dari localStorage saat awal load (supaya kalau refresh tidak hilang)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('wow_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Simpan ke localStorage setiap kali cart berubah
  useEffect(() => {
    localStorage.setItem('wow_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ACTIONS ---

  // Menambah Item ke Keranjang
  const addToCart = (product, quantity, notes, selectedVariants) => {
    setCartItems((prevItems) => {
      // Cek apakah item yang SAMA PERSIS (termasuk varian & notes) sudah ada?
      const existingItemIndex = prevItems.findIndex((item) => {
        return (
          item.id === product.id &&
          item.notes === notes &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
        );
      });

      if (existingItemIndex > -1) {
        // Jika ada, update quantity-nya saja
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        // Jika belum, tambah sebagai item baru
        // Kita simpan format data sesuai kebutuhan API Backend nanti
        return [
          ...prevItems,
          {
            ...product, // id, name, price (basePrice)
            quantity,
            notes,
            selectedVariants, // Array varian [{name: 'Telur', price: 3000}]
            // Helper untuk hitung total per item di frontend
            totalPriceItem: (parseFloat(product.basePrice) + 
              selectedVariants.reduce((sum, v) => sum + parseFloat(v.extraPrice), 0)) * quantity
          },
        ];
      }
    });
  };

  // Hapus Item
  const removeFromCart = (index) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
  };

  // Bersihkan Keranjang (setelah checkout sukses)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('wow_cart');
  };

  // Hitung Grand Total (Semua item)
  const getGrandTotal = () => {
    return cartItems.reduce((total, item) => {
        // Hitung harga varian
        const variantTotal = item.selectedVariants.reduce((sum, v) => sum + parseFloat(v.extraPrice), 0);
        // (Harga Dasar + Harga Varian) * Jumlah
        return total + ((parseFloat(item.basePrice) + variantTotal) * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getGrandTotal }}>
      {children}
    </CartContext.Provider>
  );
};

// 3. Custom Hook biar gampang dipanggil
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);