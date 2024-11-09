<?php
session_start();
$conn = mysqli_connect("localhost", "root", "", "e_commerce");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

if (isset($_POST['review_text'], $_POST['rating'], $_SESSION['user_id'], $_POST['prod_id'])) {
    $review_text = mysqli_real_escape_string($conn, $_POST['review_text']);
    $rating = (int)$_POST['rating'];
    $user_id = (int)$_SESSION['user_id'];
    $prod_id = (int)$_POST['prod_id'];

    $sql = "INSERT INTO reviews (user_id, prod_id, review_text, rating) VALUES ($user_id, $prod_id, '$review_text', $rating)";
    
    if (mysqli_query($conn, $sql)) {
        header("Location: product_details.php?prod_id=$prod_id");
    } else {
        echo "Error: " . mysqli_error($conn);
    }
}

mysqli_close($conn);
?>
