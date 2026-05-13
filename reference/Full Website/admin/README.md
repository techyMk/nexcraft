# GadgetZone - Full-Featured E-Commerce Website
Build a fully functional, modern e-commerce platform for gadgets using PHP and MySQL. The system should include essential features such as product listings, user authentication, shopping cart, order management, and a responsive UI. Use high-quality product images sourced from https://unsplash.com

## 📁 File Structure

```
gadgetzone/
├── index.php                    # Home page
├── database_setup.sql           # Database schema & sample data
├── includes/
│   ├── db.php                   # Database connection
│   ├── functions.php            # Helper functions
│   ├── header.php               # Shared header
│   └── footer.php               # Shared footer
├── pages/
│   ├── shop.php                 # Product listing page
│   ├── cart.php                 # Shopping cart
│   ├── cart_action.php          # AJAX cart handler
│   ├── checkout.php             # Checkout process
│   ├── order_success.php        # Order confirmation
│   ├── myaccount.php            # User account dashboard
│   ├── login.php                # Login page
│   ├── register.php             # Registration page
│   └── logout.php               # Logout handler
└── assets/
    ├── css/
    │   └── style.css            # Main stylesheet
    └── js/
        └── main.js              # JavaScript functionality
```


### 🏠 HOME PAGE PROMPT


DESIGN AESTHETIC:
- Dark theme background (#0a0a0f) with neon amber accents (#f59e0b)
- Typography: IBM Plex Sans font for headings (bold, 800 weight), DM Sans for body text
- Modern, editorial-style layout with generous spacing
- Smooth animations and hover effects

SECTIONS TO INCLUDE:

1. HERO SECTION:
   - Split layout: Left side with headline, description, CTA buttons, stats
   - Headline: "Your World. Next-Level Technology."
   - Two CTAs: "Shop Now" (primary amber button) and "Explore Deals" (outline button)
   - Stats row: "500+ Products", "50K+ Happy Customers", "4.9★ Average Rating"
   - Right side: Large product image with floating badge showing "Hot Deal Today - Up to 40% Off"

2. FEATURE STRIP:
   - Horizontal bar with 5 features: Free Delivery, 7-Day Returns, 2-Year Warranty, 24/7 Support, Secure Payment
   - Each feature has an icon, title, and subtitle
   - Background: slightly lighter than main background

3. CATEGORY GRID:
   - 6 categories in a grid: Smartphones 📱, Laptops 💻, Audio 🎧, Cameras 📷, Wearables ⌚, Accessories 🔌
   - Each card shows emoji icon, category name, and item count
   - Hover effect: border changes to amber, slight lift animation

4. FEATURED PRODUCTS:
   - Grid of 6 product cards
   - Each card shows: image, category label, product name, star rating, price (current + old crossed out), "Add to Cart" button
   - Product badge in top-left corner (NEW/HOT/SALE)
   - Hover: card lifts up with amber glow shadow

5. DEAL OF THE DAY:
   - Large banner with 3 columns: product info (left), product image (center), rating/delivery info (right)
   - Countdown timer showing hours:minutes:seconds
   - Large price display
   - "Add to Cart" and "View Shop" buttons

6. NEW ARRIVALS:
   - Similar product grid as Featured Products, showing 4 newest products

7. TESTIMONIALS:
   - 3 customer testimonial cards in a row
   - Each shows: 5-star rating, review text, customer avatar (circular with initials), name and location

8. NEWSLETTER:
   - Full-width amber background section
   - Centered content: headline "Get Exclusive Deals First 🎉", description, email input + subscribe button
   - Input and button inline (rounded pill shape)

TECHNICAL REQUIREMENTS:
- PHP backend fetching products from MySQL database
- Products table structure: id, name, slug, description, price, old_price, image_url, badge, rating, reviews_count, featured
- Categories table: id, name, slug, icon
- Session-based cart functionality
- AJAX "Add to Cart" without page reload
- Responsive design for mobile/tablet
- Animations: fade-in on scroll for product cards, smooth hover transitions
```

---

### 🛍️ SHOP PAGE PROMPT

```
Create a complete shop/catalog page for an e-commerce website with filtering, sorting, and pagination:

LAYOUT:
- Two-column layout: Sidebar (260px) + Main content area
- Breadcrumb navigation at top
- Results count and sort dropdown in main header

SIDEBAR FILTERS:
- Sticky sidebar that stays visible on scroll
- Category filter: Radio buttons for All, Smartphones, Laptops, Audio, Cameras, Wearables, Accessories
- Price range slider: Min ৳0 to Max ৳300,000 with live label update
- "Apply Filters" and "Clear All" buttons at bottom
- Dark surface background with subtle border

MAIN CONTENT:
- Header showing: "Showing 1-9 of 45 results in Smartphones"
- Sort dropdown: Newest, Most Popular, Top Rated, Price Low-High, Price High-Low
- Product grid (3 columns on desktop, responsive to 1 column on mobile)
- Same product card design as home page
- Empty state: Large search icon, "No products found" message, "Clear Filters" button

PAGINATION:
- Centered pagination controls at bottom
- Previous/Next arrow buttons
- Page number buttons (current page highlighted in amber)

TECHNICAL FEATURES:
- URL parameters: ?cat=smartphones&search=iphone&sort=price_asc&page=2
- SQL query with WHERE filters, ORDER BY, LIMIT/OFFSET for pagination
- Form auto-submit on filter change
- Preserve filters when sorting/paginating
- Product count per category shown in sidebar

PHP LOGIC:
- Build dynamic WHERE clause from GET parameters
- Calculate total pages: ceil(totalRecords / perPage)
- Fetch products with JOIN to categories table
- Display results or empty state based on query results
```

---

### 🛒 CART PAGE PROMPT

```
Create a shopping cart page with dynamic quantity controls and order summary:

LAYOUT:
- Two-column: Cart items table (left) + Order summary sidebar (right, 360px)
- Breadcrumb: Home › Shopping Cart
- Page title with item count

CART ITEMS TABLE:
- Table header: Product | Price | Quantity | Subtotal | [Remove]
- Each row shows:
  - Product thumbnail (72x72px, rounded corners)
  - Product name and category
  - Unit price (bold, amber color)
  - Quantity controls: [−] [input field] [+] buttons
  - Subtotal (price × quantity)
  - Remove button (× icon)
- Hover effect: slight background highlight
- "Continue Shopping" button below table

QUANTITY CONTROLS:
- Minus button, number input (centered), plus button
- Min: 1, Max: 99
- AJAX update on change (no page reload)
- Updates subtotal and order total in real-time

ORDER SUMMARY (STICKY SIDEBAR):
- Section title: "Order Summary"
- Subtotal row
- Shipping row: "Free" if order > ৳5,000, else ৳150
- Progress message: "Add ৳X more for free shipping!" (if under threshold)
- Total row (larger, bold, amber color)
- Coupon code input + Apply button
- "Proceed to Checkout" button (full width, large, primary amber)
- Payment icons at bottom: Visa, Mastercard, PayPal, Payoneer
- Security badge: 🔒 Secure Checkout Guaranteed

EMPTY CART STATE:
- Centered content: Shopping bag icon (large), "Your cart is empty" heading, description, "Start Shopping" button

AJAX FUNCTIONALITY:
- Add to cart from shop/home pages
- Update quantity
- Remove item (with fade-out animation)
- All cart operations update cart badge in header

PHP/SESSION:
- Cart stored in $_SESSION['cart'] as array [product_id => quantity]
- Functions: getCart(), addToCart(), updateCartQty(), removeFromCart(), getCartCount(), getCartTotal()
- JSON responses for AJAX: {success: true, cart_count: 5, formatted_total: "৳59,999"}
```

---

### 💳 CHECKOUT PAGE PROMPT

```
Create a multi-step checkout page with order review and payment options:

LAYOUT:
- Two-column: Checkout form (left) + Order review sidebar (right, sticky)
- Breadcrumb: Home › Cart › Checkout
- Three numbered sections in left column

SECTION 1: CONTACT INFORMATION
- Step number badge: "1" (amber circle)
- Section title: "Contact Information"
- Form fields in 2-column grid:
  - First Name * | Last Name *
  - Email Address * | Phone Number *
- Asterisk (*) indicates required

SECTION 2: SHIPPING ADDRESS
- Step number: "2"
- Title: "Shipping Address"
- Fields:
  - Street Address * (full width)
  - City * | Country (Bangladesh, readonly)
  - Order Notes (optional, textarea, 3 rows)

SECTION 3: PAYMENT METHOD
- Step number: "3"
- Title: "Payment Method"
- Radio button options (custom styled cards):
  - Cash on Delivery 💵
  - bKash (with bKash badge)
  - Nagad (with Nagad badge)
  - Credit/Debit Card 💳
- Each option is a card with border, hover changes border to amber

ORDER REVIEW SIDEBAR (STICKY):
- Step badge: "✓"
- Title: "Order Review"
- List of cart items:
  - Each item: small thumbnail (56x56), product name, quantity, subtotal
- Summary rows:
  - Subtotal
  - Shipping (Free or ৳150)
  - Total (large, bold, amber)
- "Place Order" button showing final total: "Place Order – ৳59,999"
- Security message: 🔒 Your information is secure & encrypted

FORM VALIDATION:
- Server-side validation in PHP
- Error messages displayed at top in alert box
- Required field checks
- Email format validation
- Phone number format

ORDER PROCESSING:
- Generate unique order number: "GZ-" + uniqid()
- Insert into orders table: user_id, order_number, total_amount, status ('pending'), payment_method, shipping_address
- Insert order items into order_items table
- Clear cart session
- Redirect to order success page

PRE-FILL LOGIC:
- If user is logged in, pre-fill form with user data from database
- If not logged in, allow guest checkout
```

---

### 👤 MY ACCOUNT PAGE PROMPT

```
Create a user account dashboard with sidebar navigation and multiple tabs:

LAYOUT:
- Two-column: Account sidebar (260px, sticky) + Content area
- Breadcrumb: Home › My Account

SIDEBAR:
- Top section (card with gradient background):
  - Avatar circle with user initials (2 letters, amber background)
  - User full name
  - Email address
- Navigation menu (vertical list):
  - 📊 Dashboard
  - 🛍️ My Orders
  - 👤 Profile
  - 🔒 Change Password
  - 🚪 Logout (red color)
- Active tab highlighted with amber background

TAB 1: DASHBOARD
- Welcome message: "Welcome back, [FirstName]! 👋"
- 3 stat cards in a row:
  - Total Orders (count)
  - Delivered (count)
  - Total Spent (formatted price)
- Recent Orders section:
  - Table showing latest 5 orders
  - Columns: Order #, Date, Total, Status (badge), Payment
  - Status badges color-coded: pending (amber), processing (blue), shipped (purple), delivered (green), cancelled (red)

TAB 2: MY ORDERS
- Full orders table (all orders, not just 5)
- Includes "Items" column showing count
- Full timestamp with time
- Scrollable if many orders

TAB 3: PROFILE
- Form to update profile information:
  - First Name | Last Name (2 columns)
  - Email (disabled, with note "Email cannot be changed")
  - Phone Number
  - Address (textarea)
  - City
- "Save Changes" button
- Form pre-filled with current user data
- POST to same page, updates database, shows success message

TAB 4: CHANGE PASSWORD
- Form fields:
  - Current Password *
  - New Password * (min 6 characters)
  - Confirm New Password *
- Validation:
  - Check current password matches database hash
  - Check new password length
  - Check confirmation matches
- "Update Password" button
- Success/error messages

PHP LOGIC:
- requireLogin() function redirects to login if not authenticated
- getCurrentUser() fetches user from database based on session
- Handle form submissions with POST
- Update user record in database
- Password hashing with password_hash() and verification with password_verify()
- Fetch orders with JOIN to get order items count
```

---

### 🔐 LOGIN & REGISTER PROMPTS

**LOGIN PAGE:**
```
Create a centered login form with:
- Card container (460px max width, dark surface, rounded corners, centered on page)
- Title: "Welcome Back 👋"
- Subtitle: "Log in to your GadgetZone account"
- Form fields:
  - Email Address (email input)
  - Password (password input)
- "Log In" button (full width, large, amber primary button with lock icon)
- Link at bottom: "Don't have an account? Create one →"
- Error messages displayed in red alert box if login fails
- Validation: check email exists, verify password hash
- On success: set $_SESSION['user_id'] and redirect to My Account or original page
```

**REGISTER PAGE:**
```
Create a registration form with:
- Similar card design as login
- Title: "Create Account 🚀"
- Subtitle: "Join GadgetZone and start shopping"
- Form fields:
  - First Name | Last Name (2 columns)
  - Email Address
  - Password (min 6 characters)
  - Confirm Password
- "Create Account" button
- Link: "Already have an account? Log in →"
- Validation:
  - Check all fields filled
  - Email format valid
  - Password minimum 6 characters
  - Passwords match
  - Email not already registered (query database)
- On success: insert user into database with password_hash(), auto-login, redirect to My Account
```

---

## 🎨 CSS Custom Properties

The design uses these CSS variables (defined in `:root`):

```css
--accent: #f59e0b;           /* Main amber color */
--accent-light: #fcd34d;     /* Lighter amber for hovers */
--bg: #0a0a0f;               /* Main dark background */
--surface: #16161f;          /* Card backgrounds */
--border: rgba(255,255,255,0.08); /* Subtle borders */
--text: #f0f0f5;             /* Primary text */
--text2: #9090a8;            /* Secondary text */
--font-head: 'IBM Plex Sans';         /* Headings font */
--font-body: 'DM Sans';      /* Body text font */
--radius: 12px;              /* Border radius */
```

## 🛠️ Key PHP Functions

**In `includes/functions.php`:**

```php
isLoggedIn()              // Check if user is logged in
requireLogin()            // Redirect to login if not authenticated
getCurrentUser()          // Get current user data from database
getCart()                 // Get cart array from session
addToCart($id, $qty)      // Add product to cart
updateCartQty($id, $qty)  // Update cart item quantity
removeFromCart($id)       // Remove item from cart
getCartCount()            // Total items in cart
getCartTotal()            // Total price of cart
formatPrice($price)       // Format as ৳ X,XXX
sanitize($data)           // Clean input data
generateOrderNumber()     // Create unique order ID
```

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (full layout)
- **Tablet**: 768px - 1024px (sidebars stack, 2-column grids)
- **Mobile**: < 768px (single column, hamburger menu, simplified tables)

## 🔒 Security Features

- Password hashing with `password_hash()` and `PASSWORD_DEFAULT`
- SQL injection prevention with `real_escape_string()` and prepared statements
- XSS prevention with `htmlspecialchars()` on all user input
- Session-based authentication
- CSRF protection (can be enhanced with tokens)

## 🚧 Future Enhancements

- Product search autocomplete
- Product detail pages
- Wishlist functionality
- Admin panel for managing products/orders
- Email notifications for orders
- Payment gateway integration (Stripe, bKash API)
- Product reviews and ratings system
- Advanced filters (brand, price range slider)
- Image gallery for products
- Related products section
- Order tracking with status updates

## 📞 Support

For questions or issues, contact: support@gadgetzone.com

## 📄 License

This is a sample e-commerce project for educational purposes.

---

**Copy Right 2026 All rights reserved by Kitpapa.com**
