<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

// Fetch product by slug or id
$slug = $conn->real_escape_string($_GET['slug'] ?? '');
$pid  = (int)($_GET['id'] ?? 0);

if ($slug) {
    $product = $conn->query("SELECT p.*, c.name AS cat_name, c.slug AS cat_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.slug='$slug' LIMIT 1")->fetch_assoc();
} elseif ($pid) {
    $product = $conn->query("SELECT p.*, c.name AS cat_name, c.slug AS cat_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=$pid LIMIT 1")->fetch_assoc();
} else {
    header('Location: /gadget/pages/shop.php'); exit;
}

if (!$product) {
    header('Location: /gadget/pages/shop.php'); exit;
}

// Related products (same category, exclude current)
$related = $conn->query("SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.category_id={$product['category_id']} AND p.id!={$product['id']} AND p.stock>0 ORDER BY p.featured DESC, p.id DESC LIMIT 4");

$pageTitle = htmlspecialchars($product['name']) . ' – GadgetZone';
$pageDesc  = htmlspecialchars(substr(strip_tags($product['description']), 0, 160));
require_once __DIR__ . '/../includes/header.php';
?>
<div class="page-wrapper">
<div class="container">
    <!-- Breadcrumb -->
    <div class="breadcrumb">
        <a href="/gadget/index.php">Home</a><span class="sep">›</span>
        <a href="/gadget/pages/shop.php">Shop</a><span class="sep">›</span>
        <a href="/gadget/pages/shop.php?cat=<?= $product['cat_slug'] ?>"><?= htmlspecialchars($product['cat_name']) ?></a><span class="sep">›</span>
        <span><?= htmlspecialchars($product['name']) ?></span>
    </div>

    <!-- Product detail grid -->
    <div class="product-detail-grid">
        <!-- Image -->
        <div class="product-detail-image-wrap">
            <?php if ($product['badge']): ?>
            <span class="product-badge badge-<?= strtolower($product['badge']) ?>" style="position:absolute;top:16px;left:16px;z-index:2;font-size:13px"><?= $product['badge'] ?></span>
            <?php endif; ?>
            <img src="<?= htmlspecialchars($product['image_url']) ?>" alt="<?= htmlspecialchars($product['name']) ?>" class="product-detail-img">
        </div>

        <!-- Info -->
        <div class="product-detail-info">
            <div class="product-cat" style="margin-bottom:8px">
                <a href="/gadget/pages/shop.php?cat=<?= $product['cat_slug'] ?>" style="color:var(--accent)"><?= htmlspecialchars($product['cat_name']) ?></a>
            </div>
            <h1 class="product-detail-title"><?= htmlspecialchars($product['name']) ?></h1>

            <div class="product-rating" style="margin-bottom:20px">
                <span class="stars">★★★★★</span>
                <span class="rating-count">(4.8 · 1,240 reviews)</span>
            </div>

            <div class="product-detail-price">
                <span class="price-big"><?= formatPrice($product['price']) ?></span>
                <?php if ($product['old_price']): ?>
                <span class="price-old" style="font-size:20px;margin-left:12px"><?= formatPrice($product['old_price']) ?></span>
                <?php if ($product['old_price'] > $product['price']): ?>
                <span style="background:rgba(34,197,94,0.15);color:#4ade80;padding:3px 10px;border-radius:20px;font-size:13px;font-weight:700;margin-left:8px">
                    Save <?= round((1 - $product['price']/$product['old_price'])*100) ?>%
                </span>
                <?php endif; ?>
                <?php endif; ?>
            </div>

            <!-- Stock status -->
            <div style="margin-bottom:20px">
                <?php if ($product['stock'] > 0): ?>
                <span style="color:#4ade80;font-size:13px;font-weight:600"><i class="fa-solid fa-circle-check"></i> In Stock
                    <?php if ($product['stock'] <= 10): ?>
                    <span style="color:var(--warning);margin-left:6px">(Only <?= $product['stock'] ?> left!)</span>
                    <?php endif; ?>
                </span>
                <?php else: ?>
                <span style="color:var(--danger);font-size:13px;font-weight:600"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>
                <?php endif; ?>
            </div>

            <?php if ($product['description']): ?>
            <p style="color:var(--text2);line-height:1.8;margin-bottom:24px;font-size:15px"><?= nl2br(htmlspecialchars($product['description'])) ?></p>
            <?php endif; ?>

            <!-- Quantity + Add to cart -->
            <?php if ($product['stock'] > 0): ?>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
                <div class="qty-control" style="border:1px solid var(--border);border-radius:var(--radius)">
                    <button class="qty-btn" data-dir="down" id="detailQtyDown"><i class="fa-solid fa-minus"></i></button>
                    <input class="qty-input" type="number" value="1" min="1" max="<?= min($product['stock'], 99) ?>" id="detailQtyInput" style="width:52px">
                    <button class="qty-btn" data-dir="up" id="detailQtyUp"><i class="fa-solid fa-plus"></i></button>
                </div>
                <button class="btn btn-primary btn-lg detail-add-btn" data-id="<?= $product['id'] ?>" style="flex:1;min-width:180px">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
                <a href="/gadget/pages/cart.php" class="btn btn-outline btn-lg">
                    <i class="fa-solid fa-bag-shopping"></i> View Cart
                </a>
            </div>
            <?php endif; ?>

            <!-- Trust badges -->
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:8px">
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface2);border-radius:10px;border:1px solid var(--border)">
                    <i class="fa-solid fa-truck-fast" style="color:var(--accent);font-size:18px"></i>
                    <div style="font-size:12px"><strong style="display:block">Free Delivery</strong><span style="color:var(--text2)">Orders over ৳5,000</span></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface2);border-radius:10px;border:1px solid var(--border)">
                    <i class="fa-solid fa-rotate-left" style="color:var(--accent);font-size:18px"></i>
                    <div style="font-size:12px"><strong style="display:block">7-Day Returns</strong><span style="color:var(--text2)">Hassle-free</span></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface2);border-radius:10px;border:1px solid var(--border)">
                    <i class="fa-solid fa-shield-halved" style="color:var(--accent);font-size:18px"></i>
                    <div style="font-size:12px"><strong style="display:block">2-Year Warranty</strong><span style="color:var(--text2)">On all products</span></div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface2);border-radius:10px;border:1px solid var(--border)">
                    <i class="fa-solid fa-lock" style="color:var(--accent);font-size:18px"></i>
                    <div style="font-size:12px"><strong style="display:block">Secure Payment</strong><span style="color:var(--text2)">100% protected</span></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Related Products -->
    <?php if ($related && $related->num_rows > 0): ?>
    <section class="section" style="margin-top:60px;padding-top:40px;border-top:1px solid var(--border)">
        <div class="section-header">
            <div>
                <h2 class="section-title">Related <span>Products</span></h2>
                <p class="section-subtitle">More from <?= htmlspecialchars($product['cat_name']) ?></p>
            </div>
            <a href="/gadget/pages/shop.php?cat=<?= $product['cat_slug'] ?>" class="section-link">View All <i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="products-grid">
            <?php while ($p = $related->fetch_assoc()): ?>
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
    </section>
    <?php endif; ?>
</div>
</div>

<style>
.product-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
    margin-bottom: 40px;
}
.product-detail-image-wrap {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) * 1.5);
    overflow: hidden;
    aspect-ratio: 1;
}
.product-detail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
}
.product-detail-image-wrap:hover .product-detail-img {
    transform: scale(1.04);
}
.product-detail-title {
    font-family: var(--font-head);
    font-size: clamp(22px, 3vw, 32px);
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 16px;
}
.product-detail-price {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}
.detail-add-btn {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.detail-add-btn:active { transform: scale(0.97); }
.detail-add-btn.added {
    background: var(--success) !important;
    border-color: var(--success) !important;
}

@media (max-width: 768px) {
    .product-detail-grid {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}
</style>

<script>
// Quantity controls on detail page
const qtyInput = document.getElementById('detailQtyInput');
if (qtyInput) {
    document.getElementById('detailQtyDown').addEventListener('click', () => {
        if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    });
    document.getElementById('detailQtyUp').addEventListener('click', () => {
        const max = parseInt(qtyInput.max) || 99;
        if (parseInt(qtyInput.value) < max) qtyInput.value = parseInt(qtyInput.value) + 1;
    });
}

// Add to cart with quantity
document.querySelector('.detail-add-btn')?.addEventListener('click', function() {
    const id  = this.dataset.id;
    const qty = parseInt(document.getElementById('detailQtyInput')?.value || 1);
    const btn = this;
    fetch('/gadget/pages/cart_action.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `action=add&product_id=${id}&qty=${qty}`
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            const badge = document.querySelector('.cart-badge');
            if (badge) { badge.textContent = data.cart_count; badge.style.display = 'flex'; }
            else {
                const cartBtn = document.querySelector('.cart-btn');
                if (cartBtn) {
                    const b = document.createElement('span');
                    b.className = 'cart-badge'; b.textContent = data.cart_count;
                    cartBtn.appendChild(b);
                }
            }
            btn.classList.add('added');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
            }, 2000);
        }
    });
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
