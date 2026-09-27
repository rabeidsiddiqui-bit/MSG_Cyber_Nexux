import "../css/Footer.css"
function Footer() {
  return (
    <>
      <footer className="ecommerce-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AshalNova</h3>
            <p>Your one-stop shop for everything you need. Quality products delivered to your doorstep.</p>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="/help">Help Center</a></li>
              <li><a href="/returns">Returns & Refunds</a></li>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/track">Track Order</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>About Us</h4>
            <ul>
              <li><a href="/about">Our Story</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-section newsletter">
            <h4>Stay Connected</h4>
            <p>Subscribe for exclusive offers and updates.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AshalNova. All rights reserved.</p>
          <div className="social-links">
            <a href="#facebook">FB</a>
            <a href="#twitter">TW</a>
            <a href="#instagram">IG</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
