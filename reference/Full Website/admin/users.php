<?php
$pageTitle = 'Users – Admin';
require_once __DIR__ . '/layout.php';

$success = ''; $errors = [];

// Delete user (super_admin only)
if (isset($_GET['delete']) && isSuperAdmin()) {
    $uid = (int)$_GET['delete'];
    if ($uid === (int)$_SESSION['user_id']) { $errors[] = 'You cannot delete your own account.'; }
    else {
        $hasOrders = $conn->query("SELECT COUNT(*) FROM orders WHERE user_id=$uid")->fetch_row()[0];
        if ($hasOrders) { $errors[] = 'Cannot delete — user has existing orders.'; }
        else { $conn->query("DELETE FROM users WHERE id=$uid"); $success = 'User deleted.'; }
    }
}

// Change role
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['change_role'])) {
    $uid  = (int)$_POST['user_id'];
    $role = $conn->real_escape_string($_POST['role']);
    $allowed = ['member','admin','super_admin'];
    if (in_array($role,$allowed) && $uid !== (int)$_SESSION['user_id']) {
        $conn->query("UPDATE users SET role='$role' WHERE id=$uid");
        $success = 'Role updated.';
    }
}

// Add user
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_user'])) {
    $fn    = $conn->real_escape_string(strip_tags(trim($_POST['first_name'] ?? '')));
    $ln    = $conn->real_escape_string(strip_tags(trim($_POST['last_name']  ?? '')));
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $pass  = $_POST['password'] ?? '';
    $role  = $conn->real_escape_string($_POST['role'] ?? 'member');
    if (!$fn) $errors[] = 'First name required.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email required.';
    if (strlen($pass) < 6) $errors[] = 'Password min 6 chars.';
    if (empty($errors)) {
        $em = $conn->real_escape_string($email);
        if ($conn->query("SELECT id FROM users WHERE email='$em' LIMIT 1")->num_rows > 0) {
            $errors[] = 'Email already registered.';
        } else {
            $hash = password_hash($pass, PASSWORD_DEFAULT);
            $conn->query("INSERT INTO users (first_name,last_name,email,password,role) VALUES ('$fn','$ln','$em','$hash','$role')");
            $success = "User $fn $ln added.";
        }
    }
}

// Filters
$roleF  = $conn->real_escape_string($_GET['role']   ?? '');
$search = $conn->real_escape_string($_GET['search'] ?? '');
$where  = 'WHERE 1';
if ($roleF)  $where .= " AND role='$roleF'";
if ($search) $where .= " AND (first_name LIKE '%$search%' OR last_name LIKE '%$search%' OR email LIKE '%$search%')";

$users = $conn->query("SELECT *, (SELECT COUNT(*) FROM orders WHERE user_id=users.id) AS order_count FROM users $where ORDER BY id DESC");
$counts = [];
foreach(['member','admin','super_admin'] as $r) {
    $counts[$r] = $conn->query("SELECT COUNT(*) FROM users WHERE role='$r'")->fetch_row()[0];
}
?>

<div class="page-actions">
    <h1><i class="fa-solid fa-users" style="color:var(--accent)"></i> Users</h1>
    <button class="btn btn-primary" onclick="openModal('addUserModal')"><i class="fa-solid fa-user-plus"></i> Add User</button>
</div>

<?php if ($success): ?><div class="alert alert-success"><i class="fa-solid fa-check-circle"></i> <?= htmlspecialchars($success) ?></div><?php endif; ?>
<?php if (!empty($errors)): ?><div class="alert alert-danger"><?= implode('<br>',$errors) ?></div><?php endif; ?>

<!-- Role stats -->
<div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap">
    <div style="background:var(--a-surface);border:1px solid var(--a-border);border-radius:var(--radius-sm);padding:12px 20px;display:flex;gap:12px;align-items:center">
        <i class="fa-solid fa-users" style="color:var(--a-text2)"></i>
        <span style="font-size:13px;color:var(--a-text2)">Members: <strong style="color:var(--a-text)"><?= $counts['member'] ?></strong></span>
    </div>
    <div style="background:var(--a-surface);border:1px solid var(--a-border);border-radius:var(--radius-sm);padding:12px 20px;display:flex;gap:12px;align-items:center">
        <i class="fa-solid fa-shield-halved" style="color:var(--accent)"></i>
        <span style="font-size:13px;color:var(--a-text2)">Admins: <strong style="color:var(--accent)"><?= $counts['admin'] + $counts['super_admin'] ?></strong></span>
    </div>
</div>

<!-- Filters -->
<form method="GET" class="search-filter-bar">
    <input type="text" name="search" class="form-control" placeholder="Search by name or email…" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">
    <select name="role" class="form-control" style="max-width:160px" onchange="this.form.submit()">
        <option value="">All Roles</option>
        <option value="member"      <?= $roleF==='member'?'selected':'' ?>>Members</option>
        <option value="admin"       <?= $roleF==='admin'?'selected':'' ?>>Admins</option>
        <option value="super_admin" <?= $roleF==='super_admin'?'selected':'' ?>>Super Admins</option>
    </select>
    <button type="submit" class="btn btn-ghost">Filter</button>
    <a href="/gadget/admin/users.php" class="btn btn-ghost">Clear</a>
</form>

<div class="admin-card">
    <div class="admin-table-wrap">
    <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Orders</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
        <?php if ($users->num_rows === 0): ?>
        <tr><td colspan="7" style="text-align:center;color:var(--a-text3);padding:40px">No users found.</td></tr>
        <?php else: while ($u = $users->fetch_assoc()): $isSelf = $u['id']==(int)$_SESSION['user_id']; ?>
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:32px;height:32px;border-radius:50%;background:<?= $u['role']==='member'?'var(--a-surface2)':'rgba(245,158,11,0.15)' ?>;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:<?= $u['role']==='member'?'var(--a-text2)':'var(--accent)' ?>;flex-shrink:0">
                        <?= strtoupper(substr($u['first_name'],0,1).substr($u['last_name'],0,1)) ?>
                    </div>
                    <div>
                        <div style="font-weight:600;font-size:13px"><?= htmlspecialchars($u['first_name'].' '.$u['last_name']) ?></div>
                        <?php if ($isSelf): ?><div style="font-size:10px;color:var(--accent)">You</div><?php endif; ?>
                    </div>
                </div>
            </td>
            <td style="color:var(--a-text2)"><?= htmlspecialchars($u['email']) ?></td>
            <td style="color:var(--a-text2)"><?= htmlspecialchars($u['phone'] ?? '—') ?></td>
            <td>
                <?php if ($isSelf || !isSuperAdmin()): ?>
                    <span class="badge badge-<?= $u['role'] ?>"><?= ucfirst(str_replace('_',' ',$u['role'])) ?></span>
                <?php else: ?>
                <form method="POST" style="display:inline">
                    <input type="hidden" name="user_id" value="<?= $u['id'] ?>">
                    <select name="role" class="form-control" style="width:120px;padding:4px 8px;font-size:12px" onchange="this.form.submit()">
                        <option value="member"      <?= $u['role']==='member'?'selected':'' ?>>Member</option>
                        <option value="admin"       <?= $u['role']==='admin'?'selected':'' ?>>Admin</option>
                        <option value="super_admin" <?= $u['role']==='super_admin'?'selected':'' ?>>Super Admin</option>
                    </select>
                    <input type="hidden" name="change_role" value="1">
                </form>
                <?php endif; ?>
            </td>
            <td><?= $u['order_count'] ?></td>
            <td style="color:var(--a-text3);font-size:12px"><?= date('d M Y', strtotime($u['created_at'])) ?></td>
            <td>
                <?php if (!$isSelf && isSuperAdmin()): ?>
                <a href="?delete=<?= $u['id'] ?>" class="btn btn-xs" style="background:rgba(239,68,68,0.12);color:var(--danger);border:none" onclick="return confirm('Delete <?= htmlspecialchars($u['first_name']) ?>?')"><i class="fa-solid fa-trash"></i></a>
                <?php endif; ?>
            </td>
        </tr>
        <?php endwhile; endif; ?>
        </tbody>
    </table>
    </div>
</div>

<!-- Add User Modal -->
<div class="modal-overlay" id="addUserModal">
<div class="modal">
    <div class="modal-header">
        <div class="modal-title">Add New User</div>
        <button class="modal-close" onclick="closeModal('addUserModal')"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form method="POST">
    <div class="modal-body">
        <div class="form-row">
            <div class="form-group"><label class="form-label">First Name *</label><input type="text" name="first_name" class="form-control" required></div>
            <div class="form-group"><label class="form-label">Last Name</label><input type="text" name="last_name" class="form-control"></div>
        </div>
        <div class="form-group"><label class="form-label">Email *</label><input type="email" name="email" class="form-control" required placeholder="user@example.com"></div>
        <div class="form-group"><label class="form-label">Password * (min 6 chars)</label><input type="password" name="password" class="form-control" required placeholder="••••••••"></div>
        <div class="form-group"><label class="form-label">Role</label>
            <select name="role" class="form-control">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <?php if (isSuperAdmin()): ?><option value="super_admin">Super Admin</option><?php endif; ?>
            </select>
            <div class="form-hint">Members can only see their own account. Admins access this dashboard.</div>
        </div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('addUserModal')">Cancel</button>
        <button type="submit" name="add_user" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> Add User</button>
    </div>
    </form>
</div>
</div>

<?php if (!empty($errors)): ?><script>document.addEventListener('DOMContentLoaded',()=>openModal('addUserModal'));</script><?php endif; ?>
<?php require_once __DIR__ . '/footer.php'; ?>
