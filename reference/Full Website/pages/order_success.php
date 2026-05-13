<?php
$pageTitle = 'Order Placed – GadgetZone';
require_once __DIR__ . '/../includes/header.php';
$orderNum   = $_SESSION['last_order'] ?? 'N/A';
$isStripe   = isset($_GET['stripe']);
unset($_SESSION['last_order']);
?>
<div class="page-wrapper"><div class="container" style="max-width:600px;text-align:center;padding:80px 24px">
    <div style="width:80px;height:80px;background:rgba(34,197,94,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:36px">✅</div>
    <h1 style="font-family:var(--font-head);font-size:36px;font-weight:800;margin-bottom:12px">
        <?= $isStripe ? 'Payment Confirmed!' : 'Order Placed!' ?>
    </h1>
    <p style="color:var(--text2);font-size:16px;margin-bottom:8px">Thank you for shopping with GadgetZone.</p>
    <?php if ($isStripe): ?>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 18px;background:rgba(99,91,255,0.1);border:1px solid rgba(99,91,255,0.25);border-radius:20px;font-size:13px;color:#a5b4fc;margin-bottom:16px">
        <i class="fa-brands fa-stripe"></i> Payment processed securely via Stripe
    </div>
    <?php endif; ?>
    <p style="color:var(--text2);font-size:15px;margin-bottom:32px">Your order number is <strong style="color:var(--accent)"><?= htmlspecialchars($orderNum) ?></strong>. We'll confirm shortly.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
        <a href="/gadget/pages/myaccount.php?tab=orders" class="btn btn-primary">View My Orders</a>
        <a href="/gadget/pages/shop.php" class="btn btn-outline">Continue Shopping</a>
    </div>
</div></div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
