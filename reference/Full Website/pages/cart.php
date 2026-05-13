<?php
$pageTitle = 'Shopping Cart – GadgetZone';
require_once __DIR__ . '/../includes/header.php';

// ── Server-side cart actions (always works, no JS needed) ──
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    if (!empty($_POST['remove_id'])) {
        removeFromCart((int)$_POST['remove_id']);
        header('Location: /gadget/pages/cart.php');
        exit;
    }
}

$cart = getCart();
$cartItems = [];
$cartTotal = 0;
if (!empty($cart)) {
    $ids = implode(',', array_map('intval', array_keys($cart)));
    $res = $conn->query("SELECT p.*, c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id IN ($ids)");
    while ($row = $res->fetch_assoc()) {
        $row['qty']     = $cart[$row['id']];
        $row['subtotal']= $row['price'] * $row['qty'];
        $cartTotal     += $row['subtotal'];
        $cartItems[]    = $row;
    }
}
$shipping   = $cartTotal > 0 && $cartTotal < 5000 ? 150 : 0;
$grandTotal = $cartTotal + $shipping;
?>
<div class="page-wrapper">
<div class="container">
    <div class="breadcrumb">
        <a href="/gadget/index.php">Home</a><span class="sep">›</span><span>Shopping Cart</span>
    </div>
    <h1 style="font-family:var(--font-head);font-size:32px;font-weight:800;margin-bottom:32px">
        Shopping Cart <?php if (!empty($cartItems)): ?><span style="font-size:18px;color:var(--text2);font-weight:400">(<?= getCartCount() ?> items)</span><?php endif; ?>
    </h1>

    <?php if (empty($cartItems)): ?>
    <div class="empty-cart">
        <i class="fa-solid fa-bag-shopping"></i>
        <h2>Your cart is empty</h2>
        <p style="color:var(--text2);margin-bottom:24px">Looks like you haven't added anything yet.</p>
        <a href="/gadget/pages/shop.php" class="btn btn-primary btn-lg">Start Shopping</a>
    </div>
    <?php else: ?>
    <div class="cart-layout">
        <!-- Cart Items -->
        <div>
            <div class="cart-table-header">
                <span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span><span></span>
            </div>
            <?php foreach ($cartItems as $item): ?>
            <div class="cart-item" data-id="<?= $item['id'] ?>">
                <div class="cart-item-info">
                    <div class="cart-item-img"><img src="<?= htmlspecialchars($item['image_url']) ?>" alt="<?= htmlspecialchars($item['name']) ?>"></div>
                    <div>
                        <div class="cart-item-name"><?= htmlspecialchars($item['name']) ?></div>
                        <div class="cart-item-cat"><?= htmlspecialchars($item['cat_name']) ?></div>
                    </div>
                </div>
                <div style="font-weight:700;color:var(--accent)"><?= formatPrice($item['price']) ?></div>
                <div class="qty-control">
                    <button class="qty-btn" data-dir="down"><i class="fa-solid fa-minus"></i></button>
                    <input class="qty-input" type="number" value="<?= $item['qty'] ?>" min="1" max="99" data-id="<?= $item['id'] ?>">
                    <button class="qty-btn" data-dir="up"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div style="font-weight:700"><?= formatPrice($item['subtotal']) ?></div>
                <form method="POST" class="remove-form" data-id="<?= $item['id'] ?>">
                    <input type="hidden" name="remove_id" value="<?= $item['id'] ?>">
                    <button type="submit" class="remove-btn" title="Remove item"><i class="fa-solid fa-xmark"></i></button>
                </form>
            </div>
            <?php endforeach; ?>
            <div style="margin-top:20px">
                <a href="/gadget/pages/shop.php" class="btn btn-outline"><i class="fa-solid fa-arrow-left"></i> Continue Shopping</a>
            </div>
        </div>

        <!-- Order Summary -->
        <div class="cart-summary">
            <div class="summary-title">Order Summary</div>
            <div class="summary-row"><span>Subtotal</span><span id="cart-subtotal"><?= formatPrice($cartTotal) ?></span></div>
            <div class="summary-row"><span>Shipping</span>
                <span><?= $shipping === 0 ? '<span style="color:var(--success)">Free</span>' : formatPrice($shipping) ?></span>
            </div>
            <?php if ($shipping > 0): ?>
            <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Add <?= formatPrice(5000 - $cartTotal) ?> more for free shipping!</div>
            <?php endif; ?>
            <div class="summary-row total"><span>Total</span><span id="cart-total"><?= formatPrice($grandTotal) ?></span></div>

            <!-- Coupon -->
            <div class="coupon-form" style="margin:16px 0">
                <div style="display:flex;gap:8px">
                    <input type="text" class="form-control" placeholder="Coupon code" id="couponInput">
                    <button class="btn btn-outline btn-sm" type="button" onclick="
                        var msg = document.getElementById('couponMsg');
                        msg.style.display='block';
                        setTimeout(function(){msg.style.display='none';},3000);
                    ">Apply</button>
                </div>
                <div id="couponMsg" style="display:none;margin-top:8px;font-size:12px;color:var(--accent);padding:8px 12px;background:rgba(245,158,11,0.1);border-radius:8px;border:1px solid rgba(245,158,11,0.2)">
                    <i class="fa-solid fa-tag"></i> Coupon codes coming soon — stay tuned for exclusive deals!
                </div>
            </div>

            <a href="/gadget/pages/checkout.php" class="btn btn-primary btn-block btn-lg" style="margin-top:8px">
                <i class="fa-solid fa-lock"></i> Proceed to Checkout
            </a>

            <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
                <i class="fa-brands fa-cc-visa" style="font-size:24px;color:var(--text2)"></i>
                <i class="fa-brands fa-cc-mastercard" style="font-size:24px;color:var(--text2)"></i>
                <i class="fa-brands fa-cc-paypal" style="font-size:24px;color:var(--text2)"></i>
                <i class="fa-brands fa-cc-amazon-pay" style="font-size:24px;color:var(--text2)"></i>
            </div>
            <p style="text-align:center;font-size:12px;color:var(--text3);margin-top:12px">
                <i class="fa-solid fa-lock"></i> Secure Checkout Guaranteed
            </p>
        </div>
    </div>
    <?php endif; ?>
</div>
</div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
