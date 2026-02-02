import * as React from 'react';

const Cart = ({ items }: any) => {
  return (
    <div className="cart-panel">
      <h3>My Cart</h3>

      {items.length === 0 && <p>No items in cart</p>}

      {items.map((item: any, i: number) => (
        <div key={i}>
          <p>{item.Title}</p>
          <p>₹{item.Price}</p>
        </div>
      ))}
    </div>
  );
};

export default Cart;
