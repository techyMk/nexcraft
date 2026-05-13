<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
requireLogin();
$user = getCurrentUser();
$tab  = $_GET['tab'] ?? 'dashboard';
$successMsg = '';
$errors     = [];

// ── Avatar upload ────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['avatar']) && $_FILES['avatar']['error'] === 0) {
    $uid      = (int)$_SESSION['user_id'];
    $allowed  = ['image/jpeg','image/png','image/gif','image/webp'];
    $maxSize  = 2 * 1024 * 1024; // 2 MB
    $file     = $_FILES['avatar'];
    if (!in_array($file['type'], $allowed)) {
        $errors[] = 'Avatar must be a JPG, PNG, GIF or WebP image.';
    } elseif ($file['size'] > $maxSize) {
        $errors[] = 'Avatar must be under 2 MB.';
    } else {
        $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $fname   = 'avatar_' . $uid . '.' . $ext;
        $dest    = __DIR__ . '/../assets/uploads/avatars/' . $fname;
        if (move_uploaded_file($file['tmp_name'], $dest)) {
            $conn->query("UPDATE users SET avatar='$fname' WHERE id=$uid");
            $user = getCurrentUser();
            $successMsg = 'Profile picture updated!';
        } else {
            $errors[] = 'Upload failed. Check folder permissions.';
        }
    }
    $tab = 'profile';
}

// ── Profile update ────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_profile'])) {
    $fn   = sanitize($_POST['first_name'] ?? '');
    $ln   = sanitize($_POST['last_name']  ?? '');
    $ph   = sanitize($_POST['phone']      ?? '');
    $addr = sanitize($_POST['address']    ?? '');
    $city = sanitize($_POST['city']       ?? '');
    $uid  = (int)$_SESSION['user_id'];
    $conn->query("UPDATE users SET first_name='$fn',last_name='$ln',phone='$ph',address='$addr',city='$city' WHERE id=$uid");
    $user = getCurrentUser();
    $successMsg = 'Profile updated successfully!';
    $tab = 'profile';
}

// ── Password change ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['change_password'])) {
    $current = $_POST['current_password'] ?? '';
    $new     = $_POST['new_password']     ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $uid     = (int)$_SESSION['user_id'];
    if (!password_verify($current, $user['password'])) $errors[] = 'Current password is incorrect.';
    if (strlen($new) < 6) $errors[] = 'New password must be at least 6 characters.';
    if ($new !== $confirm) $errors[] = 'Passwords do not match.';
    if (empty($errors)) {
        $hash = password_hash($new, PASSWORD_DEFAULT);
        $conn->query("UPDATE users SET password='$hash' WHERE id=$uid");
        $successMsg = 'Password changed successfully!';
    }
    $tab = 'password';
}

// ── Orders ────────────────────────────────────────────────
$uid = (int)$_SESSION['user_id'];
$allOrders  = $conn->query("SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id=o.id) AS item_count FROM orders o WHERE o.user_id=$uid ORDER BY o.created_at DESC");
$totalOrders    = $allOrders->num_rows;
$deliveredCount = $conn->query("SELECT COUNT(*) FROM orders WHERE user_id=$uid AND status='delivered'")->fetch_row()[0];
$totalSpent     = $conn->query("SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE user_id=$uid AND status!='cancelled'")->fetch_row()[0];
$recentOrders   = $conn->query("SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id=o.id) AS item_count FROM orders o WHERE o.user_id=$uid ORDER BY o.created_at DESC LIMIT 5");
$initials = strtoupper(substr($user['first_name'],0,1) . substr($user['last_name'],0,1));

// ── Order detail view ─────────────────────────────────────
$viewOrder = null; $orderItems = [];
if (isset($_GET['id']) && ($tab === 'orders' || $tab === 'dashboard')) {
    $oid = (int)$_GET['id'];
    $viewOrder = $conn->query("SELECT * FROM orders WHERE id=$oid AND user_id=$uid LIMIT 1")->fetch_assoc();
    if ($viewOrder) {
        $r = $conn->query("SELECT oi.*,p.name AS product_name,p.image_url FROM order_items oi JOIN products p ON oi.product_id=p.id WHERE oi.order_id=$oid");
        while ($row = $r->fetch_assoc()) $orderItems[] = $row;
        $tab = 'orders';
    }
}

// ── Now safe to output HTML ────────────────────────────────
$pageTitle = 'My Account – GadgetZone';
require_once __DIR__ . '/../includes/header.php';
?>
<div class="page-wrapper"><div class="container">
<div class="breadcrumb"><a href="/gadget/index.php">Home</a><span class="sep">›</span><span>My Account</span></div>

<div class="account-layout">
    <!-- Sidebar -->
    <div class="account-sidebar">
        <div class="account-user-info">
            <?php
            $avatarFile = $user['avatar'] ?? '';
            $avatarPath = '/gadget/assets/uploads/avatars/' . $avatarFile;
            $hasAvatar  = $avatarFile && file_exists(__DIR__ . '/../assets/uploads/avatars/' . $avatarFile);
            ?>
            <div class="account-avatar" style="<?= $hasAvatar ? 'padding:0;overflow:hidden' : '' ?>">
                <?php if ($hasAvatar): ?>
                    <img src="<?= $avatarPath ?>" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">
                <?php else: ?>
                    <?= $initials ?>
                <?php endif; ?>
            </div>
            <div class="account-name"><?= htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) ?></div>
            <div class="account-email"><?= htmlspecialchars($user['email']) ?></div>
        </div>
        <nav class="account-nav">
            <a href="?tab=dashboard" class="<?= $tab==='dashboard'?'active':'' ?>"><i class="fa-solid fa-gauge"></i> Dashboard</a>
            <a href="?tab=orders"    class="<?= $tab==='orders'?'active':'' ?>"><i class="fa-solid fa-bag-shopping"></i> My Orders</a>
            <a href="?tab=profile"   class="<?= $tab==='profile'?'active':'' ?>"><i class="fa-solid fa-user"></i> Profile</a>
            <a href="?tab=password"  class="<?= $tab==='password'?'active':'' ?>"><i class="fa-solid fa-lock"></i> Change Password</a>
            <?php if (isAdmin()): ?>
            <a href="/gadget/admin/index.php" style="color:var(--accent)!important"><i class="fa-solid fa-gauge-high"></i> Admin Dashboard</a>
            <?php endif; ?>
            <a href="/gadget/pages/logout.php" style="color:var(--danger)!important"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>
        </nav>
    </div>

    <!-- Content -->
    <div class="account-content">
        <?php if ($successMsg): ?><div class="alert alert-success" style="margin-bottom:20px"><i class="fa-solid fa-check-circle"></i> <?= $successMsg ?></div><?php endif; ?>
        <?php if (!empty($errors)): ?><div class="alert alert-danger" style="margin-bottom:20px"><i class="fa-solid fa-circle-exclamation"></i> <?= implode('<br>', $errors) ?></div><?php endif; ?>

        <?php if ($tab === 'dashboard'): ?>
        <div class="account-content-title">Welcome back, <?= htmlspecialchars($user['first_name']) ?>! 👋</div>
        <div class="dashboard-cards">
            <div class="dash-card"><div class="dash-card-num"><?= $totalOrders ?></div><div class="dash-card-label">Total Orders</div></div>
            <div class="dash-card"><div class="dash-card-num"><?= $deliveredCount ?></div><div class="dash-card-label">Delivered</div></div>
            <div class="dash-card"><div class="dash-card-num"><?= formatPrice($totalSpent) ?></div><div class="dash-card-label">Total Spent</div></div>
        </div>
        <h3 style="font-family:var(--font-head);font-size:16px;font-weight:700;margin-bottom:16px">Recent Orders</h3>
        <?php if ($recentOrders->num_rows === 0): ?>
        <p style="color:var(--text2)">No orders yet. <a href="/gadget/pages/shop.php" style="color:var(--accent)">Start shopping →</a></p>
        <?php else: ?>
        <table class="orders-table"><thead><tr><th>Order #</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr></thead><tbody>
        <?php while ($o = $recentOrders->fetch_assoc()): ?>
        <tr>
            <td><a href="?tab=orders&id=<?= $o['id'] ?>" style="color:var(--accent);font-weight:700"><?= htmlspecialchars($o['order_number']) ?></a></td>
            <td style="color:var(--text2);font-size:13px"><?= date('d M Y', strtotime($o['created_at'])) ?></td>
            <td><strong><?= formatPrice($o['total_amount']) ?></strong></td>
            <td><span class="status-badge status-<?= $o['status'] ?>"><?= ucfirst($o['status']) ?></span></td>
            <td style="color:var(--text2);font-size:13px;text-transform:capitalize"><?= htmlspecialchars($o['payment_method']) ?></td>
            <td><a href="?tab=orders&id=<?= $o['id'] ?>" class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 10px">View</a></td>
        </tr>
        <?php endwhile; ?>
        </tbody></table>
        <?php endif; ?>

        <?php elseif ($tab === 'orders'): ?>
        <div class="account-content-title">My Orders
            <?php if ($viewOrder): ?><a href="?tab=orders" style="font-size:13px;font-weight:400;color:var(--text2);margin-left:12px"><i class="fa-solid fa-arrow-left"></i> Back to Orders</a><?php endif; ?>
        </div>
        <?php if ($viewOrder): ?>
        <!-- Order Detail View -->
        <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:24px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
                <div>
                    <div style="font-size:12px;color:var(--text2);margin-bottom:4px">Order Number</div>
                    <div style="font-size:18px;font-weight:800;font-family:var(--font-head);color:var(--accent)"><?= htmlspecialchars($viewOrder['order_number']) ?></div>
                </div>
                <span class="status-badge status-<?= $viewOrder['status'] ?>" style="font-size:14px;padding:6px 14px"><?= ucfirst($viewOrder['status']) ?></span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
                <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text3);margin-bottom:8px">Shipping To</div>
                    <div style="font-size:13px;color:var(--text2)"><?= htmlspecialchars($viewOrder['shipping_address']) ?></div>
                </div>
                <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px">
                    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text3);margin-bottom:8px">Payment & Date</div>
                    <div style="font-size:13px;text-transform:capitalize;font-weight:600"><?= htmlspecialchars($viewOrder['payment_method']) ?></div>
                    <div style="font-size:12px;color:var(--text2);margin-top:4px"><?= date('d M Y, h:i A', strtotime($viewOrder['created_at'])) ?></div>
                </div>
            </div>
            <?php if ($viewOrder['notes']): ?>
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:13px;color:var(--text2)">
                <i class="fa-solid fa-note-sticky" style="color:var(--accent)"></i> <strong>Notes:</strong> <?= htmlspecialchars($viewOrder['notes']) ?>
            </div>
            <?php endif; ?>
            <table class="orders-table" style="margin-bottom:16px">
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                <?php foreach ($orderItems as $item): ?>
                <tr>
                    <td style="display:flex;align-items:center;gap:10px">
                        <img src="<?= htmlspecialchars($item['image_url']) ?>" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--border)" alt="">
                        <span style="font-weight:500"><?= htmlspecialchars($item['product_name']) ?></span>
                    </td>
                    <td style="color:var(--text2)"><?= $item['quantity'] ?></td>
                    <td><?= formatPrice($item['price']) ?></td>
                    <td><strong style="color:var(--accent)"><?= formatPrice($item['price'] * $item['quantity']) ?></strong></td>
                </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            <div style="text-align:right;font-size:18px;font-weight:800;font-family:var(--font-head)">Total: <span style="color:var(--accent)"><?= formatPrice($viewOrder['total_amount']) ?></span></div>
        </div>
        <?php elseif ($allOrders->num_rows === 0): ?>
        <p style="color:var(--text2)">No orders yet. <a href="/gadget/pages/shop.php" style="color:var(--accent)">Start shopping →</a></p>
        <?php else: ?>
        <table class="orders-table"><thead><tr><th>Order #</th><th>Date &amp; Time</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr></thead><tbody>
        <?php while ($o = $allOrders->fetch_assoc()): ?>
        <tr>
            <td><a href="?tab=orders&id=<?= $o['id'] ?>" style="color:var(--accent);font-weight:700"><?= htmlspecialchars($o['order_number']) ?></a></td>
            <td style="font-size:13px;color:var(--text2)"><?= date('d M Y, h:i A', strtotime($o['created_at'])) ?></td>
            <td style="color:var(--text2)"><?= $o['item_count'] ?> item<?= $o['item_count'] > 1 ? 's' : '' ?></td>
            <td><strong><?= formatPrice($o['total_amount']) ?></strong></td>
            <td><span class="status-badge status-<?= $o['status'] ?>"><?= ucfirst($o['status']) ?></span></td>
            <td style="font-size:13px;color:var(--text2);text-transform:capitalize"><?= htmlspecialchars($o['payment_method']) ?></td>
            <td><a href="?tab=orders&id=<?= $o['id'] ?>" class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 10px">View</a></td>
        </tr>
        <?php endwhile; ?>
        </tbody></table>
        <?php endif; ?>

        <?php elseif ($tab === 'profile'): ?>
        <div class="account-content-title">Profile Information</div>

        <!-- Avatar upload -->
        <div style="margin-bottom:28px;padding:20px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius)">
            <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text3);margin-bottom:14px">Profile Picture</div>
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
                <div id="avatarPreviewWrap" style="width:80px;height:80px;border-radius:50%;overflow:hidden;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#000;flex-shrink:0">
                    <?php if ($hasAvatar): ?>
                        <img id="avatarPreview" src="<?= $avatarPath ?>" style="width:100%;height:100%;object-fit:cover">
                    <?php else: ?>
                        <span id="avatarPreview" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center"><?= $initials ?></span>
                    <?php endif; ?>
                </div>
                <div>
                    <form method="POST" enctype="multipart/form-data">
                        <label style="cursor:pointer">
                            <span class="btn btn-outline btn-sm"><i class="fa-solid fa-camera"></i> Choose Photo</span>
                            <input type="file" name="avatar" accept="image/*" style="display:none" onchange="previewAvatar(this)">
                        </label>
                        <button type="submit" class="btn btn-primary btn-sm" style="margin-left:8px"><i class="fa-solid fa-upload"></i> Upload</button>
                        <div style="font-size:12px;color:var(--text3);margin-top:6px">JPG, PNG or WebP &bull; Max 2 MB</div>
                    </form>
                </div>
            </div>
        </div>

        <form method="POST">
            <div class="form-row">
                <div class="form-group"><label class="form-label">First Name</label><input type="text" name="first_name" class="form-control" value="<?= htmlspecialchars($user['first_name']) ?>" required></div>
                <div class="form-group"><label class="form-label">Last Name</label><input type="text" name="last_name" class="form-control" value="<?= htmlspecialchars($user['last_name']) ?>" required></div>
            </div>
            <div class="form-group"><label class="form-label">Email <small style="color:var(--text3)">(cannot be changed)</small></label><input type="email" class="form-control" value="<?= htmlspecialchars($user['email']) ?>" disabled></div>
            <div class="form-group"><label class="form-label">Phone Number</label><input type="tel" name="phone" class="form-control" value="<?= htmlspecialchars($user['phone'] ?? '') ?>" placeholder="+880 1X00-000000"></div>
            <div class="form-group"><label class="form-label">Address</label><textarea name="address" class="form-control" rows="2"><?= htmlspecialchars($user['address'] ?? '') ?></textarea></div>
            <div class="form-group"><label class="form-label">City</label><input type="text" name="city" class="form-control" value="<?= htmlspecialchars($user['city'] ?? '') ?>"></div>
            <button type="submit" name="update_profile" class="btn btn-primary"><i class="fa-solid fa-check"></i> Save Changes</button>
        </form>

        <script>
        function previewAvatar(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = e => {
                    const wrap = document.getElementById('avatarPreviewWrap');
                    wrap.innerHTML = '<img src="' + e.target.result + '" style="width:100%;height:100%;object-fit:cover">';
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
        </script>

        <?php elseif ($tab === 'password'): ?>
        <div class="account-content-title">Change Password</div>
        <form method="POST" style="max-width:420px">
            <div class="form-group"><label class="form-label">Current Password *</label><input type="password" name="current_password" class="form-control" required placeholder="••••••••"></div>
            <div class="form-group"><label class="form-label">New Password * (min 6 characters)</label><input type="password" name="new_password" class="form-control" required placeholder="••••••••"></div>
            <div class="form-group"><label class="form-label">Confirm New Password *</label><input type="password" name="confirm_password" class="form-control" required placeholder="••••••••"></div>
            <button type="submit" name="change_password" class="btn btn-primary"><i class="fa-solid fa-lock"></i> Update Password</button>
        </form>
        <?php endif; ?>
    </div>
</div>
</div></div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
