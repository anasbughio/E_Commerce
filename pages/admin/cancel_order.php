<?php
session_start();
$host = 'localhost'; // Database host
$dbname = 'e_commerce'; // Database name
$username = 'root'; // Database username
$password = ''; // Database password

// Create a database connection
$conn = mysqli_connect($host, $username, $password, $dbname);

// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// Check if the order ID is provided
if (isset($_POST['order_id'])) {
    $order_id = $_POST['order_id'];

    // Update the order status to 'canceled'
    $query = "UPDATE orders SET order_status = 'canceled' WHERE id = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "i", $order_id);

    if (mysqli_stmt_execute($stmt)) {
        echo "Order has been canceled.";
        header('Location: admin_panel.php'); // Redirect to the admin panel
        exit;
    } else {
        echo "Error canceling order: " . mysqli_error($conn);
    }

    mysqli_stmt_close($stmt);
}

mysqli_close($conn);
?>
