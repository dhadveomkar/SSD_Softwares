import * as React from 'react';
import './Header.css';


interface HeaderProps {
onSearch: (value: string) => void;
onCartClick: () => void;
}


const Header: React.FC<HeaderProps> = ({ onSearch, onCartClick }) => {
return (
<div className="omnas-header">
<div className="logo">OMNAS</div>


<input
type="text"
className="search-box"
placeholder="Search for smartphones"
onChange={(e) => onSearch(e.target.value)}
/>


<div className="header-actions">
<button className="login-btn">Login</button>
<button className="cart-btn" onClick={onCartClick}>Cart</button>
</div>
</div>
);
};

export default Header;