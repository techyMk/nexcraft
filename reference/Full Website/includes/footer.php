<!-- ── FOOTER ──────────────────────────────────────────── -->
<footer class="footer">
    <div class="footer-top">
        <div class="container footer-grid">
            <!-- Brand -->
            <div class="footer-col brand-col">
                <a href="/gadget/index.php" class="logo" style="margin-bottom:16px;display:inline-flex">
                    <span class="logo-icon"><i class="fa-solid fa-bolt"></i></span>
                    <span class="logo-text" style="color:#fff">Gadget<strong>Zone</strong></span>
                </a>
                <p>Your ultimate destination for the latest gadgets, tech accessories, and cutting-edge electronics.</p>
                <div class="social-links">
                    <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                    <a href="#" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                </div>
            </div>

            <!-- Quick Links -->
            <div class="footer-col">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="/gadget/index.php">Home</a></li>
                    <li><a href="/gadget/pages/shop.php">Shop</a></li>
                    <li><a href="/gadget/pages/cart.php">Cart</a></li>
                    <li><a href="/gadget/pages/myaccount.php">My Account</a></li>
                </ul>
            </div>

            <!-- Categories -->
            <div class="footer-col">
                <h4>Categories</h4>
                <ul>
                    <li><a href="/gadget/pages/shop.php?cat=smartphones">Smartphones</a></li>
                    <li><a href="/gadget/pages/shop.php?cat=laptops">Laptops</a></li>
                    <li><a href="/gadget/pages/shop.php?cat=audio">Audio</a></li>
                    <li><a href="/gadget/pages/shop.php?cat=cameras">Cameras</a></li>
                    <li><a href="/gadget/pages/shop.php?cat=wearables">Wearables</a></li>
                </ul>
            </div>

            <!-- Contact -->
            <div class="footer-col">
                <h4>Contact Us</h4>
                <ul class="contact-list">
                    <li><i class="fa-solid fa-location-dot"></i> 123 Tech Street, Dhaka 1212, Bangladesh</li>
                    <li><i class="fa-solid fa-phone"></i> +880 1700-000000</li>
                    <li><i class="fa-solid fa-envelope"></i> support@gadgetzone.com</li>
                    <li><i class="fa-regular fa-clock"></i> Mon–Sat: 9am – 8pm</li>
                </ul>
            </div>
        </div>
    </div>

    <!-- Payment badges -->
    <div class="footer-payments">
        <div class="container">
            <span>We Accept:</span>
            <div class="payment-icons">
                <span><i class="fa-brands fa-cc-visa"></i></span>
                <span><i class="fa-brands fa-cc-mastercard"></i></span>
                <span><i class="fa-brands fa-cc-paypal"></i></span>
                <span><i class="fa-brands fa-cc-amex"></i></span>
                <span class="bkash-badge">bKash</span>
                <span class="nagad-badge">Nagad</span>
            </div>
        </div>
    </div>

    <div class="footer-bottom">
        <div class="container">
            <p>© <?= date('Y') ?> GadgetZone. All rights reserved. Built with ❤️ in Bangladesh.</p>
        </div>
    </div>
</footer>

<script src="/gadget/assets/js/main.js?v=<?= filemtime(__DIR__ . '/../assets/js/main.js') ?>"></script>
<?= $extraScripts ?? '' ?>
</body>
</html>
