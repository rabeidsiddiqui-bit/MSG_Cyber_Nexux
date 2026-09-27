import "../css/About.css"
function About() {
  return (
    <>
      <main className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <h1>About AshalNova</h1>
          <p>Your trusted destination for premium quality products.</p>
        </section>

        {/* Story Section */}
        <section className="about-story">
          <h2>Our Journey</h2>
          <p>
            Founded in 2026, AshalNova started with a simple vision: to make online
            shopping seamless, affordable, and reliable for everyone.
          </p>
        </section>

        {/* Features Grid */}
        <section className="about-features">
          <div className="feature-card">
            <div className="icon">🚀</div>
            <h3>Fast Delivery</h3>
            <p>Quick and tracked shipping direct to your doorstep.</p>
          </div>

          <div className="feature-card">
            <div className="icon">🛡️</div>
            <h3>Quality Guarantee</h3>
            <p>Verified products directly from top-tier brands.</p>
          </div>

          <div className="feature-card">
            <div className="icon">💬</div>
            <h3>24/7 Support</h3>
            <p>Dedicated customer service team available anytime.</p>
          </div>
        </section>
      </main>
    </>
  )
}

export default About
