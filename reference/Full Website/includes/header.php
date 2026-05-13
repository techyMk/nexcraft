<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';
$cartCount   = getCartCount();
$currentUser = getCurrentUser();
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

// Load categories for the category nav
$catNav = $conn->query("SELECT * FROM categories ORDER BY name");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?? 'GadgetZone – Next-Gen Tech Store' ?></title>
    <meta name="description" content="<?= $pageDesc ?? 'Shop the latest smartphones, laptops, audio, cameras and wearables at unbeatable prices.' ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="/gadget/assets/css/style.css">
    <?= $extraHead ?? '' ?>
    <!-- Cart action URL: auto-detected for localhost vs production -->
    <script>const CART_URL='<?= (strpos($_SERVER['HTTP_HOST']??'','localhost')!==false?'/gadget':'')?>/pages/cart_action.php';</script>
</head>
<body>

<!-- ── Top Bar ──────────────────────────────────────────── -->
<div class="topbar">
    <div class="container">
        <span><i class="fa-solid fa-truck-fast"></i> Free delivery on orders over ৳5,000</span>
        <div class="topbar-right">
            <?php if (isLoggedIn()): ?>
                <span>Hi, <?= htmlspecialchars($currentUser['first_name'] ?? 'User') ?></span>
                <span class="sep">|</span>
                <a href="/gadget/pages/myaccount.php">My Account</a>
                <span class="sep">|</span>
                <a href="/gadget/pages/logout.php">Logout</a>
            <?php else: ?>
                <a href="/gadget/pages/login.php">Login</a>
                <span class="sep">|</span>
                <a href="/gadget/pages/register.php">Register</a>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- ── Main Navbar ──────────────────────────────────────── -->
<nav class="navbar" id="navbar">
    <div class="container nav-inner">
        <!-- Logo -->
        <a href="/gadget/index.php" class="logo">
            <span class="logo-icon"><i class="fa-solid fa-bolt"></i></span>
            <span class="logo-text">Gadget<strong>Zone</strong></span>
        </a>

        <!-- Search bar -->
        <form class="search-bar" action="/gadget/pages/shop.php" method="GET">
            <input type="text" name="search" placeholder="Search products, brands…" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">
            <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
        </form>

        <!-- Nav actions -->
        <nav class="nav-actions">
            <a href="/gadget/pages/<?= $currentUser ? 'myaccount' : 'login' ?>.php" class="nav-btn <?= in_array($currentPage, ['myaccount','login']) ? 'active' : '' ?>">
                <i class="fa-regular fa-user"></i>
                <span>Account</span>
            </a>
            <a href="/gadget/pages/cart.php" class="nav-btn cart-btn <?= $currentPage === 'cart' ? 'active' : '' ?>">
                <i class="fa-solid fa-bag-shopping"></i>
                <span>Cart</span>
                <span class="cart-badge" style="<?= $cartCount > 0 ? '' : 'display:none' ?>"><?= $cartCount ?></span>
            </a>
            <?php if (isAdmin()): ?>
            <a href="/gadget/admin/index.php" class="nav-btn">
                <i class="fa-solid fa-gauge-high"></i>
                <span>Admin</span>
            </a>
            <?php endif; ?>
        </nav>

        <!-- Hamburger -->
        <button class="hamburger" id="hamburger" aria-label="Menu">
            <span></span><span></span><span></span>
        </button>
    </div>
</nav>

<!-- ── Category Nav ─────────────────────────────────────── -->
<div class="cat-nav">
    <div class="container">
        <a href="/gadget/pages/shop.php" class="<?= !isset($_GET['cat']) && $currentPage === 'shop' ? 'active' : '' ?>">All</a>
        <?php if ($catNav): while ($cat = $catNav->fetch_assoc()): ?>
        <a href="/gadget/pages/shop.php?cat=<?= $cat['slug'] ?>"
           class="<?= ($_GET['cat'] ?? '') === $cat['slug'] ? 'active' : '' ?>">
            <?= $cat['icon'] ?> <?= htmlspecialchars($cat['name']) ?>
        </a>
        <?php endwhile; endif; ?>
    </div>
</div>

<!-- ── Mobile Menu ──────────────────────────────────────── -->
<div class="mobile-menu" id="mobileMenu">
    <div class="mobile-menu-inner">
        <a href="/gadget/index.php">Home</a>
        <a href="/gadget/pages/shop.php">Shop</a>
        <a href="/gadget/pages/cart.php">Cart (<?= $cartCount ?>)</a>
        <?php if (isLoggedIn()): ?>
            <a href="/gadget/pages/myaccount.php">My Account</a>
            <?php if (isAdmin()): ?>
            <a href="/gadget/admin/index.php" style="color:var(--accent)"><i class="fa-solid fa-gauge-high"></i> Admin Dashboard</a>
            <?php endif; ?>
            <a href="/gadget/pages/logout.php" style="color:var(--danger)">Logout</a>
        <?php else: ?>
            <a href="/gadget/pages/login.php">Login</a>
            <a href="/gadget/pages/register.php">Register</a>
        <?php endif; ?>
    </div>
</div>
