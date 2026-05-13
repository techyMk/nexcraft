<?php
// ── Currency Configuration ───────────────────────────────────
// All amounts in the DB are stored in BDT (Bangladeshi Taka).
// The active currency is saved in the `settings` table and
// cached in a PHP session for fast access.

define('CURRENCIES', [
    'BDT' => ['symbol' => '৳',  'name' => 'Bangladeshi Taka',  'code' => 'BDT', 'rate' => 1.00,       'stripe_code' => 'usd', 'flag' => '🇧🇩', 'decimals' => 0],
    'USD' => ['symbol' => '$',  'name' => 'US Dollar',          'code' => 'USD', 'rate' => 0.0091,     'stripe_code' => 'usd', 'flag' => '🇺🇸', 'decimals' => 2],
    'EUR' => ['symbol' => '€',  'name' => 'Euro',               'code' => 'EUR', 'rate' => 0.0084,     'stripe_code' => 'eur', 'flag' => '🇪🇺', 'decimals' => 2],
    'GBP' => ['symbol' => '£',  'name' => 'British Pound',      'code' => 'GBP', 'rate' => 0.0072,     'stripe_code' => 'gbp', 'flag' => '🇬🇧', 'decimals' => 2],
    'CAD' => ['symbol' => 'C$', 'name' => 'Canadian Dollar',    'code' => 'CAD', 'rate' => 0.0124,     'stripe_code' => 'cad', 'flag' => '🇨🇦', 'decimals' => 2],
    'AUD' => ['symbol' => 'A$', 'name' => 'Australian Dollar',  'code' => 'AUD', 'rate' => 0.0140,     'stripe_code' => 'aud', 'flag' => '🇦🇺', 'decimals' => 2],
    'INR' => ['symbol' => '₹',  'name' => 'Indian Rupee',       'code' => 'INR', 'rate' => 0.76,       'stripe_code' => 'inr', 'flag' => '🇮🇳', 'decimals' => 0],
    'SGD' => ['symbol' => 'S$', 'name' => 'Singapore Dollar',   'code' => 'SGD', 'rate' => 0.0122,     'stripe_code' => 'sgd', 'flag' => '🇸🇬', 'decimals' => 2],
    'SAR' => ['symbol' => '﷼',  'name' => 'Saudi Riyal',        'code' => 'SAR', 'rate' => 0.034,      'stripe_code' => 'sar', 'flag' => '🇸🇦', 'decimals' => 2],
    'AED' => ['symbol' => 'د.إ','name' => 'UAE Dirham',         'code' => 'AED', 'rate' => 0.033,      'stripe_code' => 'aed', 'flag' => '🇦🇪', 'decimals' => 2],
    'JPY' => ['symbol' => '¥',  'name' => 'Japanese Yen',       'code' => 'JPY', 'rate' => 1.39,       'stripe_code' => 'jpy', 'flag' => '🇯🇵', 'decimals' => 0],
    'MYR' => ['symbol' => 'RM', 'name' => 'Malaysian Ringgit',  'code' => 'MYR', 'rate' => 0.042,      'stripe_code' => 'myr', 'flag' => '🇲🇾', 'decimals' => 2],
]);

/**
 * Get the active currency array from DB-backed session cache.
 */
function getActiveCurrency(): array {
    global $conn;
    // Use session cache to avoid repeated DB hits
    if (isset($_SESSION['active_currency']) && isset(CURRENCIES[$_SESSION['active_currency']])) {
        return CURRENCIES[$_SESSION['active_currency']];
    }
    // Load from DB
    $row = null;
    if ($conn) {
        $r = $conn->query("SELECT setting_value FROM settings WHERE setting_key='active_currency' LIMIT 1");
        if ($r && $row = $r->fetch_assoc()) {
            $_SESSION['active_currency'] = $row['setting_value'];
        }
    }
    $code = (isset($row['setting_value']) && isset(CURRENCIES[$row['setting_value']])) ? $row['setting_value'] : 'BDT';
    $_SESSION['active_currency'] = $code;
    return CURRENCIES[$code];
}

/**
 * Convert a BDT amount to the active currency and format it.
 */
function formatPrice(float $bdtAmount): string {
    $cur = getActiveCurrency();
    $converted = $bdtAmount * $cur['rate'];
    return $cur['symbol'] . number_format($converted, $cur['decimals'], '.', ',');
}

/**
 * Convert BDT amount to active currency numeric value.
 */
function convertAmount(float $bdtAmount): float {
    $cur = getActiveCurrency();
    return round($bdtAmount * $cur['rate'], $cur['decimals']);
}

/**
 * Get Stripe amount in the smallest currency unit (cents / paisa etc.)
 * Always converts to USD for Stripe Sandbox when local currency isn't supported.
 */
function getStripeAmount(float $bdtAmount): int {
    $cur = getActiveCurrency();
    $converted = $bdtAmount * $cur['rate'];
    // Zero-decimal currencies (JPY, BDT, INR, etc.)
    $zeroDecimal = ['BDT','JPY','INR'];
    if (in_array($cur['code'], $zeroDecimal)) {
        return (int)round($converted);
    }
    return (int)round($converted * 100);
}

/**
 * Get the Stripe currency code for the active currency.
 * Falls back to USD for currencies Stripe sandbox may not support.
 */
function getStripeCurrencyCode(): string {
    $cur = getActiveCurrency();
    return strtolower($cur['stripe_code'] ?? 'usd');
}
