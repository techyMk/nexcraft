<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$currentUser = getCurrentUser();
if (!$currentUser || !in_array($currentUser['role'], ['admin', 'super_admin'])) {
    header('Location: /gadget/pages/login.php');
    exit;
}

$pageTitle   = $pageTitle   ?? 'Admin – GadgetZone';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
$pendingOrders = $conn->query("SELECT COUNT(*) FROM orders WHERE status='pending'")->fetch_row()[0];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($pageTitle) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="/gadget/admin/admin.css">
<?= $extraHead ?? '' ?>
</head>
<body>

<div class="admin-wrap">
<!-- ── Sidebar ─────────────────────────────────────────── -->
<aside class="admin-sidebar" id="adminSidebar">
    <div class="sidebar-logo">
        <a href="/gadget/index.php" title="Go to Storefront" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;flex:1;min-width:0">
            <span class="logo-icon"><i class="fa-solid fa-bolt"></i></span>
            <span>Gadget<strong>Zone</strong></span>
        </a>
        <button class="sidebar-toggle" id="sidebarToggle"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <nav class="sidebar-nav">
        <div class="sidebar-section-label">Main</div>
        <a href="/gadget/admin/index.php" class="<?= $currentPage==='index'?'active':'' ?>">
            <i class="fa-solid fa-gauge-high"></i><span>Dashboard</span>
        </a>
        <a href="/gadget/admin/products.php" class="<?= $currentPage==='products'?'active':'' ?>">
            <i class="fa-solid fa-box-open"></i><span>Products</span>
        </a>
        <a href="/gadget/admin/orders.php" class="<?= $currentPage==='orders'?'active':'' ?>">
            <i class="fa-solid fa-cart-shopping"></i><span>Orders</span>
            <?php if ($pendingOrders > 0): ?><span class="nav-badge"><?= $pendingOrders ?></span><?php endif; ?>
        </a>
        <a href="/gadget/admin/users.php" class="<?= $currentPage==='users'?'active':'' ?>">
            <i class="fa-solid fa-users"></i><span>Users</span>
        </a>
        <div class="sidebar-section-label" style="margin-top:16px">Store</div>
        <a href="/gadget/index.php" target="_blank">
            <i class="fa-solid fa-store"></i><span>View Store</span>
        </a>
        <div class="sidebar-section-label" style="margin-top:16px">Config</div>
        <a href="/gadget/admin/settings.php" class="<?= $currentPage==='settings'?'active':'' ?>">
            <i class="fa-solid fa-gear"></i><span>Settings</span>
        </a>
    </nav>
    <div class="sidebar-footer">
        <div class="sidebar-user">
            <div class="sidebar-avatar"><?= strtoupper(substr($currentUser['first_name'],0,1).substr($currentUser['last_name'],0,1)) ?></div>
            <div>
                <div style="font-size:13px;font-weight:600"><?= htmlspecialchars($currentUser['first_name'].' '.$currentUser['last_name']) ?></div>
                <div style="font-size:11px;color:var(--a-text3)"><?= ucfirst($currentUser['role']) ?></div>
            </div>
        </div>
        <a href="/gadget/pages/logout.php" class="sidebar-logout"><i class="fa-solid fa-right-from-bracket"></i></a>
    </div>
</aside>

<!-- ── Main content ─────────────────────────────────────── -->
<div class="admin-main">
<div class="admin-topbar">
    <button class="topbar-hamburger" id="topbarHamburger"><i class="fa-solid fa-bars"></i></button>
    <div class="admin-topbar-title"><?= $pageTitle ?></div>
    <div class="admin-topbar-right">
        <?php
        $activeCur = getActiveCurrency();
        ?>
        <div class="topbar-currency-badge" title="Active Currency">
            <span><?= $activeCur['flag'] ?></span>
            <span><?= htmlspecialchars($activeCur['code']) ?></span>
            <span style="color:var(--a-text3)"><?= htmlspecialchars($activeCur['symbol']) ?></span>
        </div>
        <a href="/gadget/admin/orders.php?status=pending" class="topbar-btn">
            <i class="fa-solid fa-bell"></i>
            <?php if ($pendingOrders > 0): ?><span class="nav-badge"><?= $pendingOrders ?></span><?php endif; ?>
        </a>
        <a href="/gadget/admin/settings.php" class="topbar-btn" title="Settings">
            <i class="fa-solid fa-gear"></i>
        </a>
    </div>
</div>
<div class="admin-content">
