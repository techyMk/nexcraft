// ── Modal helpers ─────────────────────────────────────────
function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
// Close on backdrop click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
    }
});
// Close on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => {
            m.classList.remove('open');
            document.body.style.overflow = '';
        });
    }
});

// ── Sidebar toggle (mobile) ───────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const sidebar  = document.getElementById('adminSidebar');
    const toggle   = document.getElementById('sidebarToggle');
    const topToggle= document.getElementById('topbarHamburger');

    function openSidebar()  { sidebar.classList.add('open'); document.body.style.overflow='hidden'; }
    function closeSidebar() { sidebar.classList.remove('open'); document.body.style.overflow=''; }

    if (toggle)    toggle.addEventListener('click', closeSidebar);
    if (topToggle) topToggle.addEventListener('click', openSidebar);

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && e.target !== topToggle) closeSidebar();
        }
    });

    // ── Image URL preview ─────────────────────────────────
    window.previewImg = function(url) {
        const preview = document.getElementById('imgPreview');
        if (!preview) return;
        if (url) { preview.src = url; preview.classList.add('show'); }
        else     { preview.classList.remove('show'); }
    };

    // ── File upload preview ───────────────────────────────
    window.previewFile = function(input) {
        const preview = document.getElementById('imgPreview');
        const urlInput = document.getElementById('imgUrlInput');
        if (!preview || !input.files || !input.files[0]) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.add('show');
            if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(input.files[0]);
    };

    // ── Auto-dismiss alerts ───────────────────────────────
    document.querySelectorAll('.alert').forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease, max-height 0.5s ease';
            alert.style.opacity = '0';
            alert.style.maxHeight = '0';
            alert.style.overflow = 'hidden';
            setTimeout(() => alert.remove(), 500);
        }, 4000);
    });

    // ── Confirm dangerous actions ─────────────────────────
    document.querySelectorAll('[data-confirm]').forEach(el => {
        el.addEventListener('click', function(e) {
            if (!confirm(this.dataset.confirm)) e.preventDefault();
        });
    });

    // ── Topbar: active page highlight ────────────────────
    const current = window.location.pathname;
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        if (a.getAttribute('href') && current.endsWith(a.getAttribute('href').split('/').pop())) {
            a.classList.add('active');
        }
    });
});
