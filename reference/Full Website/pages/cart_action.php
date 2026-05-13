<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
header('Content-Type: application/json');

$action     = $_POST['action']     ?? '';
$product_id = (int)($_POST['product_id'] ?? 0);
$qty        = (int)($_POST['qty']  ?? 1);

function cartResponse() {
    $subtotal = getCartTotal();
    $shipping = ($subtotal > 0 && $subtotal < 5000) ? 150 : 0;
    return [
        'success'         => true,
        'cart_count'      => getCartCount(),
        'subtotal'        => formatPrice($subtotal),
        'formatted_total' => formatPrice($subtotal + $shipping),
        'free_shipping'   => $shipping === 0,
    ];
}

switch ($action) {
    case 'add':    addToCart($product_id, $qty);       echo json_encode(cartResponse()); break;
    case 'update': updateCartQty($product_id, $qty);   echo json_encode(cartResponse()); break;
    case 'remove': removeFromCart($product_id);         echo json_encode(cartResponse()); break;
    default:       echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
