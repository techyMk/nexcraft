<?php
$pageTitle = 'Dashboard – Admin';
require_once __DIR__ . '/layout.php';

// Stats
$totalProducts  = $conn->query("SELECT COUNT(*) FROM products")->fetch_row()[0];
$totalOrders    = $conn->query("SELECT COUNT(*) FROM orders")->fetch_row()[0];
$totalUsers     = $conn->query("SELECT COUNT(*) FROM users")->fetch_row()[0];
$totalRevenue   = $conn->query("SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE status != 'cancelled'")->fetch_row()[0];
$pendingCount   = $conn->query("SELECT COUNT(*) FROM orders WHERE status='pending'")->fetch_row()[0];
$deliveredCount = $conn->query("SELECT COUNT(*) FROM orders WHERE status='delivered'")->fetch_row()[0];
$newUsers30     = $conn->query("SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)")->fetch_row()[0];

// Recent orders
$recentOrders = $conn->query("SELECT o.*, COALESCE(CONCAT(u.first_name,' ',u.last_name),'Guest') AS customer_name FROM orders o LEFT JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 8");

// Top products (by order frequency)
$topProducts = $conn->query("SELECT p.name, p.image_url, p.price, COUNT(oi.id) AS sold FROM order_items oi JOIN products p ON oi.product_id=p.id GROUP BY p.id ORDER BY sold DESC LIMIT 5");
?>

<!-- Stats -->
<div class="stat-cards">
    <div class="stat-card"><div class="stat-card-icon amber"><i class="fa-solid fa-box-open"></i></div><div><div class="stat-card-num"><?= $totalProducts ?></div><div class="stat-card-label">Total Products</div></div></div>
    <div class="stat-card"><div class="stat-card-icon blue"><i class="fa-solid fa-cart-shopping"></i></div><div><div class="stat-card-num"><?= $totalOrders ?></div><div class="stat-card-label">Total Orders<br><small style="color:var(--warning)"><?= $pendingCount ?> pending</small></div></div></div>
    <div class="stat-card"><div class="stat-card-icon green"><i class="fa-solid fa-coins"></i></div><div><div class="stat-card-num"><?= formatPrice($totalRevenue) ?></div><div class="stat-card-label">Total Revenue</div></div></div>
    <div class="stat-card"><div class="stat-card-icon red"><i class="fa-solid fa-users"></i></div><div><div class="stat-card-num"><?= $totalUsers ?></div><div class="stat-card-label">Users<br><small style="color:var(--success)"><?= $newUsers30 ?> new this month</small></div></div></div>
</div>

<div style="display:grid;grid-template-columns:1fr 340px;gap:24px">
    <!-- Recent Orders -->
    <div class="admin-card">
        <div class="admin-card-header">
            <div class="admin-card-title">Recent Orders</div>
            <a href="/gadget/admin/orders.php" class="btn btn-ghost btn-sm">View All</a>
        </div>
        <div class="admin-table-wrap">
        <table class="admin-table">
            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
            <?php while ($o = $recentOrders->fetch_assoc()): ?>
            <tr>
                <td><strong style="color:var(--accent)"><?= htmlspecialchars($o['order_number']) ?></strong></td>
                <td><?= htmlspecialchars($o['customer_name']) ?></td>
                <td><?= formatPrice($o['total_amount']) ?></td>
                <td><span class="badge badge-<?= $o['status'] ?>"><?= ucfirst($o['status']) ?></span></td>
                <td style="color:var(--a-text3)"><?= date('d M Y', strtotime($o['created_at'])) ?></td>
                <td><a href="/gadget/admin/orders.php?id=<?= $o['id'] ?>" class="btn btn-ghost btn-xs">View</a></td>
            </tr>
            <?php endwhile; ?>
            </tbody>
        </table>
        </div>
    </div>

    <!-- Top Products -->
    <div class="admin-card">
        <div class="admin-card-header">
            <div class="admin-card-title">Top Selling</div>
            <a href="/gadget/admin/products.php" class="btn btn-ghost btn-sm">All</a>
        </div>
        <div style="padding:16px">
        <?php if ($topProducts->num_rows === 0): ?>
            <p style="color:var(--a-text3);font-size:13px;text-align:center;padding:20px 0">No sales data yet.</p>
        <?php else: while ($tp = $topProducts->fetch_assoc()): ?>
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--a-border)">
            <img src="<?= htmlspecialchars($tp['image_url']) ?>" class="product-thumb" alt="">
            <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><?= htmlspecialchars($tp['name']) ?></div>
                <div style="font-size:11px;color:var(--a-text3)"><?= formatPrice($tp['price']) ?></div>
            </div>
            <div style="font-size:12px;color:var(--accent);font-weight:700"><?= $tp['sold'] ?> sold</div>
        </div>
        <?php endwhile; endif; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
