<?php
$pageTitle = 'GadgetZone – Next-Gen Tech Store';
require_once __DIR__ . '/includes/header.php';

// Featured products
$featured = $conn->query("SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.featured=1 ORDER BY p.id DESC LIMIT 6");

// New arrivals
$newArrivals = $conn->query("SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id ORDER BY p.id DESC LIMIT 4");

// Categories with count
$categories = $conn->query("SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id=c.id) AS cnt FROM categories c ORDER BY c.name");

// Deal of the day – first product with old_price
$deal = $conn->query("SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.old_price IS NOT NULL ORDER BY (p.old_price - p.price) DESC LIMIT 1")->fetch_assoc();
?>

<!-- ── HERO ───────────────────────────────────────────────── -->
<section class="hero">
    <div class="container hero-grid">
        <div class="hero-content">
            <div class="hero-eyebrow"><i class="fa-solid fa-star"></i> New Season Arrivals</div>
            <h1 class="hero-title">Your World.<br><span>Next-Level</span><br>Technology.</h1>
            <p class="hero-desc">Discover the latest smartphones, laptops, audio gear and more — curated for tech enthusiasts who demand the best.</p>
            <div class="hero-actions">
                <a href="/gadget/pages/shop.php" class="btn btn-primary btn-lg"><i class="fa-solid fa-bag-shopping"></i> Shop Now</a>
                <a href="/gadget/pages/shop.php?badge=SALE" class="btn btn-outline btn-lg">Explore Deals</a>
            </div>
            <div class="hero-stats">
                <div><div class="stat-num">500+</div><div class="stat-label">Products</div></div>
                <div><div class="stat-num">50K+</div><div class="stat-label">Happy Customers</div></div>
                <div><div class="stat-num">4.9★</div><div class="stat-label">Average Rating</div></div>
            </div>
        </div>
        <div class="hero-visual">
            <div class="hero-img-wrap">
                <img src="https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=80" alt="Latest Tech Gadgets">
            </div>
            <div class="hero-badge-float">
                <div class="hero-badge-icon">🔥</div>
                <div class="hero-badge-text">
                    <strong>Hot Deal Today</strong>
                    <span>Up to 40% Off</span>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ── FEATURE STRIP ─────────────────────────────────────── -->
<div class="sub-hero">
    <div class="container">
        <div class="sub-feature"><div class="sub-feature-icon"><i class="fa-solid fa-truck-fast"></i></div><div class="sub-feature-text"><strong>Free Delivery</strong><span>Orders over ৳5,000</span></div></div>
        <div class="sub-feature"><div class="sub-feature-icon"><i class="fa-solid fa-rotate-left"></i></div><div class="sub-feature-text"><strong>7-Day Returns</strong><span>Hassle-free returns</span></div></div>
        <div class="sub-feature"><div class="sub-feature-icon"><i class="fa-solid fa-shield-halved"></i></div><div class="sub-feature-text"><strong>2-Year Warranty</strong><span>On all products</span></div></div>
        <div class="sub-feature"><div class="sub-feature-icon"><i class="fa-solid fa-headset"></i></div><div class="sub-feature-text"><strong>24/7 Support</strong><span>Always here for you</span></div></div>
        <div class="sub-feature"><div class="sub-feature-icon"><i class="fa-solid fa-lock"></i></div><div class="sub-feature-text"><strong>Secure Payment</strong><span>100% protected</span></div></div>
    </div>
</div>

<!-- ── CATEGORIES ────────────────────────────────────────── -->
<section class="section">
    <div class="container">
        <div class="section-header">
            <div>
                <h2 class="section-title">Shop by <span>Category</span></h2>
                <p class="section-subtitle">Explore our curated tech collections</p>
            </div>
            <a href="/gadget/pages/shop.php" class="section-link">View All <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="cat-grid">
            <?php while ($cat = $categories->fetch_assoc()): ?>
            <a href="/gadget/pages/shop.php?cat=<?= $cat['slug'] ?>" class="cat-card">
                <div class="cat-card-icon"><?= $cat['icon'] ?></div>
                <div class="cat-card-name"><?= htmlspecialchars($cat['name']) ?></div>
                <div class="cat-card-count"><?= $cat['cnt'] ?> items</div>
            </a>
            <?php endwhile; ?>
        </div>
    </div>
</section>

<!-- ── FEATURED PRODUCTS ─────────────────────────────────── -->
<section class="section section-alt">
    <div class="container">
        <div class="section-header">
            <div>
                <h2 class="section-title">Featured <span>Products</span></h2>
                <p class="section-subtitle">Hand-picked by our experts</p>
            </div>
            <a href="/gadget/pages/shop.php?featured=1" class="section-link">View All <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="products-grid">
            <?php while ($p = $featured->fetch_assoc()): ?>
            <div class="product-card">
                <?php if ($p['badge']): ?><span class="product-badge badge-<?= strtolower($p['badge']) ?>"><?= $p['badge'] ?></span><?php endif; ?>
                <a href="/gadget/pages/product.php?slug=<?= $p['slug'] ?>" class="product-card-img" style="display:block">
                    <img src="<?= htmlspecialchars($p['image_url']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" loading="lazy">
                </a>
                <div class="product-card-body">
                    <div class="product-cat"><?= htmlspecialchars($p['cat_name']) ?></div>
                    <a href="/gadget/pages/product.php?slug=<?= $p['slug'] ?>" class="product-name" style="color:var(--text)"><?= htmlspecialchars($p['name']) ?></a>
                    <div class="product-rating"><span class="stars">★★★★★</span><span class="rating-count">(4.8)</span></div>
                    <div class="product-price">
                        <span class="price-current"><?= formatPrice($p['price']) ?></span>
                        <?php if ($p['old_price']): ?><span class="price-old"><?= formatPrice($p['old_price']) ?></span><?php endif; ?>
                    </div>
                    <button class="product-add-btn" data-id="<?= $p['id'] ?>"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                </div>
            </div>
            <?php endwhile; ?>
        </div>
    </div>
</section>

<!-- ── DEAL OF THE DAY ───────────────────────────────────── -->
<?php if ($deal): ?>
<section class="section">
    <div class="container">
        <div class="deal-banner">
            <div>
                <span class="deal-label">🔥 Deal of the Day</span>
                <h2 class="deal-title"><?= htmlspecialchars($deal['name']) ?></h2>
                <p style="color:var(--text2);margin-bottom:20px;font-size:14px"><?= htmlspecialchars(substr($deal['description'], 0, 100)) ?>…</p>
                <div class="countdown" id="countdown">
                    <div class="count-box"><span class="count-num" id="count-hours">12</span><span class="count-label">Hours</span></div>
                    <div class="count-box"><span class="count-num" id="count-mins">00</span><span class="count-label">Mins</span></div>
                    <div class="count-box"><span class="count-num" id="count-secs">00</span><span class="count-label">Secs</span></div>
                </div>
                <div class="deal-price">
                    <span class="price-big"><?= formatPrice($deal['price']) ?></span>
                    <?php if ($deal['old_price']): ?>
                    <span style="color:var(--text3);text-decoration:line-through;font-size:18px;margin-left:12px"><?= formatPrice($deal['old_price']) ?></span>
                    <?php endif; ?>
                </div>
                <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">
                    <button class="btn btn-primary" data-id="<?= $deal['id'] ?>"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                    <a href="/gadget/pages/shop.php" class="btn btn-outline">View Shop</a>
                </div>
            </div>
            <div class="deal-image"><img src="<?= htmlspecialchars($deal['image_url']) ?>" alt="Deal"></div>
            <div>
                <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px">
                    <div style="color:var(--accent);font-size:24px;margin-bottom:8px">★★★★★</div>
                    <div style="font-size:14px;color:var(--text2)">4.9/5 from 2,400+ reviews</div>
                </div>
                <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
                    <div style="font-size:13px;color:var(--text2);margin-bottom:6px"><i class="fa-solid fa-truck-fast" style="color:var(--accent)"></i> Free Delivery in 2-3 days</div>
                    <div style="font-size:13px;color:var(--text2)"><i class="fa-solid fa-shield-halved" style="color:var(--accent)"></i> 2-Year Warranty included</div>
                </div>
            </div>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── NEW ARRIVALS ──────────────────────────────────────── -->
<section class="section section-alt">
    <div class="container">
        <div class="section-header">
            <div>
                <h2 class="section-title">New <span>Arrivals</span></h2>
                <p class="section-subtitle">Fresh drops, just landed</p>
            </div>
            <a href="/gadget/pages/shop.php" class="section-link">View All <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="products-grid">
            <?php while ($p = $newArrivals->fetch_assoc()): ?>
            <div class="product-card">
                <?php if ($p['badge']): ?><span class="product-badge badge-<?= strtolower($p['badge']) ?>"><?= $p['badge'] ?></span><?php endif; ?>
                <a href="/gadget/pages/product.php?slug=<?= $p['slug'] ?>" class="product-card-img" style="display:block">
                    <img src="<?= htmlspecialchars($p['image_url']) ?>" alt="<?= htmlspecialchars($p['name']) ?>" loading="lazy">
                </a>
                <div class="product-card-body">
                    <div class="product-cat"><?= htmlspecialchars($p['cat_name']) ?></div>
                    <a href="/gadget/pages/product.php?slug=<?= $p['slug'] ?>" class="product-name" style="color:var(--text)"><?= htmlspecialchars($p['name']) ?></a>
                    <div class="product-rating"><span class="stars">★★★★★</span><span class="rating-count">(4.7)</span></div>
                    <div class="product-price">
                        <span class="price-current"><?= formatPrice($p['price']) ?></span>
                        <?php if ($p['old_price']): ?><span class="price-old"><?= formatPrice($p['old_price']) ?></span><?php endif; ?>
                    </div>
                    <button class="product-add-btn" data-id="<?= $p['id'] ?>"><i class="fa-solid fa-cart-plus"></i> Add to Cart</button>
                </div>
            </div>
            <?php endwhile; ?>
        </div>
    </div>
</section>

<!-- ── TESTIMONIALS ──────────────────────────────────────── -->
<section class="section">
    <div class="container">
        <div class="section-header" style="justify-content:center;text-align:center">
            <div>
                <h2 class="section-title">What Our <span>Customers</span> Say</h2>
                <p class="section-subtitle">Trusted by 50,000+ shoppers across Bangladesh</p>
            </div>
        </div>
        <div class="testimonials-grid">
            <?php foreach([
                ['R','Rahim Uddin','Dhaka','The MacBook M3 arrived next day. Packaging was perfect and the price beat every competitor!'],
                ['N','Nasrin Ahmed','Chittagong','Been using the Sony headphones for 3 months. Absolutely love the noise cancellation. 10/10!'],
                ['K','Karim Hassan','Sylhet','GadgetZone has the best deals. Got my Galaxy S24 Ultra at ৳10k less than any other shop.'],
            ] as $t): ?>
            <div class="testimonial-card">
                <div class="testimonial-stars">★★★★★</div>
                <p class="testimonial-text">"<?= $t[3] ?>"</p>
                <div class="testimonial-author">
                    <div class="author-avatar"><?= $t[0] ?></div>
                    <div><div class="author-name"><?= $t[1] ?></div><div class="author-location"><?= $t[2] ?>, Bangladesh</div></div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- ── NEWSLETTER ────────────────────────────────────────── -->
<section class="newsletter">
    <div class="container">
        <div class="newsletter-inner">
            <h2>Get Exclusive Deals First 🎉</h2>
            <p>Subscribe to our newsletter and never miss a flash sale or new launch.</p>
            <form class="newsletter-form" id="newsletter-form">
                <input type="email" placeholder="Enter your email address" required>
                <button type="submit">Subscribe</button>
            </form>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
