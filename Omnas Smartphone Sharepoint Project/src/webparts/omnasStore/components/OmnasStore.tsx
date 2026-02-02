import * as React from 'react';
import { useEffect, useState } from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import Header from './Header';
import Banner from './Banner';
import ProductGrid from './ProductGrid';
import Cart from './Cart';
import { getProducts } from '../services/ProductService';

/** ✅ PROPS INTERFACE */
export interface OmnasStoreProps {
  context: WebPartContext;
}

const OmnasStore: React.FC<OmnasStoreProps> = ({ context }) => {

  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    // 🔹 Fetch products from SharePoint
    getProducts(context).then(data => {
      setProducts(data);
      setFilteredProducts(data);
    }).catch(err => console.error('Error fetching products:', err));

    // 🔹 Load cart from localStorage
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
  }, [context]);

  // 🔍 Search
  const handleSearch = (value: string) => {
    const result = products.filter(p =>
      p.Title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(result);
  };

  // 🛒 Add to cart
  const addToCart = (product: any) => {
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  return (
    <>
      <Header
        onSearch={handleSearch}
        onCartClick={() => setShowCart(!showCart)}
      />

      <Banner />

      <ProductGrid
        products={filteredProducts}
        onAddToCart={addToCart}
      />

      {showCart && <Cart items={cart} />}
    </>
  );
};

export default OmnasStore;

