import "../css/Header.css"
import {Link} from 'react-router-dom'
function Header() {
  return (
    <>
   <header className="ecommerce-header">
      <div className="header-main">
        <div className="header-logo">
          <a href="/">
            <h2>AshalNova</h2>
          </a>
        </div>

        <form className="header-search">
          <input 
            type="text" 
            placeholder="Search for products, brands..." 
            aria-label="Search"
          />
          <button type="submit">Search</button>
        </form>

        <div className="header-actions">
          <a href="/login" className="action-item">
            <span>Sign In</span>
          </a>
          <a href="/cart" className="action-item cart-item">
            <span>Cart</span>
            <span className="cart-badge">3</span>
          </a>
        </div>
      </div>

      <nav className="header-nav">
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><a href="/category/home">Home & Garden</a></li>
          <li><a href="/deals">Today's Deals</a></li>
          <li><a href="/support">Customer Support</a></li>
        </ul>
      </nav>
    </header>
    </>
  )
}

export default Header