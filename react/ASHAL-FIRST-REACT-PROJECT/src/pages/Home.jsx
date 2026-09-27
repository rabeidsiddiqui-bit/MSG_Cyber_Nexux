import "../css/Home.css"
function Home() {
  return (
    <>
      <main className="home-container">
        {/* 1. Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <h1>Welcome to AshalNova</h1>
            <p>Discover the best deals on top-quality products today.</p>
            <button className="btn-primary">Shop Now</button>
          </div>
        </section>

        {/* 2. Featured Categories */}
        <section className="section categories-section">
          <h2>Featured Categories</h2>
          <div className="categories-grid">
            <div className="category-card">Electronics</div>
            <div className="category-card">Fashion</div>
            <div className="category-card">Home & Living</div>
            <div className="category-card">Beauty & Care</div>
          </div>
        </section>

        {/* 3. Popular Products Grid */}
        <section className="section products-section">
          <h2>Popular Products</h2>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-img-placeholder">🎧 Product Image</div>
              <h3>Wireless Headphones</h3>
              <p className="price">$99.99</p>
              <button className="btn-secondary">Add to Cart</button>
            </div>

            <div className="product-card">
              <div className="product-img-placeholder">⌚ Product Image</div>
              <h3>Smart Watch Series 5</h3>
              <p className="price">$149.99</p>
              <button className="btn-secondary">Add to Cart</button>
            </div>

            <div className="product-card">
              <div className="product-img-placeholder">👟 Product Image</div>
              <h3>Running Shoes</h3>
              <p className="price">$79.99</p>
              <button className="btn-secondary">Add to Cart</button>
            </div>

            <div className="product-card">
              <div className="product-img-placeholder">🎒 Product Image</div>
              <h3>Stylish Backpack</h3>
              <p className="price">$49.99</p>
              <button className="btn-secondary">Add to Cart</button>
            </div>
          </div>
        </section>

        {/* 4. Promotional Banner */}
        <section className="promo-banner">
          <h2>Special Sale Offer!</h2>
          <p>Get up to 50% off on all fashion items. Limited time offer.</p>
        </section>
      </main>
    </>
  )
}

export default Home
