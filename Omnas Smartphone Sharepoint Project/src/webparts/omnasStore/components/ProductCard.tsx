import * as React from 'react';
import './ProductCard.css';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  rating: number;
  onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  image,
  rating,
  onAddToCart
}) => {
  return (
    <div className="product-card">
      <img src={image} alt={name} />

      {/* 👇 USE PROPS HERE */}
      <h4>{name}</h4>
      <p className="price">₹{price}</p>
      <p className="rating">⭐ {rating}</p>

      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;
