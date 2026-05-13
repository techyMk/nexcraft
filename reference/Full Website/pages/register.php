<?php
// ── All logic runs BEFORE header outputs any HTML ─────────
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

if (isLoggedIn()) { header('Location: /gadget/pages/myaccount.php'); exit; }

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = sanitize($_POST['first_name'] ?? '');
    $lastName  = sanitize($_POST['last_name']  ?? '');
    $email     = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password  = $_POST['password']  ?? '';
    $confirm   = $_POST['confirm']   ?? '';
    if (!$firstName) $errors[] = 'First name is required.';
    if (!$lastName)  $errors[] = 'Last name is required.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required.';
    if (strlen($password) < 6) $errors[] = 'Password must be at least 6 characters.';
    if ($password !== $confirm) $errors[] = 'Passwords do not match.';
    if (empty($errors)) {
        $e = $conn->real_escape_string($email);
        if ($conn->query("SELECT id FROM users WHERE email='$e' LIMIT 1")->num_rows > 0) {
            $errors[] = 'Email already registered. <a href="/gadget/pages/login.php" style="color:var(--accent)">Login instead?</a>';
        }
    }
    if (empty($errors)) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('ssss', $firstName, $lastName, $email, $hash);
        if ($stmt->execute()) {
            $_SESSION['user_id'] = $conn->insert_id;
            $_SESSION['role']    = 'member';
            header('Location: /gadget/pages/myaccount.php'); exit;
        } else { $errors[] = 'Registration failed. Please try again.'; }
    }
}

// ── Now safe to output HTML ────────────────────────────────
$pageTitle = 'Register – GadgetZone';
require_once __DIR__ . '/../includes/header.php';
?>
<div class="page-wrapper auth-page">
    <div class="auth-card">
        <h1 class="auth-title">Create Account 🚀</h1>
        <p class="auth-subtitle">Join GadgetZone and start shopping</p>
        <?php if (!empty($errors)): ?><div class="alert alert-danger"><i class="fa-solid fa-circle-exclamation"></i> <?= implode('<br>', $errors) ?></div><?php endif; ?>
        <form method="POST">
            <div class="form-row">
                <div class="form-group"><label class="form-label">First Name</label>
                    <input type="text" name="first_name" class="form-control" value="<?= htmlspecialchars($_POST['first_name'] ?? '') ?>" required></div>
                <div class="form-group"><label class="form-label">Last Name</label>
                    <input type="text" name="last_name" class="form-control" value="<?= htmlspecialchars($_POST['last_name'] ?? '') ?>" required></div>
            </div>
            <div class="form-group"><label class="form-label">Email Address</label>
                <input type="email" name="email" class="form-control" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>" required placeholder="you@example.com"></div>
            <div class="form-group"><label class="form-label">Password (min 6 characters)</label>
                <input type="password" name="password" class="form-control" required placeholder="••••••••"></div>
            <div class="form-group"><label class="form-label">Confirm Password</label>
                <input type="password" name="confirm" class="form-control" required placeholder="••••••••"></div>
            <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fa-solid fa-user-plus"></i> Create Account</button>
        </form>
        <div class="auth-link">Already have an account? <a href="/gadget/pages/login.php">Log in →</a></div>
    </div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
