<?php
// ── All logic runs BEFORE header outputs any HTML ─────────
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

if (isLoggedIn()) { header('Location: /gadget/pages/myaccount.php'); exit; }

$errors   = [];
$redirect = $_GET['redirect'] ?? '/gadget/pages/myaccount.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    if (!$email)    $errors[] = 'Email is required.';
    if (!$password) $errors[] = 'Password is required.';
    if (empty($errors)) {
        $e   = $conn->real_escape_string($email);
        $res = $conn->query("SELECT * FROM users WHERE email='$e' LIMIT 1");
        if ($res && $res->num_rows > 0) {
            $user = $res->fetch_assoc();
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['role']    = $user['role'];
                // Admins go to admin panel, members go to account/redirect
                if (in_array($user['role'], ['admin','super_admin'])) {
                    header('Location: /gadget/admin/index.php'); exit;
                }
                header('Location: ' . $redirect); exit;
            } else { $errors[] = 'Incorrect password.'; }
        } else { $errors[] = 'No account found with this email.'; }
    }
}

// ── Now safe to output HTML ────────────────────────────────
$pageTitle = 'Login – GadgetZone';
require_once __DIR__ . '/../includes/header.php';
?>
<div class="page-wrapper auth-page">
    <div class="auth-card">
        <h1 class="auth-title">Welcome Back 👋</h1>
        <p class="auth-subtitle">Log in to your GadgetZone account</p>
        <?php if (!empty($errors)): ?><div class="alert alert-danger"><i class="fa-solid fa-circle-exclamation"></i> <?= implode('<br>', $errors) ?></div><?php endif; ?>
        <form method="POST">
            <div class="form-group"><label class="form-label">Email Address</label>
                <input type="email" name="email" class="form-control" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required placeholder="you@example.com"></div>
            <div class="form-group"><label class="form-label">Password</label>
                <input type="password" name="password" class="form-control" required placeholder="••••••••"></div>
            <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fa-solid fa-right-to-bracket"></i> Log In</button>
        </form>
        <div class="auth-link">Don't have an account? <a href="/gadget/pages/register.php">Create one →</a></div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
