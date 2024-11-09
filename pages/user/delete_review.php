<?php
session_start();
$conn = mysqli_connect("localhost", "root", "", "e_commerce");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

if (isset($_POST['review_id'], $_SESSION['user_id'])) {
    $review_id = (int)$_POST['review_id'];
    $user_id = (int)$_SESSION['user_id'];

    // Ensure the user can only delete their own review
    $sql = "DELETE FROM reviews WHERE review_id = $review_id AND id = $user_id"; // Ensure 'id' matches the foreign key

    if (mysqli_query($conn, $sql)) {
        header("Location: " . $_SERVER['HTTP_REFERER']); // Redirect back to the previous page
        exit; // Make sure to exit after redirection
    } else {
        echo "Error: " . mysqli_error($conn);
    }
}

mysqli_close($conn);
?>
