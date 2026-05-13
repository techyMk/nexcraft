<?php
$pageTitle = 'Orders – Admin';
require_once __DIR__ . '/layout.php';

$success = ''; $errors = [];

// Update status
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    $oid    = (int)$_POST['order_id'];
    $status = $conn->real_escape_string($_POST['status']);
    $allowed = ['pending','processing','shipped','delivered','cancelled'];
    if (in_array($status, $allowed)) {
        $conn->query("UPDATE orders SET status='$status' WHERE id=$oid");
        $success = "Order #$oid status updated to " . ucfirst($status) . '.';
    }
}

// Filters
$statusF = $conn->real_escape_string($_GET['status'] ?? '');
$search  = $conn->real_escape_string($_GET['search'] ?? '');
$where   = 'WHERE 1';
if ($statusF) $where .= " AND o.status='$statusF'";
if ($search)  $where .= " AND (o.order_number LIKE '%$search%' OR u.first_name LIKE '%$search%' OR u.last_name LIKE '%$search%')";

// Pagination
$page    = max(1,(int)($_GET['page'] ?? 1));
$perPage = 15;
$total   = $conn->query("SELECT COUNT(*) FROM orders o LEFT JOIN users u ON o.user_id=u.id $where")->fetch_row()[0];
$pages   = max(1, ceil($total / $perPage));
$offset  = ($page-1) * $perPage;

$orders  = $conn->query("SELECT o.*, COALESCE(CONCAT(u.first_name,' ',u.last_name),'Guest') AS customer_name, u.email AS customer_email, u.phone AS customer_phone, (SELECT SUM(quantity) FROM order_items WHERE order_id=o.id) AS item_count FROM orders o LEFT JOIN users u ON o.user_id=u.id $where ORDER BY o.created_at DESC LIMIT $perPage OFFSET $offset");

// Single order detail
$viewOrder = null; $orderItems = [];
if (isset($_GET['id'])) {
    $oid = (int)$_GET['id'];
    $viewOrder = $conn->query("SELECT o.*, COALESCE(CONCAT(u.first_name,' ',u.last_name),'Guest') AS customer_name, u.email AS customer_email, u.phone AS customer_phone FROM orders o LEFT JOIN users u ON o.user_id=u.id WHERE o.id=$oid LIMIT 1")->fetch_assoc();
    if ($viewOrder) {
        $r = $conn->query("SELECT oi.*,p.name AS product_name,p.image_url FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=$oid");
        while ($row = $r->fetch_assoc()) $orderItems[] = $row;
    }
}
?>

<div class="page-actions">
    <h1><i class="fa-solid fa-cart-shopping" style="color:var(--accent)"></i> Orders</h1>
    <div style="display:flex;gap:8px;font-size:13px;color:var(--a-text2)">Total: <strong style="color:var(--a-text)"><?= $total ?></strong></div>
</div>

<?php if ($success): ?><div class="alert alert-success"><i class="fa-solid fa-check-circle"></i> <?= htmlspecialchars($success) ?></div><?php endif; ?>
<?php if ($viewOrder): ?>
<!-- Order Detail View -->
<div class="admin-card" style="margin-bottom:16px">
    <div class="admin-card-header">
        <div class="admin-card-title">Order <span style="color:var(--accent)"><?= htmlspecialchars($viewOrder['order_number']) ?></span></div>
        <a href="/gadget/admin/orders.php" class="btn btn-ghost btn-sm"><i class="fa-solid fa-arrow-left"></i> Back</a>
    </div>
    <div class="admin-card-body">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:24px">
            <div><div class="form-label">Customer</div><strong><?= htmlspecialchars($viewOrder['customer_name']) ?></strong><div style="font-size:12px;color:var(--a-text2)"><?= htmlspecialchars($viewOrder['customer_email'] ?? 'Guest') ?></div><?php if ($viewOrder['customer_phone']): ?><div style="font-size:12px;color:var(--a-text2)"><?= htmlspecialchars($viewOrder['customer_phone']) ?></div><?php endif; ?></div>
            <div><div class="form-label">Shipping Address</div><div style="font-size:13px;color:var(--a-text2)"><?= htmlspecialchars($viewOrder['shipping_address']) ?></div></div>
            <div><div class="form-label">Payment</div><strong style="text-transform:capitalize"><?= htmlspecialchars($viewOrder['payment_method']) ?></strong><div style="font-size:12px;color:var(--a-text2)"><?= date('d M Y, h:i A', strtotime($viewOrder['created_at'])) ?></div></div>
        </div>

        <table class="admin-table" style="margin-bottom:24px">
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
            <tbody>
            <?php foreach ($orderItems as $item): ?>
            <tr>
                <td style="display:flex;align-items:center;gap:12px">
                    <img src="<?= htmlspecialchars($item['image_url']) ?>" class="product-thumb" alt="">
                    <span><?= htmlspecialchars($item['product_name']) ?></span>
                </td>
                <td><?= $item['quantity'] ?></td>
                <td><?= formatPrice($item['price']) ?></td>
                <td><strong><?= formatPrice($item['price'] * $item['quantity']) ?></strong></td>
            </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
            <div style="font-size:20px;font-weight:800;font-family:var(--font-head)">Total: <span style="color:var(--accent)"><?= formatPrice($viewOrder['total_amount']) ?></span></div>
            <form method="POST" style="display:flex;align-items:center;gap:12px">
                <input type="hidden" name="order_id" value="<?= $viewOrder['id'] ?>">
                <label class="form-label" style="margin:0">Update Status:</label>
                <select name="status" class="form-control" style="width:auto">
                    <?php foreach(['pending','processing','shipped','delivered','cancelled'] as $s): ?>
                    <option value="<?= $s ?>" <?= $viewOrder['status']===$s?'selected':'' ?>><?= ucfirst($s) ?></option>
                    <?php endforeach; ?>
                </select>
                <button type="submit" name="update_status" class="btn btn-primary btn-sm">Update</button>
            </form>
        </div>
        <?php if ($viewOrder['notes']): ?><div style="margin-top:16px;padding:12px;background:var(--a-surface2);border-radius:var(--radius-sm);font-size:13px;color:var(--a-text2)"><strong>Notes:</strong> <?= htmlspecialchars($viewOrder['notes']) ?></div><?php endif; ?>
    </div>
</div>
<?php endif; ?>

<!-- Filters -->
<form method="GET" class="search-filter-bar">
    <input type="text" name="search" class="form-control" placeholder="Search order # or customer…" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">
    <select name="status" class="form-control" style="max-width:160px" onchange="this.form.submit()">
        <option value="">All Statuses</option>
        <?php foreach(['pending','processing','shipped','delivered','cancelled'] as $s): ?>
        <option value="<?= $s ?>" <?= $statusF===$s?'selected':'' ?>><?= ucfirst($s) ?></option>
        <?php endforeach; ?>
    </select>
    <button type="submit" class="btn btn-ghost">Filter</button>
    <a href="/gadget/admin/orders.php" class="btn btn-ghost">Clear</a>
</form>

<div class="admin-card">
    <div class="admin-table-wrap">
    <table class="admin-table">
        <thead><tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
        <?php if ($orders->num_rows === 0): ?>
        <tr><td colspan="8" style="text-align:center;color:var(--a-text3);padding:40px">No orders found.</td></tr>
        <?php else: while ($o = $orders->fetch_assoc()): ?>
        <tr>
            <td><a href="?id=<?= $o['id'] ?>" style="color:var(--accent);font-weight:600"><?= htmlspecialchars($o['order_number']) ?></a></td>
            <td><div style="font-weight:500"><?= htmlspecialchars($o['customer_name']) ?></div><div style="font-size:11px;color:var(--a-text3)"><?= htmlspecialchars($o['customer_email'] ?? 'Guest') ?></div></td>
            <td style="color:var(--a-text2)"><?= $o['item_count'] ?></td>
            <td><strong><?= formatPrice($o['total_amount']) ?></strong></td>
            <td style="text-transform:capitalize;color:var(--a-text2)"><?= htmlspecialchars($o['payment_method']) ?></td>
            <td>
                <form method="POST" style="display:flex;gap:6px;align-items:center">
                    <input type="hidden" name="order_id" value="<?= $o['id'] ?>">
                    <select name="status" class="form-control" style="width:110px;padding:5px 8px;font-size:12px" onchange="this.form.submit()">
                        <?php foreach(['pending','processing','shipped','delivered','cancelled'] as $s): ?>
                        <option value="<?= $s ?>" <?= $o['status']===$s?'selected':'' ?>><?= ucfirst($s) ?></option>
                        <?php endforeach; ?>
                    </select>
                    <input type="hidden" name="update_status" value="1">
                </form>
            </td>
            <td style="color:var(--a-text3);font-size:12px"><?= date('d M Y', strtotime($o['created_at'])) ?></td>
            <td><a href="?id=<?= $o['id'] ?>" class="btn btn-ghost btn-xs"><i class="fa-solid fa-eye"></i> View</a></td>
        </tr>
        <?php endwhile; endif; ?>
        </tbody>
    </table>
    </div>
</div>

<?php if ($pages > 1): ?>
<div style="display:flex;justify-content:center;gap:8px;margin-top:20px">
    <?php if ($page>1): ?><a href="?status=<?= $statusF ?>&search=<?= urlencode($_GET['search']??'') ?>&page=<?= $page-1 ?>" class="btn btn-ghost btn-sm"><i class="fa-solid fa-chevron-left"></i></a><?php endif; ?>
    <?php for ($i=max(1,$page-2);$i<=min($pages,$page+2);$i++): ?>
    <a href="?status=<?= $statusF ?>&search=<?= urlencode($_GET['search']??'') ?>&page=<?= $i ?>" class="btn btn-sm <?= $i===$page?'btn-primary':'btn-ghost' ?>"><?= $i ?></a>
    <?php endfor; ?>
    <?php if ($page<$pages): ?><a href="?status=<?= $statusF ?>&search=<?= urlencode($_GET['search']??'') ?>&page=<?= $page+1 ?>" class="btn btn-ghost btn-sm"><i class="fa-solid fa-chevron-right"></i></a><?php endif; ?>
</div>
<?php endif; ?>

<?php require_once __DIR__ . '/footer.php'; ?>
