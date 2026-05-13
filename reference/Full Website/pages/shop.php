<?php
$pageTitle = 'Shop – GadgetZone';
require_once __DIR__ . '/../includes/header.php';

// Filters
$cat    = $_GET['cat']    ?? '';
$search = $_GET['search'] ?? '';
$sort   = $_GET['sort']   ?? 'newest';
$badge  = $_GET['badge']  ?? '';
$page   = max(1, (int)($_GET['page'] ?? 1));
$perPage = 9;
$minP   = (int)($_GET['min'] ?? 0);
$maxP   = (int)($_GET['max'] ?? 300000);

$where = ['p.stock > 0'];
if ($cat)    { $cs = $conn->real_escape_string($cat);   $where[] = "c.slug='$cs'"; }
if ($search) { $ss = $conn->real_escape_string($search); $where[] = "p.name LIKE '%$ss%'"; }
if ($badge)  { $bs = $conn->real_escape_string(strtoupper($badge)); $where[] = "p.badge='$bs'"; }
if ($minP)   $where[] = "p.price >= $minP";
if ($maxP < 300000) $where[] = "p.price <= $maxP";
$whereSQL = implode(' AND ', $where);

$orderSQL = match($sort) {
    'price_asc'  => 'p.price ASC',
    'price_desc' => 'p.price DESC',
    'popular'    => 'p.featured DESC, p.id DESC',
    'top_rated'  => 'p.featured DESC, p.id DESC',
    default      => 'p.id DESC',
};

$total     = $conn->query("SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE $whereSQL")->fetch_row()[0];
$pages     = max(1, ceil($total / $perPage));
$offset    = ($page - 1) * $perPage;
$products  = $conn->query("SELECT p.*, c.name AS cat_name, c.slug AS cat_slug FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE $whereSQL ORDER BY $orderSQL LIMIT $perPage OFFSET $offset");
$allCats   = $conn->query("SELECT c.*, (SELECT COUNT(*) FROM products p2 WHERE p2.category_id=c.id) AS cnt FROM categories c ORDER BY c.name");
?>
<div class="page-wrapper">
<div class="container">
    <div class="breadcrumb">
        <a href="/gadget/index.php">Home</a><span class="sep">›</span><span>Shop</span>
        <?php if ($cat): ?><span class="sep">›</span><span><?= htmlspecialchars($cat) ?></span><?php endif; ?>
    </div>
    <div class="shop-layout">
        <!-- Sidebar -->
        <aside class="shop-sidebar">
            <form method="GET" id="filterForm">
                <div class="sidebar-section">
                    <div class="sidebar-title">Category</div>
                    <ul class="filter-list">
                        <li><label><input type="radio" name="cat" value="" <?= !$cat ? 'checked' : '' ?>> All Categories</label></li>
                        <?php while ($c = $allCats->fetch_assoc()): ?>
                        <li><label><input type="radio" name="cat" value="<?= $c['slug'] ?>" <?= $cat===$c['slug'] ? 'checked' : '' ?>>
                            <?= $c['icon'] ?> <?= htmlspecialchars($c['name']) ?> <small style="color:var(--text3)">(<?= $c['cnt'] ?>)</small>
                        </label></li>
                        <?php endwhile; ?>
                    </ul>
                </div>
                <div class="sidebar-section">
                    <div class="sidebar-title">Price Range</div>
                    <div class="price-range">
                        <?php $curSym = htmlspecialchars(getActiveCurrency()['symbol']); ?>
                        <div class="range-track"><input type="range" name="max" min="0" max="300000" step="1000" value="<?= $maxP ?>" oninput="document.getElementById('maxLabel').textContent='<?= $curSym ?>'+parseInt(this.value).toLocaleString()"></div>
                        <div class="range-labels"><span><?= $curSym ?>0</span><span id="maxLabel"><?= $curSym ?><?= number_format($maxP) ?></span></div>
                    </div>
                </div>
                <?php if ($search): ?><input type="hidden" name="search" value="<?= htmlspecialchars($search) ?>"><?php endif; ?>
                <?php if ($badge): ?><input type="hidden" name="badge" value="<?= htmlspecialchars($badge) ?>"><?php endif; ?>
                <input type="hidden" name="sort" value="<?= htmlspecialchars($sort) ?>">
                <div style="display:flex;gap:8px;margin-top:16px">
                    <button type="submit" class="btn btn-primary btn-sm" style="flex:1">Apply</button>
                    <a href="/gadget/pages/shop.php" class="btn btn-outline btn-sm">Clear</a>
                </div>
            </form>
        </aside>

        <!-- Main -->
        <div>
            <div class="shop-main-header">
                <span class="results-count">Showing <?= $total > 0 ? ($offset+1).'-'.min($offset+$perPage,$total) : '0' ?> of <?= $total ?> results<?= $cat ? " in <strong>".htmlspecialchars($cat)."</strong>" : "" ?></span>
                <select class="sort-select" onchange="window.location.href=this.value">
                    <?php foreach(['newest'=>'Newest','popular'=>'Most Popular','top_rated'=>'Top Rated','price_asc'=>'Price: Low–High','price_desc'=>'Price: High–Low'] as $v=>$l): ?>
                    <option value="?cat=<?= urlencode($cat) ?>&search=<?= urlencode($search) ?>&badge=<?= urlencode($badge) ?>&sort=<?= $v ?>" <?= $sort===$v?'selected':'' ?>><?= $l ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <?php if ($products->num_rows === 0): ?>
            <div style="text-align:center;padding:80px 0">
                <i class="fa-solid fa-magnifying-glass" style="font-size:64px;color:var(--text3);margin-bottom:20px;display:block"></i>
                <h2 style="font-family:var(--font-head);font-size:24px;margin-bottom:10px">No products found</h2>
                <p style="color:var(--text2);margin-bottom:24px">Try adjusting your filters or search terms</p>
                <a href="/gadget/pages/shop.php" class="btn btn-primary">Clear Filters</a>
            </div>
            <?php else: ?>
            <div class="products-grid">
                <?php while ($p = $products->fetch_assoc()): ?>
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
            <?php if ($pages > 1): ?>
            <div class="pagination">
                <?php if ($page > 1): ?><a href="?cat=<?= urlencode($cat) ?>&search=<?= urlencode($search) ?>&badge=<?= urlencode($badge) ?>&sort=<?= $sort ?>&page=<?= $page-1 ?>" class="page-btn"><i class="fa-solid fa-chevron-left"></i></a><?php endif; ?>
                <?php for ($i = max(1,$page-2); $i <= min($pages,$page+2); $i++): ?>
                <a href="?cat=<?= urlencode($cat) ?>&search=<?= urlencode($search) ?>&badge=<?= urlencode($badge) ?>&sort=<?= $sort ?>&page=<?= $i ?>" class="page-btn <?= $i===$page?'active':'' ?>"><?= $i ?></a>
                <?php endfor; ?>
                <?php if ($page < $pages): ?><a href="?cat=<?= urlencode($cat) ?>&search=<?= urlencode($search) ?>&badge=<?= urlencode($badge) ?>&sort=<?= $sort ?>&page=<?= $page+1 ?>" class="page-btn"><i class="fa-solid fa-chevron-right"></i></a><?php endif; ?>
            </div>
            <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
</div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
