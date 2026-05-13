<?php
require_once __DIR__ . '/currency.php';
// ── Auth helpers ────────────────────────────────────────────

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
}

function isSuperAdmin() {
    return isset($_SESSION['role']) && $_SESSION['role'] === 'super_admin';
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /gadget/pages/login.php?redirect=' . urlencode($_SERVER['REQUEST_URI']));
        exit;
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        header('Location: /gadget/index.php');
        exit;
    }
}

function getCurrentUser() {
    global $conn;
    if (!isLoggedIn()) return null;
    $id  = (int)$_SESSION['user_id'];
    $res = $conn->query("SELECT * FROM users WHERE id = $id LIMIT 1");
    return $res ? $res->fetch_assoc() : null;
}

// ── Cart helpers ────────────────────────────────────────────

function getCart() {
    return $_SESSION['cart'] ?? [];
}

function addToCart($productId, $qty = 1) {
    $productId = (int)$productId;
    $qty       = max(1, (int)$qty);
    if (!isset($_SESSION['cart'][$productId])) {
        $_SESSION['cart'][$productId] = 0;
    }
    $_SESSION['cart'][$productId] += $qty;
}

function updateCartQty($productId, $qty) {
    $productId = (int)$productId;
    $qty       = (int)$qty;
    if ($qty <= 0) {
        unset($_SESSION['cart'][$productId]);
    } else {
        $_SESSION['cart'][$productId] = min($qty, 99);
    }
}

function removeFromCart($productId) {
    unset($_SESSION['cart'][(int)$productId]);
}

function getCartCount() {
    return array_sum($_SESSION['cart'] ?? []);
}

function getCartTotal() {
    global $conn;
    $cart  = $_SESSION['cart'] ?? [];
    if (empty($cart)) return 0;
    $ids   = implode(',', array_map('intval', array_keys($cart)));
    $res   = $conn->query("SELECT id, price FROM products WHERE id IN ($ids)");
    $total = 0;
    while ($row = $res->fetch_assoc()) {
        $total += $row['price'] * ($cart[$row['id']] ?? 0);
    }
    return $total;
}

// ── Formatting ──────────────────────────────────────────────
// formatPrice() is defined in currency.php and is currency-aware.

function sanitize($data) {
    global $conn;
    return $conn->real_escape_string(strip_tags(trim($data)));
}

function generateOrderNumber() {
    return 'GZ-' . strtoupper(substr(uniqid(), -6)) . '-' . date('ymd');
}
