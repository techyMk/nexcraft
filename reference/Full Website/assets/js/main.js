// ── Auto-detect base path (works on localhost/gadget AND production root)
const _BASE = window.location.pathname.startsWith('/gadget') ? '/gadget' : '';

// ── Cart AJAX ─────────────────────────────────────────────
function cartRequest(data, onSuccess) {
    fetch(_BASE + '/pages/cart_action.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(data)
    })
    .then(r => r.json())
    .then(d => { if (d.success) { updateCartBadge(d.cart_count); if (onSuccess) onSuccess(d); } })
    .catch(e => console.error('Cart error:', e));
}

function updateCartBadge(count) {
    document.querySelectorAll('.cart-badge').forEach(el => {
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    });
}

function updateCartTotals(data) {
    const sub = document.getElementById('cart-subtotal');
    const tot = document.getElementById('cart-total');
    if (sub && data.subtotal) sub.textContent = data.subtotal;
    if (tot && data.formatted_total) tot.textContent = data.formatted_total;
}

// ── Add to cart buttons ───────────────────────────────────
document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-id].product-add-btn, button[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    btn.disabled = true;
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding…';
    cartRequest({action:'add', product_id:id, qty:1}, function(d) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
        btn.style.background = 'rgba(34,197,94,0.15)';
        btn.style.color = '#4ade80';
        btn.style.borderColor = 'rgba(34,197,94,0.3)';
        setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; btn.style = ''; }, 1800);
    });
});

// ── Cart page qty controls ────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Qty buttons on cart page
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            const input = item.querySelector('.qty-input');
            const id = item.dataset.id;
            let qty = parseInt(input.value);
            qty = this.dataset.dir === 'up' ? Math.min(qty+1,99) : Math.max(qty-1,1);
            input.value = qty;
            cartRequest({action:'update', product_id:id, qty:qty}, function(d) {
                updateCartTotals(d);
            });
        });
    });

    // Qty input change
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const item = this.closest('.cart-item');
            const id = item.dataset.id;
            let qty = Math.max(1, Math.min(99, parseInt(this.value)||1));
            this.value = qty;
            cartRequest({action:'update', product_id:id, qty:qty}, updateCartTotals);
        });
    });

    // Remove buttons — form submit (server-side fallback + AJAX enhancement)
    document.querySelectorAll('.remove-form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const id   = this.dataset.id;
            const item = this.closest('.cart-item');

            // Animate out
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity    = '0';
            item.style.transform  = 'translateX(24px)';

            cartRequest({action: 'remove', product_id: id}, function(d) {
                item.remove();
                updateCartTotals(d);
                const remaining = document.querySelectorAll('.cart-item').length;
                if (remaining === 0 || d.cart_count == 0) {
                    location.reload();
                }
            });
        });
    });

    // ── Hamburger menu ────────────────────────────────────
    const burger = document.getElementById('hamburger');
    const menu   = document.getElementById('mobileMenu');
    if (burger && menu) {
        burger.addEventListener('click', () => {
            menu.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        });
        document.addEventListener('click', e => {
            if (!menu.contains(e.target) && !burger.contains(e.target)) {
                menu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ── Countdown timer ───────────────────────────────────
    const hours = document.getElementById('count-hours');
    const mins  = document.getElementById('count-mins');
    const secs  = document.getElementById('count-secs');
    if (hours && mins && secs) {
        let h = 11, m = 59, s = 59;
        function tick() {
            s--; if(s<0){s=59;m--;} if(m<0){m=59;h--;} if(h<0){h=0;m=0;s=0;}
            hours.textContent = String(h).padStart(2,'0');
            mins.textContent  = String(m).padStart(2,'0');
            secs.textContent  = String(s).padStart(2,'0');
        }
        setInterval(tick, 1000);
    }

    // ── Scroll animations ─────────────────────────────────
    const obs = new IntersectionObserver(entries => {
        entries.forEach(el => {
            if (el.isIntersecting) { el.target.classList.add('visible'); obs.unobserve(el.target); }
        });
    }, {threshold: 0.1});
    document.querySelectorAll('.product-card,.cat-card,.testimonial-card,.dash-card').forEach(el => {
        el.classList.add('fade-in');
        obs.observe(el);
    });

    // ── Sticky navbar shadow ──────────────────────────────
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,0.4)' : 'none';
    });

    // ── Newsletter form ───────────────────────────────────
    const nf = document.getElementById('newsletter-form');
    if (nf) {
        nf.addEventListener('submit', e => {
            e.preventDefault();
            const btn = nf.querySelector('button');
            btn.textContent = '✓ Subscribed!';
            btn.style.background = '#22c55e';
            setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; nf.reset(); }, 3000);
        });
    }
});
