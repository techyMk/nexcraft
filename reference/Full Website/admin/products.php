<?php
$pageTitle = 'Products – Admin';
require_once __DIR__ . '/layout.php';

$success = ''; $errors = [];

// Delete
if (isset($_GET['delete'])) {
    $id    = (int)$_GET['delete'];
    $inUse = $conn->query("SELECT COUNT(*) FROM order_items WHERE product_id=$id")->fetch_row()[0];
    if ($inUse > 0) { $errors[] = 'Cannot delete — product has existing orders. Set stock to 0 to hide it.'; }
    else { $conn->query("DELETE FROM products WHERE id=$id"); $success = 'Product deleted.'; }
}

// Add / Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['save_product'])) {
    $id       = (int)($_POST['product_id'] ?? 0);
    $name     = $conn->real_escape_string(strip_tags(trim($_POST['name']     ?? '')));
    $cat      = (int)($_POST['category_id'] ?? 0);
    $price    = (float)($_POST['price']    ?? 0);
    $oldPrice = $_POST['old_price'] !== '' ? (float)$_POST['old_price'] : 'NULL';
    $stock    = (int)($_POST['stock']      ?? 0);
    $badge    = $conn->real_escape_string($_POST['badge'] ?? '');
    $featured = isset($_POST['featured']) ? 1 : 0;
    $desc     = $conn->real_escape_string(strip_tags(trim($_POST['description'] ?? '')));
    $slug     = strtolower(preg_replace('/[^a-z0-9]+/i', '-', trim($name)));

    // Image: uploaded file takes priority, else URL input
    $imageUrl = $conn->real_escape_string(trim($_POST['image_url'] ?? ''));
    if (!empty($_FILES['image']['name'])) {
        $ext  = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','webp','gif'];
        if (in_array($ext, $allowed)) {
            $fname = 'prod_' . uniqid() . '.' . $ext;
            $dest  = __DIR__ . '/uploads/' . $fname;
            if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
                $imageUrl = '/gadget/admin/uploads/' . $fname;
            }
        }
    }

    if (!$name) $errors[] = 'Product name is required.';
    if (!$cat)  $errors[] = 'Category is required.';
    if (!$price) $errors[] = 'Price is required.';
    if (empty($errors)) {
        $opVal = $oldPrice === 'NULL' ? 'NULL' : (float)$oldPrice;
        if ($id > 0) {
            $conn->query("UPDATE products SET name='$name',slug='$slug',category_id=$cat,price=$price,old_price=$opVal,stock=$stock,badge='$badge',featured=$featured,description='$desc',image_url='$imageUrl' WHERE id=$id");
            $success = 'Product updated.';
        } else {
            $conn->query("INSERT INTO products (name,slug,category_id,price,old_price,stock,badge,featured,description,image_url) VALUES ('$name','$slug',$cat,$price,$opVal,$stock,'$badge',$featured,'$desc','$imageUrl')");
            $success = 'Product added.';
        }
    }
}

// Fetch for edit
$editProduct = null;
if (isset($_GET['edit'])) {
    $editProduct = $conn->query("SELECT * FROM products WHERE id=".(int)$_GET['edit']." LIMIT 1")->fetch_assoc();
}

// Filters
$search = $conn->real_escape_string($_GET['search'] ?? '');
$catF   = (int)($_GET['cat'] ?? 0);
$where  = $search ? "WHERE p.name LIKE '%$search%'" : "WHERE 1";
if ($catF) $where .= " AND p.category_id=$catF";

$products   = $conn->query("SELECT p.*,c.name AS cat_name FROM products p LEFT JOIN categories c ON p.category_id=c.id $where ORDER BY p.id DESC");
$categories = $conn->query("SELECT * FROM categories ORDER BY name");
$catsArr = [];
while ($c = $categories->fetch_assoc()) $catsArr[] = $c;
?>

<div class="page-actions">
    <h1><i class="fa-solid fa-box-open" style="color:var(--accent)"></i> Products</h1>
    <button class="btn btn-primary" onclick="openModal('productModal')"><i class="fa-solid fa-plus"></i> Add Product</button>
</div>

<?php if ($success): ?><div class="alert alert-success"><i class="fa-solid fa-check-circle"></i> <?= $success ?></div><?php endif; ?>
<?php if (!empty($errors)): ?><div class="alert alert-danger"><?= implode('<br>',$errors) ?></div><?php endif; ?>

<!-- Filters -->
<form method="GET" class="search-filter-bar">
    <input type="text" name="search" class="form-control" placeholder="Search products…" value="<?= htmlspecialchars($_GET['search'] ?? '') ?>">
    <select name="cat" class="form-control" style="max-width:180px" onchange="this.form.submit()">
        <option value="">All Categories</option>
        <?php foreach ($catsArr as $c): ?>
        <option value="<?= $c['id'] ?>" <?= $catF==$c['id']?'selected':'' ?>><?= htmlspecialchars($c['name']) ?></option>
        <?php endforeach; ?>
    </select>
    <button type="submit" class="btn btn-ghost">Filter</button>
    <a href="/gadget/admin/products.php" class="btn btn-ghost">Clear</a>
</form>

<div class="admin-card">
    <div class="admin-table-wrap">
    <table class="admin-table">
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Badge</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>
        <?php if ($products->num_rows === 0): ?>
        <tr><td colspan="8" style="text-align:center;color:var(--a-text3);padding:40px">No products found.</td></tr>
        <?php else: while ($p = $products->fetch_assoc()): ?>
        <tr>
            <td><img src="<?= htmlspecialchars($p['image_url']) ?>" class="product-thumb" alt=""></td>
            <td style="max-width:220px"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><?= htmlspecialchars($p['name']) ?></div></td>
            <td style="color:var(--a-text2)"><?= htmlspecialchars($p['cat_name']) ?></td>
            <td><strong style="color:var(--accent)"><?= formatPrice($p['price']) ?></strong><?php if ($p['old_price']): ?><br><span style="font-size:11px;color:var(--a-text3);text-decoration:line-through"><?= formatPrice($p['old_price']) ?></span><?php endif; ?></td>
            <td><span style="color:<?= $p['stock']<=5?'var(--danger)':($p['stock']<=20?'var(--warning)':'inherit') ?>"><?= $p['stock'] ?></span></td>
            <td><?php if ($p['badge']): ?><span class="badge badge-<?= strtolower($p['badge']) ?>"><?= $p['badge'] ?></span><?php else: ?><span style="color:var(--a-text3)">—</span><?php endif; ?></td>
            <td><?= $p['featured'] ? '<i class="fa-solid fa-star" style="color:var(--accent)"></i>' : '—' ?></td>
            <td>
                <a href="?edit=<?= $p['id'] ?>" class="btn btn-ghost btn-xs" onclick="openModal('productModal')"><i class="fa-solid fa-pen"></i></a>
                <a href="?delete=<?= $p['id'] ?>" class="btn btn-xs" style="background:rgba(239,68,68,0.12);color:var(--danger);border:none" onclick="return confirm('Delete this product?')"><i class="fa-solid fa-trash"></i></a>
            </td>
        </tr>
        <?php endwhile; endif; ?>
        </tbody>
    </table>
    </div>
</div>

<!-- Product Modal -->
<div class="modal-overlay" id="productModal">
<div class="modal">
    <div class="modal-header">
        <div class="modal-title"><?= $editProduct ? 'Edit Product' : 'Add New Product' ?></div>
        <button class="modal-close" onclick="closeModal('productModal')"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form method="POST" enctype="multipart/form-data">
    <div class="modal-body">
        <input type="hidden" name="product_id" value="<?= $editProduct['id'] ?? 0 ?>">
        <div class="form-row">
            <div class="form-group"><label class="form-label">Product Name *</label>
                <input type="text" name="name" class="form-control" required value="<?= htmlspecialchars($editProduct['name'] ?? '') ?>"></div>
            <div class="form-group"><label class="form-label">Category *</label>
                <select name="category_id" class="form-control" required>
                    <option value="">Select…</option>
                    <?php foreach ($catsArr as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= ($editProduct['category_id']??'')==$c['id']?'selected':'' ?>><?= htmlspecialchars($c['name']) ?></option>
                    <?php endforeach; ?>
                </select></div>
        </div>
        <div class="form-row-3">
            <div class="form-group"><label class="form-label">Price (BDT ৳) *</label>
                <input type="number" name="price" step="0.01" class="form-control" required value="<?= $editProduct['price'] ?? '' ?>"><div class="form-hint">Always enter in BDT — converted automatically for display</div></div>
            <div class="form-group"><label class="form-label">Old Price (BDT ৳)</label>
                <input type="number" name="old_price" step="0.01" class="form-control" value="<?= $editProduct['old_price'] ?? '' ?>" placeholder="Leave blank if none"></div>
            <div class="form-group"><label class="form-label">Stock *</label>
                <input type="number" name="stock" class="form-control" required value="<?= $editProduct['stock'] ?? 100 ?>"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label class="form-label">Badge</label>
                <select name="badge" class="form-control">
                    <option value="" <?= ($editProduct['badge']??'')==''?'selected':'' ?>>None</option>
                    <option value="NEW" <?= ($editProduct['badge']??'')==='NEW'?'selected':'' ?>>NEW</option>
                    <option value="HOT" <?= ($editProduct['badge']??'')==='HOT'?'selected':'' ?>>HOT</option>
                    <option value="SALE" <?= ($editProduct['badge']??'')==='SALE'?'selected':'' ?>>SALE</option>
                </select></div>
            <div class="form-group"><label class="form-label">Options</label>
                <label style="display:flex;align-items:center;gap:8px;margin-top:10px;cursor:pointer">
                    <input type="checkbox" name="featured" value="1" <?= ($editProduct['featured']??0)?'checked':'' ?> style="accent-color:var(--accent)"> Featured product
                </label></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label>
            <textarea name="description" class="form-control" rows="3"><?= htmlspecialchars($editProduct['description'] ?? '') ?></textarea></div>
        <div class="form-group"><label class="form-label">Image URL (Unsplash link)</label>
            <input type="text" name="image_url" class="form-control" id="imgUrlInput" value="<?= htmlspecialchars($editProduct['image_url'] ?? '') ?>" placeholder="https://images.unsplash.com/…" oninput="previewImg(this.value)">
            <img id="imgPreview" class="img-preview <?= !empty($editProduct['image_url'])?'show':'' ?>" src="<?= htmlspecialchars($editProduct['image_url'] ?? '') ?>" alt="Preview"></div>
        <div class="form-group"><label class="form-label">— OR Upload Image File —</label>
            <input type="file" name="image" class="form-control" accept="image/*" onchange="previewFile(this)">
            <div class="form-hint">JPG, PNG, WebP accepted. Upload overrides URL above.</div></div>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-ghost" onclick="closeModal('productModal')">Cancel</button>
        <button type="submit" name="save_product" class="btn btn-primary"><i class="fa-solid fa-check"></i> Save Product</button>
    </div>
    </form>
</div>
</div>

<?php if ($editProduct): ?>
<script>document.addEventListener('DOMContentLoaded',()=>openModal('productModal'));</script>
<?php endif; ?>
<?php require_once __DIR__ . '/footer.php'; ?>
