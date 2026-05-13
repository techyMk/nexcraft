<?php
/**
 * stripe_return.php
 * Stripe redirects the customer here after payment (success or failure).
 * We verify the session with Stripe's API, then mark the order as paid.
 */
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$orderId   = (int)($_GET['order_id']    ?? 0);
$sessionId = $_GET['session_id'] ?? '';

if (!$orderId || !$sessionId) {
    header('Location: /gadget/index.php');
    exit;
}

// ── Fetch Stripe secret key ───────────────────────────────────
$r = $conn->query("SELECT setting_value FROM settings WHERE setting_key='stripe_secret_key' LIMIT 1");
$secretKey = $r ? ($r->fetch_assoc()['setting_value'] ?? '') : '';

// ── Verify the Checkout Session with Stripe API ───────────────
$verified     = false;
$paymentStatus = 'unpaid';

if ($secretKey && str_starts_with($secretKey, 'sk_')) {
    $ch = curl_init('https://api.stripe.com/v1/checkout/sessions/' . urlencode($sessionId));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD        => $secretKey . ':',
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (!empty($response['payment_status']) && $response['payment_status'] === 'paid') {
        $verified      = true;
        $paymentStatus = 'paid';
    }
}

// ── Load the order from DB ────────────────────────────────────
$sid  = $conn->real_escape_string($sessionId);
$order = $conn->query("SELECT * FROM orders WHERE id=$orderId AND stripe_session_id='$sid' LIMIT 1")->fetch_assoc();

if (!$order) {
    // Try by order ID alone (session ID not saved yet in rare edge cases)
    $order = $conn->query("SELECT * FROM orders WHERE id=$orderId LIMIT 1")->fetch_assoc();
}

if (!$order) {
    header('Location: /gadget/index.php');
    exit;
}

// ── Update order if payment confirmed ────────────────────────
if ($verified) {
    $conn->query("UPDATE orders SET status='processing', payment_status='paid', stripe_session_id='$sid' WHERE id=$orderId");
    // Clear cart
    $_SESSION['cart']       = [];
    $_SESSION['last_order'] = $order['order_number'];
    unset($_SESSION['pending_stripe_order']);
    unset($_SESSION['checkout_form']);

    // Redirect to success page
    header('Location: /gadget/pages/order_success.php?stripe=1');
    exit;
}

// ── Payment not confirmed (cancelled or failed) ───────────────
// Mark order cancelled so it doesn't linger as pending
$conn->query("UPDATE orders SET status='cancelled' WHERE id=$orderId AND payment_status='unpaid'");
unset($_SESSION['pending_stripe_order']);

// Send back to checkout with a message
$_SESSION['checkout_error'] = 'Payment was not completed. Please try again or choose a different payment method.';
header('Location: /gadget/pages/checkout.php?stripe_cancel=1');
exit;
