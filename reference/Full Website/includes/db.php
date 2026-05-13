<?php
// ── Database connection ─────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'gadgetzone');

if (session_status() === PHP_SESSION_NONE) session_start();

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die('<p style="color:red;font-family:sans-serif;padding:20px">Database connection failed: ' . $conn->connect_error . '<br>Please import database_setup.sql and check your XAMPP MySQL is running.</p>');
}
$conn->set_charset('utf8mb4');
