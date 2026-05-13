<?php
$pageTitle = 'Settings – Admin';
require_once __DIR__ . '/layout.php';

$success = '';
$errors  = [];

// ── Save settings ────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Currency
    if (isset($_POST['active_currency'])) {
        $currency = $conn->real_escape_string($_POST['active_currency']);
        if (array_key_exists($currency, CURRENCIES)) {
            $conn->query("INSERT INTO settings (setting_key,setting_value) VALUES ('active_currency','$currency')
                          ON DUPLICATE KEY UPDATE setting_value='$currency'");
            // Invalidate session cache so next page load picks up new currency
            unset($_SESSION['active_currency']);
        } else {
            $errors[] = 'Invalid currency selected.';
        }
    }

    // Stripe keys
    $stripeKeys = ['stripe_publishable_key', 'stripe_secret_key', 'stripe_webhook_secret'];
    foreach ($stripeKeys as $key) {
        if (isset($_POST[$key])) {
            $val = $conn->real_escape_string(trim($_POST[$key]));
            $conn->query("INSERT INTO settings (setting_key,setting_value) VALUES ('$key','$val')
                          ON DUPLICATE KEY UPDATE setting_value='$val'");
        }
    }

    if (empty($errors)) $success = 'Settings saved successfully.';
}

// ── Load current settings ────────────────────────────────────
$settingsRaw = $conn->query("SELECT setting_key, setting_value FROM settings");
$cfg = [];
while ($r = $settingsRaw->fetch_assoc()) $cfg[$r['setting_key']] = $r['setting_value'];

$activeCurrencyCode  = $cfg['active_currency']          ?? 'BDT';
$stripePublishable   = $cfg['stripe_publishable_key']    ?? '';
$stripeSecret        = $cfg['stripe_secret_key']         ?? '';
$stripeWebhook       = $cfg['stripe_webhook_secret']     ?? '';
?>

<div class="page-actions">
    <h1><i class="fa-solid fa-gear" style="color:var(--accent)"></i> Settings</h1>
</div>

<?php if ($success): ?>
<div class="alert alert-success"><i class="fa-solid fa-check-circle"></i> <?= htmlspecialchars($success) ?></div>
<?php endif; ?>
<?php if (!empty($errors)): ?>
<div class="alert alert-danger"><i class="fa-solid fa-circle-exclamation"></i> <?= implode('<br>', array_map('htmlspecialchars', $errors)) ?></div>
<?php endif; ?>

<form method="POST">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">

<!-- ── Currency Settings ─────────────────────────────────── -->
<div class="admin-card">
    <div class="admin-card-header">
        <div class="admin-card-title"><i class="fa-solid fa-coins" style="color:var(--accent)"></i> Currency</div>
    </div>
    <div class="admin-card-body">
        <p style="font-size:13px;color:var(--a-text2);margin-bottom:20px">
            All product prices are stored in BDT. The selected currency will be used for display and Stripe checkout.
            Exchange rates are approximate and for display purposes.
        </p>

        <div class="form-group">
            <label class="form-label">Active Store Currency</label>
            <div class="currency-grid" id="currencyGrid">
                <?php foreach (CURRENCIES as $code => $cur): ?>
                <label class="currency-option <?= $code === $activeCurrencyCode ? 'selected' : '' ?>" id="cur-<?= $code ?>">
                    <input type="radio" name="active_currency" value="<?= $code ?>"
                           <?= $code === $activeCurrencyCode ? 'checked' : '' ?>
                           onchange="document.querySelectorAll('.currency-option').forEach(el=>el.classList.remove('selected'));this.closest('.currency-option').classList.add('selected');">
                    <span class="cur-flag"><?= $cur['flag'] ?></span>
                    <span class="cur-symbol"><?= htmlspecialchars($cur['symbol']) ?></span>
                    <span class="cur-name">
                        <span class="cur-code"><?= $code ?></span>
                        <span class="cur-full"><?= htmlspecialchars($cur['name']) ?></span>
                    </span>
                    <span class="cur-rate"><?= $cur['rate'] == 1 ? 'Base' : '×' . $cur['rate'] ?></span>
                </label>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Live preview -->
        <div class="currency-preview" id="currencyPreview">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--a-text3);margin-bottom:10px">Live Preview</div>
            <div style="display:flex;gap:24px;flex-wrap:wrap">
                <div>
                    <div style="font-size:11px;color:var(--a-text3)">Sample Price</div>
                    <div class="preview-price" style="font-size:22px;font-weight:800;font-family:var(--font-head);color:var(--accent)" id="previewPrice">–</div>
                </div>
                <div>
                    <div style="font-size:11px;color:var(--a-text3)">Original (BDT)</div>
                    <div style="font-size:22px;font-weight:800;font-family:var(--font-head);color:var(--a-text2)">৳149,999</div>
                </div>
            </div>
        </div>

        <div class="alert alert-danger" style="font-size:12px;margin-top:16px;margin-bottom:0">
            <i class="fa-solid fa-circle-info"></i>
            <strong>Bangladesh note:</strong> Stripe does not directly process BDT. When customers pay with Stripe,
            the amount is automatically converted to the selected currency above. For local payments, bKash/Nagad/COD are unaffected.
        </div>
    </div>
</div>

<!-- ── Stripe Settings ───────────────────────────────────── -->
<div class="admin-card">
    <div class="admin-card-header">
        <div class="admin-card-title"><i class="fa-brands fa-stripe" style="color:#635BFF"></i> Stripe Payment</div>
        <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Stripe Dashboard
        </a>
    </div>
    <div class="admin-card-body">
        <p style="font-size:13px;color:var(--a-text2);margin-bottom:20px">
            Enter your Stripe <strong>test (sandbox)</strong> keys from
            <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" style="color:var(--accent)">dashboard.stripe.com</a>.
            Keys starting with <code style="color:var(--accent)">pk_test_</code> / <code style="color:var(--accent)">sk_test_</code> are sandbox keys.
        </p>

        <div class="form-group">
            <label class="form-label">Publishable Key (pk_test_…)</label>
            <input type="text" name="stripe_publishable_key" class="form-control"
                   value="<?= htmlspecialchars($stripePublishable) ?>"
                   placeholder="pk_test_51…" autocomplete="off">
            <div class="form-hint">Used in the browser to load Stripe.js</div>
        </div>

        <div class="form-group">
            <label class="form-label">Secret Key (sk_test_…)</label>
            <input type="password" name="stripe_secret_key" class="form-control"
                   value="<?= htmlspecialchars($stripeSecret) ?>"
                   placeholder="sk_test_51…" autocomplete="new-password">
            <div class="form-hint">Server-side only – never share publicly</div>
        </div>

        <div class="form-group">
            <label class="form-label">Webhook Secret (optional)</label>
            <input type="password" name="stripe_webhook_secret" class="form-control"
                   value="<?= htmlspecialchars($stripeWebhook) ?>"
                   placeholder="whsec_…" autocomplete="new-password">
            <div class="form-hint">From Stripe → Webhooks → your endpoint signing secret</div>
        </div>

        <!-- Key status indicators -->
        <div class="stripe-key-status">
            <div class="key-pill <?= str_starts_with($stripePublishable, 'pk_test_') ? 'ok' : (str_starts_with($stripePublishable, 'pk_live_') ? 'live' : 'missing') ?>">
                <i class="fa-solid fa-<?= str_starts_with($stripePublishable, 'pk_test_') ? 'check-circle' : (str_starts_with($stripePublishable, 'pk_live_') ? 'bolt' : 'times-circle') ?>"></i>
                Publishable: <?= str_starts_with($stripePublishable, 'pk_test_') ? 'Sandbox ✓' : (str_starts_with($stripePublishable, 'pk_live_') ? 'LIVE MODE' : 'Not Set') ?>
            </div>
            <div class="key-pill <?= str_starts_with($stripeSecret, 'sk_test_') ? 'ok' : (str_starts_with($stripeSecret, 'sk_live_') ? 'live' : 'missing') ?>">
                <i class="fa-solid fa-<?= str_starts_with($stripeSecret, 'sk_test_') ? 'check-circle' : (str_starts_with($stripeSecret, 'sk_live_') ? 'bolt' : 'times-circle') ?>"></i>
                Secret: <?= str_starts_with($stripeSecret, 'sk_test_') ? 'Sandbox ✓' : (str_starts_with($stripeSecret, 'sk_live_') ? 'LIVE MODE' : 'Not Set') ?>
            </div>
        </div>

        <div style="margin-top:16px;padding:14px;background:rgba(99,91,255,0.08);border:1px solid rgba(99,91,255,0.2);border-radius:var(--radius-sm);font-size:12px;color:var(--a-text2)">
            <strong style="color:#a5b4fc"><i class="fa-solid fa-info-circle"></i> Stripe Test Cards</strong><br>
            Use <code style="color:#a5b4fc">4242 4242 4242 4242</code> with any future date and any CVC for successful test payments.
            Card <code style="color:#f87171">4000 0000 0000 0002</code> simulates a decline.
        </div>
    </div>
</div>

</div><!-- /grid -->

<div style="margin-top:24px;display:flex;gap:12px">
    <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-save"></i> Save All Settings</button>
    <a href="/gadget/admin/index.php" class="btn btn-ghost btn-lg">Cancel</a>
</div>
</form>

<!-- Currency live-preview JS -->
<script>
const RATES = <?= json_encode(array_map(fn($c) => ['symbol'=>$c['symbol'],'rate'=>$c['rate'],'decimals'=>$c['decimals']], CURRENCIES)) ?>;
const SAMPLE_BDT = 149999;

function updatePreview() {
    const sel = document.querySelector('input[name="active_currency"]:checked');
    if (!sel) return;
    const cur = RATES[sel.value];
    if (!cur) return;
    const converted = SAMPLE_BDT * cur.rate;
    const formatted = cur.symbol + converted.toLocaleString('en-US', {
        minimumFractionDigits: cur.decimals,
        maximumFractionDigits: cur.decimals
    });
    document.getElementById('previewPrice').textContent = formatted;
}

document.querySelectorAll('input[name="active_currency"]').forEach(r => r.addEventListener('change', updatePreview));
updatePreview();
</script>

<style>
.currency-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-height:340px;overflow-y:auto;padding-right:4px}
.currency-option{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--a-border);border-radius:var(--radius-sm);cursor:pointer;transition:var(--tr);position:relative}
.currency-option input{position:absolute;opacity:0;pointer-events:none}
.currency-option:hover{border-color:rgba(245,158,11,0.3);background:rgba(245,158,11,0.04)}
.currency-option.selected{border-color:var(--accent);background:rgba(245,158,11,0.08)}
.cur-flag{font-size:20px;line-height:1;flex-shrink:0}
.cur-symbol{font-size:15px;font-weight:800;font-family:var(--font-head);color:var(--accent);min-width:24px;text-align:center}
.cur-name{flex:1;min-width:0}
.cur-code{display:block;font-size:12px;font-weight:700}
.cur-full{display:block;font-size:10px;color:var(--a-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cur-rate{font-size:10px;color:var(--a-text3);flex-shrink:0}
.currency-preview{padding:14px;background:var(--a-surface2);border-radius:var(--radius-sm);margin-top:16px;border:1px solid var(--a-border)}
.stripe-key-status{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.key-pill{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
.key-pill.ok{background:rgba(34,197,94,0.12);color:#4ade80;border:1px solid rgba(34,197,94,0.2)}
.key-pill.live{background:rgba(239,68,68,0.12);color:#f87171;border:1px solid rgba(239,68,68,0.2)}
.key-pill.missing{background:rgba(255,255,255,0.05);color:var(--a-text3);border:1px solid var(--a-border)}
</style>

<?php require_once __DIR__ . '/footer.php'; ?>
