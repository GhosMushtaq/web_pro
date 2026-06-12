import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import CountUp from 'react-countup';
import { useInView as useInViewObs } from 'react-intersection-observer';
import { fetchFeaturedProducts } from '../../store/slices/productSlice';
import { collectionService } from '../../services';
import api from '../../services/api';
import ProductCard from '../../components/shop/ProductCard';
import './Home.css';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'backOut' } }
};

const STATS = [
  { label: 'Happy Customers', value: 15000, suffix: '+', icon: '😊' },
  { label: 'Gift Collections', value: 35, suffix: '+', icon: '🎁' },
  { label: 'Orders Delivered', value: 50000, suffix: '+', icon: '📦' },
  { label: 'Cities Covered', value: 120, suffix: '+', icon: '🏙️' },
];

const TESTIMONIALS = [
  { name: 'Ayesha Khan', city: 'Lahore', text: 'Ordered a birthday gift box for my sister. It arrived beautifully wrapped! She absolutely loved it.', rating: 5, avatar: '👩' },
  { name: 'Ali Hassan', city: 'Karachi', text: 'The Eid collection is stunning. Placed an order and received it within 2 days. Will order again!', rating: 5, avatar: '👨' },
  { name: 'Fatima Malik', city: 'Islamabad', text: 'Best gift experience I\'ve had. The packaging was premium and the gift quality was beyond expectations.', rating: 5, avatar: '👩‍💼' },
  { name: 'Zain Ahmed', city: 'Faisalabad', text: 'Ordered a jewelry gift set for my wife on our anniversary. She was thrilled. Amazing service!', rating: 5, avatar: '🧔' },
];

// Particle component
function Particles({ count = 20 }) {
  return (
    <div className="particles-wrapper" aria-hidden="true">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="hero-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
            opacity: 0.2 + Math.random() * 0.4,
          }}
        />
      ))}
    </div>
  );
}

// Floating gift
function FloatingGift({ emoji, style, delay = 0 }) {
  return (
    <motion.div
      className="floating-gift"
      style={style}
      animate={{ y: [0, -20, 0], rotate: [-3, 3, -3] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {emoji}
    </motion.div>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const { featured, newArrivals, bestsellers } = useSelector(s => s.products);
  const [collections, setCollections] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [statsRef, statsInView] = useInViewObs({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    collectionService.getAll({ active: 'true', featured: 'true' })
      .then(data => setCollections(data.collections?.slice(0, 12) || []))
      .catch(() => {});

    api.get('/reviews/featured')
      .then(res => setFeaturedReviews(res.data.reviews || []))
      .catch(() => {});
  }, []);

  return (
    <motion.div className="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Helmet>
        <title>Gifting Bliss 🎁 — Premium Gifts for Every Occasion | Pakistan</title>
        <meta name="description" content="Discover curated gift collections for birthdays, weddings, Eid, and every special occasion. Premium quality, fast delivery across Pakistan." />
      </Helmet>

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <Particles count={25} />

        <FloatingGift emoji="🎁" style={{ top: '15%', left: '8%' }} delay={0} />
        <FloatingGift emoji="🌹" style={{ top: '25%', right: '10%' }} delay={1} />
        <FloatingGift emoji="💝" style={{ top: '65%', left: '5%' }} delay={2} />
        <FloatingGift emoji="🎀" style={{ top: '60%', right: '8%' }} delay={1.5} />
        <FloatingGift emoji="✨" style={{ top: '40%', left: '12%' }} delay={0.5} />

        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            🎉 Pakistan's #1 Premium Gift Shop
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Gifts That
            <br />
            <span className="hero-title-accent">Speak from</span>
            <br />
            the Heart
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Discover 2000+ curated gifts for birthdays, weddings, Eid, and every special moment.
            Premium quality, elegant packaging, delivered across Pakistan.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link to="/shop" className="btn btn-primary btn-lg btn-ripple">
              🛍️ Shop Now
            </Link>
            <Link to="/collections" className="btn btn-secondary btn-lg">
              View Collections
            </Link>
          </motion.div>

          <motion.div
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span>✅ Free shipping on Rs. 3000+</span>
            <span>✅ COD Available</span>
            <span>✅ Easy Returns</span>
          </motion.div>
        </div>

        <div className="hero-visual">
          <motion.div
            className="hero-gift-box"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'backOut' }}
          >
            <div className="gift-box-emoji">🎁</div>
            <div className="gift-shine" />
          </motion.div>

          <div className="hero-floating-cards">
            <motion.div className="hero-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
              <span>🎂</span> Birthday Collection
            </motion.div>
            <motion.div className="hero-card" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}>
              <span>💍</span> Wedding Gifts
            </motion.div>
            <motion.div className="hero-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}>
              <span>🌙</span> Eid Specials
            </motion.div>
          </div>
        </div>

        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" fill="var(--cream)"/>
          </svg>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="stats-section section-sm" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
              >
                <span className="stat-icon">{stat.icon}</span>
                <div className="stat-number">
                  {statsInView && (
                    <CountUp end={stat.value} duration={2} separator="," />
                  )}
                  <span>{stat.suffix}</span>
                </div>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED COLLECTIONS ===== */}
      {collections.length > 0 && (
        <section className="section collections-section">
          <div className="container">
            <div className="section-title">
              <h2>Curated Collections</h2>
              <p>Find the perfect gift from our 35+ themed collections</p>
              <div className="accent-line" />
            </div>
            <motion.div
              className="collections-grid"
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.2 }}
            >
              {collections.map(collection => (
                <motion.div key={collection._id} variants={cardVariants}>
                  <Link to={`/collections/${collection.slug}`} className="collection-card">
                    <div className="collection-emoji">{collection.emoji}</div>
                    <div className="collection-info">
                      <h3>{collection.name}</h3>
                      {collection.productCount > 0 && (
                        <span>{collection.productCount} gifts</span>
                      )}
                    </div>
                    <div className="collection-arrow">→</div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/collections" className="btn btn-primary">View All 35+ Collections</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== NEW ARRIVALS ===== */}
      {newArrivals.length > 0 && (
        <section className="section bg-pink-light">
          <div className="container">
            <div className="section-title">
              <h2>✨ New Arrivals</h2>
              <p>Fresh finds just added to our collection</p>
              <div className="accent-line" />
            </div>
            <motion.div
              className="grid-4"
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.1 }}
            >
              {newArrivals.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/shop?sort=newest" className="btn btn-secondary">View All New Arrivals</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== BESTSELLERS ===== */}
      {bestsellers.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>⭐ Bestsellers</h2>
              <p>Our most loved gifts — loved by thousands</p>
              <div className="accent-line" />
            </div>
            <motion.div
              className="grid-4"
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.1 }}
            >
              {bestsellers.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </motion.div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link to="/shop?sort=popular" className="btn btn-primary">View All Bestsellers</Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY US ===== */}
      <section className="section why-section">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose Gifting Bliss?</h2>
            <p>We believe every gift should tell a story</p>
            <div className="accent-line" />
          </div>
          <div className="why-grid">
            {[
              { icon: '🎁', title: 'Premium Quality', desc: 'Hand-picked products with elegant packaging that leaves a lasting impression.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Reliable delivery across all major cities in Pakistan. Track your order in real-time.' },
              { icon: '💝', title: 'Gift Wrapping', desc: 'Every order comes beautifully wrapped with love — no extra charge.' },
              { icon: '🔄', title: 'Easy Returns', desc: '7-day hassle-free return policy. Your satisfaction is our priority.' },
              { icon: '📞', title: '24/7 Support', desc: 'Our team is always here to help you find the perfect gift.' },
              { icon: '💳', title: 'Secure Payment', desc: 'Multiple payment options including EasyPaisa, JazzCash & Cash on Delivery.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="why-card card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="section-title">
            <h2>What Our Customers Say 💕</h2>
            <p>Real stories from happy gift-givers across Pakistan</p>
            <div className="accent-line" />
          </div>
          <div className="testimonials-grid">
            {featuredReviews.length > 0 ? featuredReviews.map((r, i) => (
              <motion.div
                key={r._id}
                className="testimonial-card card-glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="testimonial-stars">{'⭐'.repeat(r.rating || 5)}</div>
                <p className="testimonial-text" style={{ fontStyle: 'italic' }}>"{r.comment}"</p>
                
                {r.product && (
                  <div style={{ marginBottom: 14, fontSize: '0.8rem', background: 'var(--cream)', padding: '6px 10px', borderRadius: 8, display: 'inline-block' }}>
                    Purchased: <Link to={'/product/' + r.product.slug} style={{ fontWeight: 700, color: 'var(--pink-600)', textDecoration: 'none' }}>{r.product.name}</Link>
                  </div>
                )}

                <div className="testimonial-author">
                  {r.customer?.avatar?.url ? (
                    <img src={r.customer.avatar.url} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span className="testimonial-avatar">👤</span>
                  )}
                  <div>
                    <strong style={{ display: 'block' }}>{r.customer?.name || 'Verified Customer'}</strong>
                    <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>✓ Verified Buyer</span>
                  </div>
                </div>
              </motion.div>
            )) : TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="testimonial-card card-glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="testimonial-stars">{'⭐'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar">{t.avatar}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.city}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter-section">
        <div className="container">
          <motion.div
            className="newsletter-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Get 10% Off Your First Order! 🎉</h2>
            <p>Subscribe to our newsletter for exclusive deals, new arrivals, and gifting inspiration.</p>
            <form className="newsletter-form" onSubmit={e => { e.preventDefault(); }}>
              <input type="email" placeholder="Enter your email address" className="input newsletter-input" />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
