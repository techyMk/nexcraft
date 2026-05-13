<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

$cart = getCart();
if (empty($cart)) { header('Location: /gadget/pages/cart.php'); exit; }

$cartItems = []; $cartTotal = 0;
$ids = implode(',', array_map('intval', array_keys($cart)));
$res = $conn->query("SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id IN ($ids)");
while ($row = $res->fetch_assoc()) {
    $row['qty'] = $cart[$row['id']]; $row['subtotal'] = $row['price'] * $row['qty'];
    $cartTotal += $row['subtotal']; $cartItems[] = $row;
}
$shipping   = $cartTotal >= 5000 ? 0 : 150;
$grandTotal = $cartTotal + $shipping;

// ── Handle errors / session messages ─────────────────────────
$errors = [];
if (!empty($_SESSION['checkout_error'])) {
    $errors[] = $_SESSION['checkout_error'];
    unset($_SESSION['checkout_error']);
}
if (isset($_GET['stripe_cancel'])) {
    $errors[] = 'Stripe payment was cancelled. You can try again or choose another payment method.';
}

// Repopulate form from session (set by stripe_checkout.php on validation error)
$savedForm = $_SESSION['checkout_form'] ?? [];
unset($_SESSION['checkout_form']);

// ── Handle non-Stripe POST (COD / bKash / Nagad) ─────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $firstName = sanitize($_POST['first_name'] ?? '');
    $lastName  = sanitize($_POST['last_name']  ?? '');
    $email     = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $phone     = sanitize($_POST['phone']   ?? '');
    $address   = sanitize($_POST['address'] ?? '');
    $city      = sanitize($_POST['city']    ?? '');
    $payment   = sanitize($_POST['payment'] ?? '');
    $notes     = sanitize($_POST['notes']   ?? '');

    if (!$firstName) $errors[] = 'First name is required.';
    if (!$lastName)  $errors[] = 'Last name is required.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Valid email is required.';
    if (!$phone)     $errors[] = 'Phone number is required.';
    if (!$address)   $errors[] = 'Address is required.';
    if (!$city)      $errors[] = 'City is required.';
    if (!$payment)   $errors[] = 'Payment method is required.';

    if (empty($errors)) {
        $orderNum    = generateOrderNumber();
        $shippingAddr = "$firstName $lastName, $address, $city. Phone: $phone";
        if (isLoggedIn()) {
            $userId = (int)$_SESSION['user_id'];
            $stmt = $conn->prepare("INSERT INTO orders (user_id,order_number,total_amount,status,payment_method,shipping_address,notes) VALUES (?,?,?,'pending',?,?,?)");
            $stmt->bind_param('isdsss', $userId, $orderNum, $grandTotal, $payment, $shippingAddr, $notes);
        } else {
            $stmt = $conn->prepare("INSERT INTO orders (user_id,order_number,total_amount,status,payment_method,shipping_address,notes) VALUES (NULL,?,?,'pending',?,?,?)");
            $stmt->bind_param('sdsss', $orderNum, $grandTotal, $payment, $shippingAddr, $notes);
        }
        $stmt->execute(); $orderId = $conn->insert_id;
        foreach ($cartItems as $item) {
            $si = $conn->prepare("INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)");
            $si->bind_param('iiid', $orderId, $item['id'], $item['qty'], $item['price']); $si->execute();
        }
        $_SESSION['cart'] = []; $_SESSION['last_order'] = $orderNum;
        header('Location: /gadget/pages/order_success.php'); exit;
    }
}

$user = getCurrentUser();

// ── Load Stripe publishable key for JS ────────────────────────
$stripeRow = $conn->query("SELECT setting_value FROM settings WHERE setting_key='stripe_publishable_key' LIMIT 1");
$stripePk  = $stripeRow ? ($stripeRow->fetch_assoc()['setting_value'] ?? '') : '';
$stripeEnabled = $stripePk && str_starts_with($stripePk, 'pk_');

// ── Active currency for display ───────────────────────────────
$activeCur = getActiveCurrency();

$pageTitle = 'Checkout – GadgetZone';
require_once __DIR__ . '/../includes/header.php';
?>
<div class="page-wrapper"><div class="container">
<div class="breadcrumb"><a href="/gadget/index.php">Home</a><span class="sep">›</span><a href="/gadget/pages/cart.php">Cart</a><span class="sep">›</span><span>Checkout</span></div>
<h1 style="font-family:var(--font-head);font-size:32px;font-weight:800;margin-bottom:32px">Checkout</h1>

<?php if (!empty($errors)): ?>
<div class="alert alert-danger"><i class="fa-solid fa-circle-exclamation"></i> <?= implode('<br>', array_map('htmlspecialchars', $errors)) ?></div>
<?php endif; ?>

<!-- ── The main checkout form posts to stripe_checkout.php when Stripe is selected,
         or processes locally for COD/bKash/Nagad ──────────────────────────── -->
<form method="POST" id="checkoutForm" action="/gadget/pages/checkout.php">
<div class="checkout-layout">
<div>
    <!-- Step 1: Contact -->
    <div class="checkout-section">
        <h2 class="checkout-section-title"><span class="step-num">1</span> Contact Information</h2>
        <div class="form-row">
            <div class="form-group"><label class="form-label">First Name *</label><input type="text" name="first_name" class="form-control" value="<?= htmlspecialchars($user['first_name'] ?? $_POST['first_name'] ?? $savedForm['first_name'] ?? '') ?>" required></div>
            <div class="form-group"><label class="form-label">Last Name *</label><input type="text" name="last_name" class="form-control" value="<?= htmlspecialchars($user['last_name'] ?? $_POST['last_name'] ?? $savedForm['last_name'] ?? '') ?>" required></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Email *</label><input type="email" name="email" class="form-control" value="<?= htmlspecialchars($user['email'] ?? $_POST['email'] ?? $savedForm['email'] ?? '') ?>" required></div>
            <div class="form-group"><label class="form-label">Phone *</label><input type="tel" name="phone" class="form-control" value="<?= htmlspecialchars($user['phone'] ?? $_POST['phone'] ?? $savedForm['phone'] ?? '') ?>" required placeholder="+880 1X00-000000"></div>
        </div>
    </div>

    <!-- Step 2: Shipping -->
    <div class="checkout-section">
        <h2 class="checkout-section-title"><span class="step-num">2</span> Shipping Address</h2>
        <div class="form-group"><label class="form-label">Street Address *</label><input type="text" name="address" class="form-control" value="<?= htmlspecialchars($user['address'] ?? $_POST['address'] ?? $savedForm['address'] ?? '') ?>" required placeholder="House no, Road, Area"></div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">City *</label><input type="text" name="city" class="form-control" value="<?= htmlspecialchars($user['city'] ?? $_POST['city'] ?? $savedForm['city'] ?? '') ?>" required placeholder="Dhaka"></div>
            <div class="form-group"><label class="form-label">Country</label><input type="text" class="form-control" value="Bangladesh" readonly></div>
        </div>
        <div class="form-group"><label class="form-label">Order Notes (optional)</label><textarea name="notes" class="form-control" rows="3" placeholder="Special delivery instructions…"><?= htmlspecialchars($_POST['notes'] ?? $savedForm['notes'] ?? '') ?></textarea></div>
    </div>

    <!-- Step 3: Payment -->
    <div class="checkout-section">
        <h2 class="checkout-section-title"><span class="step-num">3</span> Payment Method</h2>
        <div class="payment-options">
            <!-- Local payment options -->
            <?php foreach(['cod'=>['Cash on Delivery','💵'],'bkash'=>['bKash','💳'],'nagad'=>['Nagad','💳']] as $v=>[$l,$icon]): ?>
            <label class="payment-option" onclick="selectPayment('<?= $v ?>')">
                <input type="radio" name="payment" value="<?= $v ?>" <?= (($_POST['payment'] ?? $savedForm['payment'] ?? '')===$v)?'checked':'' ?>>
                <span class="payment-option-name"><?= $l ?></span>
                <span class="payment-option-icon"><?= $icon ?></span>
            </label>
            <?php endforeach; ?>

            <!-- Stripe Card option -->
            <?php if ($stripeEnabled): ?>
            <label class="payment-option payment-stripe-option" onclick="selectPayment('stripe')" id="stripePaymentLabel">
                <input type="radio" name="payment" value="stripe" <?= (($_POST['payment'] ?? $savedForm['payment'] ?? '')==='stripe')?'checked':'' ?>>
                <span class="payment-option-name">
                    Credit / Debit Card
                    <span class="stripe-badge"><i class="fa-brands fa-stripe"></i> Powered by Stripe</span>
                </span>
                <span class="payment-option-icon" style="display:flex;gap:4px;font-size:20px">
                    <i class="fa-brands fa-cc-visa"></i>
                    <i class="fa-brands fa-cc-mastercard"></i>
                    <i class="fa-brands fa-cc-amex"></i>
                </span>
            </label>
            <?php else: ?>
            <div class="payment-option" style="opacity:0.5;cursor:not-allowed" title="Configure Stripe keys in Admin → Settings">
                <span class="payment-option-name">
                    Credit / Debit Card
                    <span class="stripe-badge" style="background:rgba(255,255,255,0.05)"><i class="fa-solid fa-gear"></i> Setup required</span>
                </span>
                <span class="payment-option-icon" style="font-size:20px"><i class="fa-brands fa-cc-visa"></i></span>
            </div>
            <?php endif; ?>
        </div>

        <!-- Stripe currency notice -->
        <?php if ($stripeEnabled && $activeCur['code'] !== 'BDT'): ?>
        <div class="stripe-currency-note" id="stripeCurrencyNote" style="display:none">
            <i class="fa-solid fa-circle-info"></i>
            Card payment will be charged in <strong><?= htmlspecialchars($activeCur['code']) ?></strong>
            (<?= htmlspecialchars($activeCur['name']) ?>).
            Estimated total: <strong><?= formatPrice($grandTotal) ?></strong>
        </div>
        <?php elseif ($stripeEnabled): ?>
        <div class="stripe-currency-note" id="stripeCurrencyNote" style="display:none">
            <i class="fa-solid fa-circle-info"></i>
            Card payment is processed securely via Stripe. Amount in <strong>USD</strong> (Stripe does not support BDT directly).
            Estimated: <strong>$<?= number_format($grandTotal * 0.0091, 2) ?></strong>
        </div>
        <?php endif; ?>
    </div>
</div>

<!-- Order Review Sidebar -->
<div>
    <div class="checkout-section" style="position:sticky;top:calc(var(--nav-h) + var(--catnav-h) + 16px)">
        <h2 class="checkout-section-title"><span class="step-num">✓</span> Order Review</h2>
        <?php foreach ($cartItems as $item): ?>
        <div class="order-review-item">
            <div class="order-review-item-img"><img src="<?= htmlspecialchars($item['image_url']) ?>" alt=""></div>
            <div class="order-review-item-name"><?= htmlspecialchars($item['name']) ?><div class="order-review-item-qty">Qty: <?= $item['qty'] ?></div></div>
            <div class="order-review-item-price"><?= formatPrice($item['subtotal']) ?></div>
        </div>
        <?php endforeach; ?>
        <div style="margin-top:16px">
            <div class="summary-row"><span>Subtotal</span><span><?= formatPrice($cartTotal) ?></span></div>
            <div class="summary-row"><span>Shipping</span><span><?= $shipping===0 ? '<span style="color:var(--success)">Free</span>' : formatPrice($shipping) ?></span></div>
            <div class="summary-row total" style="border-top:1px solid var(--border);padding-top:16px"><span>Total</span><span><?= formatPrice($grandTotal) ?></span></div>
        </div>
        <button type="submit" id="placeOrderBtn" class="btn btn-primary btn-block btn-lg" style="margin-top:20px">
            <i class="fa-solid fa-lock"></i>
            <span id="btnText">Place Order – <?= formatPrice($grandTotal) ?></span>
        </button>
        <p style="text-align:center;font-size:12px;color:var(--text3);margin-top:14px">
            <i class="fa-solid fa-shield-halved"></i> Your information is secure &amp; encrypted
        </p>
    </div>
</div>
</div>
</form>
</div></div>

<style>
.payment-stripe-option { border-color: rgba(99,91,255,0.3); }
.payment-stripe-option:has(input:checked),
.payment-stripe-option.selected { border-color: #635BFF !important; background: rgba(99,91,255,0.06) !important; }
.stripe-badge { display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 8px; background:rgba(99,91,255,0.12); color:#a5b4fc; border-radius:20px; margin-left:8px; font-weight:600; }
.stripe-currency-note { margin-top:14px; padding:12px 14px; background:rgba(99,91,255,0.08); border:1px solid rgba(99,91,255,0.2); border-radius:8px; font-size:13px; color:#a5b4fc; }
</style>

<script>
function selectPayment(method) {
    const note = document.getElementById('stripeCurrencyNote');
    if (note) note.style.display = (method === 'stripe') ? 'block' : 'none';
}

// If stripe was already selected on page load (after redirect-back)
(function(){
    const checked = document.querySelector('input[name="payment"]:checked');
    if (checked && checked.value === 'stripe') selectPayment('stripe');
})();

// On submit, redirect Stripe payments to stripe_checkout.php
document.getElementById('checkoutForm').addEventListener('submit', function(e) {
    const payment = document.querySelector('input[name="payment"]:checked');
    if (payment && payment.value === 'stripe') {
        e.preventDefault();
        this.action = '/gadget/pages/stripe_checkout.php';
        this.submit();
    }
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
