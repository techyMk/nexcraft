<?php
/**
 * stripe_checkout.php
 * Creates a Stripe Checkout Session and redirects the customer to Stripe's
 * hosted payment page.  Uses the Stripe PHP SDK (loaded via Composer) OR
 * the lightweight manual HTTP approach so you don't need Composer.
 *
 * Flow:
 *   checkout.php  →  POST here  →  Stripe hosted page  →  stripe_return.php
 */
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

// ── Guards ────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /gadget/pages/checkout.php');
    exit;
}

$cart = getCart();
if (empty($cart)) {
    header('Location: /gadget/pages/cart.php');
    exit;
}

// ── Pull Stripe keys from DB settings ────────────────────────
$r = $conn->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('stripe_secret_key','stripe_publishable_key')");
$stripeKeys = [];
while ($row = $r->fetch_assoc()) $stripeKeys[$row['setting_key']] = $row['setting_value'];

$secretKey = $stripeKeys['stripe_secret_key'] ?? '';
if (!$secretKey || !str_starts_with($secretKey, 'sk_')) {
    $_SESSION['checkout_error'] = 'Stripe is not configured yet. Please contact support or choose another payment method.';
    header('Location: /gadget/pages/checkout.php');
    exit;
}

// ── Collect & validate posted checkout fields ─────────────────
$firstName = sanitize($_POST['first_name'] ?? '');
$lastName  = sanitize($_POST['last_name']  ?? '');
$email     = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$phone     = sanitize($_POST['phone']   ?? '');
$address   = sanitize($_POST['address'] ?? '');
$city      = sanitize($_POST['city']    ?? '');
$notes     = sanitize($_POST['notes']   ?? '');

$fieldErrors = [];
if (!$firstName)                            $fieldErrors[] = 'First name is required.';
if (!$lastName)                             $fieldErrors[] = 'Last name is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $fieldErrors[] = 'Valid email is required.';
if (!$phone)                                $fieldErrors[] = 'Phone number is required.';
if (!$address)                              $fieldErrors[] = 'Address is required.';
if (!$city)                                 $fieldErrors[] = 'City is required.';

if (!empty($fieldErrors)) {
    $_SESSION['checkout_error'] = implode(' ', $fieldErrors);
    // Repopulate form data
    $_SESSION['checkout_form'] = $_POST;
    header('Location: /gadget/pages/checkout.php');
    exit;
}

// ── Build cart totals ─────────────────────────────────────────
$ids = implode(',', array_map('intval', array_keys($cart)));
$res = $conn->query("SELECT id, name, price, image_url FROM products WHERE id IN ($ids)");
$cartItems = [];
$cartTotal = 0;
while ($row = $res->fetch_assoc()) {
    $row['qty']      = $cart[$row['id']];
    $row['subtotal'] = $row['price'] * $row['qty'];
    $cartTotal      += $row['subtotal'];
    $cartItems[]     = $row;
}

$shipping  = $cartTotal >= 5000 ? 0 : 150;
$grandTotal = $cartTotal + $shipping;   // BDT

// ── Save a PENDING order first (so we have an ID to reference) ─
$orderNum     = generateOrderNumber();
$shippingAddr = "$firstName $lastName, $address, $city. Phone: $phone";
$payment      = 'stripe';

if (isLoggedIn()) {
    $uid  = (int)$_SESSION['user_id'];
    $stmt = $conn->prepare("INSERT INTO orders (user_id,order_number,total_amount,status,payment_method,shipping_address,notes,payment_status)
                             VALUES (?,?,?,'pending','stripe',?,?,'unpaid')");
    $stmt->bind_param('isdss', $uid, $orderNum, $grandTotal, $shippingAddr, $notes);
} else {
    $stmt = $conn->prepare("INSERT INTO orders (user_id,order_number,total_amount,status,payment_method,shipping_address,notes,payment_status)
                             VALUES (NULL,?,?,'pending','stripe',?,?,'unpaid')");
    $stmt->bind_param('sdss', $orderNum, $grandTotal, $shippingAddr, $notes);
}
$stmt->execute();
$orderId = $conn->insert_id;

// Insert order items
foreach ($cartItems as $item) {
    $si = $conn->prepare("INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)");
    $si->bind_param('iiid', $orderId, $item['id'], $item['qty'], $item['price']);
    $si->execute();
}

// ── Build Stripe line items ───────────────────────────────────
$cur          = getActiveCurrency();
$stripeCode   = getStripeCurrencyCode();
$zeroDecimal  = in_array($cur['code'], ['JPY', 'BDT', 'INR']);

$lineItems = [];
foreach ($cartItems as $item) {
    $unitAmountBDT = $item['price'];
    $unitConverted = $unitAmountBDT * $cur['rate'];
    $unitStripe    = $zeroDecimal ? (int)round($unitConverted) : (int)round($unitConverted * 100);

    $lineItems[] = [
        'price_data' => [
            'currency'     => $stripeCode,
            'unit_amount'  => $unitStripe,
            'product_data' => [
                'name'   => $item['name'],
                'images' => [$item['image_url']],
            ],
        ],
        'quantity' => $item['qty'],
    ];
}

// Shipping line item (if applicable)
if ($shipping > 0) {
    $shippingConverted = $shipping * $cur['rate'];
    $shippingStripe    = $zeroDecimal ? (int)round($shippingConverted) : (int)round($shippingConverted * 100);
    $lineItems[] = [
        'price_data' => [
            'currency'    => $stripeCode,
            'unit_amount' => $shippingStripe,
            'product_data'=> ['name' => 'Shipping'],
        ],
        'quantity' => 1,
    ];
}

$baseUrl     = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
$successUrl  = $baseUrl . '/gadget/pages/stripe_return.php?order_id=' . $orderId . '&session_id={CHECKOUT_SESSION_ID}';
$cancelUrl   = $baseUrl . '/gadget/pages/checkout.php?stripe_cancel=1';

// ── Create Stripe Checkout Session via cURL (no Composer needed) ─
$postData = [
    'mode'                => 'payment',
    'success_url'         => $successUrl,
    'cancel_url'          => $cancelUrl,
    'customer_email'      => $email,
    'metadata[order_id]'  => $orderId,
    'metadata[order_num]' => $orderNum,
    'payment_intent_data[metadata][order_id]'  => $orderId,
    'payment_intent_data[metadata][order_num]' => $orderNum,
];

// Encode line items as form fields
foreach ($lineItems as $i => $li) {
    $pd = $li['price_data'];
    $postData["line_items[$i][price_data][currency]"]                    = $pd['currency'];
    $postData["line_items[$i][price_data][unit_amount]"]                 = $pd['unit_amount'];
    $postData["line_items[$i][price_data][product_data][name]"]          = $pd['product_data']['name'];
    if (!empty($pd['product_data']['images'][0])) {
        $img = $pd['product_data']['images'][0];
        // Stripe only accepts HTTPS images; skip if local/unsplash already HTTPS
        if (str_starts_with($img, 'https://')) {
            $postData["line_items[$i][price_data][product_data][images][0]"] = $img;
        }
    }
    $postData["line_items[$i][quantity]"] = $li['quantity'];
}

$ch = curl_init('https://api.stripe.com/v1/checkout/sessions');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query($postData),
    CURLOPT_USERPWD        => $secretKey . ':',
    CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_SSL_VERIFYPEER => true,
]);
$response = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$session = json_decode($response, true);

if ($httpCode !== 200 || empty($session['url'])) {
    // Log error and fall back
    $errMsg = $session['error']['message'] ?? 'Unknown Stripe error.';
    // Mark order as cancelled since Stripe session failed
    $conn->query("UPDATE orders SET status='cancelled' WHERE id=$orderId");
    $_SESSION['checkout_error'] = 'Stripe error: ' . $errMsg . ' Please try another payment method.';
    header('Location: /gadget/pages/checkout.php');
    exit;
}

// Save Stripe session ID onto the order
$sid = $conn->real_escape_string($session['id']);
$conn->query("UPDATE orders SET stripe_session_id='$sid' WHERE id=$orderId");

// Store order info in session so we can clear the cart after success
$_SESSION['pending_stripe_order'] = $orderId;

// ── Redirect to Stripe hosted checkout ───────────────────────
header('Location: ' . $session['url']);
exit;
