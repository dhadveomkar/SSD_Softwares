import * as React from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

interface ProductGridProps {
  products: any[];
  onAddToCart: (product: any) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart
}) => {
  return (
    <div className="product-grid">
      {products.map((item) => (
        <ProductCard
          key={item.Id}
          name={item.Title}
          price={item.Price}
          image={item.Image?.Url}
          rating={item.Rating}
          onAddToCart={() => onAddToCart(item)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
