<?php
session_start(); // Start session
// Connection to the server
$conn = mysqli_connect("localhost", "root", "", "e_commerce");

// Create the reviews table if it doesn't exist
$sql_create_reviews_table = "CREATE TABLE IF NOT EXISTS reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    prod_id INT NOT NULL,
    id INT NOT NULL,
    review_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prod_id) REFERENCES products(prod_id) ON DELETE CASCADE,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB";

$conn->query($sql_create_reviews_table);

// Fetch product ID from GET parameters, defaulting to 1 if not provided
$product_id = isset($_GET['prod_id']) ? $_GET['prod_id'] : 1;

// Handle review submission
if (isset($_POST['submit_review'])) {
    $user_id = $_SESSION['user_id']; // Assuming you store user_id in session
    $review_text = mysqli_real_escape_string($conn, $_POST['review_text']); // Escape user input for security

    // Insert review into the database
    $sql_insert_review = "INSERT INTO reviews (prod_id, id, review_text) VALUES ($product_id, $user_id, '$review_text')";
    
    if ($conn->query($sql_insert_review) === TRUE) {
        // Review added successfully
        header("Location: product_detail.php?prod_id=$product_id"); // Redirect to the same page
        exit;
    } else {
        echo "Error: " . $sql_insert_review . "<br>" . $conn->error; // Error handling
    }
}

// Fetch product details
$sql_product = "SELECT * FROM products WHERE prod_id = $product_id";
$result_product = $conn->query($sql_product);

if ($result_product->num_rows > 0) {
    $product = $result_product->fetch_assoc();
} else {
    echo "Product not found.";
    exit;
}

// Check product quantity
$current_quantity = $product['prod_total_quantity'];

// Fetch product prices
$sql_sizes = "SELECT * FROM productsizes WHERE prod_id = $product_id";
$result_sizes = $conn->query($sql_sizes);
$sizes = [];
while ($row = $result_sizes->fetch_assoc()) {
    $sizes[] = $row;
}

// Use the first product image as default
$default_image = $product['prod_img'];

// Fetch product reviews
$sql_reviews = "SELECT r.review_id, r.review_text, r.created_at, u.username, r.id 
FROM reviews r 
INNER JOIN users u ON r.id = u.id 
WHERE r.prod_id = $product_id 
ORDER BY r.created_at DESC";

$result_reviews = $conn->query($sql_reviews);
$reviews = [];
while ($row = $result_reviews->fetch_assoc()) {
    $reviews[] = $row;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../assets/css/styles.css">
    <link rel="stylesheet" href="../../assets/css/navbar.css">
    <link rel="stylesheet" href="../../assets/css/product_detail.css">    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"/>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
    <script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <title>Product-Detail</title>
    <style>
         #prod_price {
            font-size: 20px;
            color: #333;
        }
        .out-of-stock {
            color: red;
            font-weight: bold;
        }
        .review {
            border-bottom: 1px solid #ddd;
            padding: 15px 0; /* Increased padding for better spacing */
            margin-bottom: 15px; /* Added margin for spacing between reviews */
        }
        .review .username {
            font-weight: bold;
        }
        .review .created-at {
            font-size: 12px;
            color: #666;
        }
        .review-text {
            margin-top: 5px; /* Added margin to separate text */
        }
        .review-form {
            margin-top: 30px; /* Spacing above the review form */
            padding: 15px; /* Added padding */
            border: 1px solid #ddd; /* Border for the review form */
            border-radius: 5px; /* Rounded corners */
        }
    </style>
</head>
<body>
<?php include '../../includes/navbar.php'; ?>

<div class="product-detail">
    <img src="<?php echo $default_image; ?>" alt="Product Image">
    <div class="product-name"><?php echo $product['prod_name']; ?></div>
    <div class="prices">
        <label>Price: </label>
        <span id="prod_price">Rs <?php echo $sizes[0]['prod_price']; ?></span>
    </div>
    <div class="quantity">
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" name="quantity" min="1" max="<?php echo $current_quantity; ?>" value="1" onchange="updatePrice()">
    </div>

    <?php if ($current_quantity > 0): ?>
        <form method="post" action="cart.php">
            <input type="hidden" name="prod_id" value="<?php echo $product['prod_id']; ?>">
            <input type="hidden" name="prod_type" value="<?php echo $product['prod_type']; ?>">
            <input type="hidden" name="prod_name" value="<?php echo $product['prod_name']; ?>">
            <input type="hidden" name="prod_price" value="<?php echo $sizes[0]['prod_price']; ?>">
            <input type="hidden" name="prod_img" value="<?php echo $default_image; ?>">
            <input type="hidden" name="quantity" value="1" id="hidden_quantity">
            <input type="hidden" name="total_price" value="" id="hidden_total_price">
            <button type="submit" name="add_to_cart" class="add-to-cart bg-dark" onclick="selectionValidate(event)">Add to Cart</button>
        </form>
    <?php else: ?>
        <div class="out-of-stock">This product is out of stock.</div>
        <button class="add-to-cart" disabled>Add to Cart</button>
    <?php endif; ?>
</div>
<!-- // Display Reviews -->
<div class="reviews container mt-4">
    <h3>Reviews:</h3>
    <?php if (!empty($reviews)): ?>
        <?php foreach ($reviews as $review): ?>
            <div class="review">
                <div class="d-flex justify-content-between">
                    <div>
                        <span class="username"><?php echo htmlspecialchars($review['username']); ?></span>
                        <span class="created-at"><?php echo date('Y-m-d H:i:s', strtotime($review['created_at'])); ?></span>
                    </div>
                    <?php if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $review['id']): ?>
                        <!-- Delete button with icon -->
                        <form method="post" action="delete_review.php" style="display:inline;">
                            <input type="hidden" name="review_id" value="<?php echo $review['review_id']; ?>">
                            <button type="submit" name="delete_review" class="btn btn-danger btn-sm">
                                <i class="fa fa-trash"></i> <!-- Trash icon -->
                            </button>
                        </form>
                    <?php endif; ?>
                </div>
                <div class="review-text"><?php echo htmlspecialchars($review['review_text']); ?></div>
            </div>
        <?php endforeach; ?>
    <?php else: ?>
        <p>No reviews yet. Be the first to write a review!</p>
    <?php endif; ?>
</div>

<!-- Review Submission Form -->
<div class="review-form container mt-4">
    <h3>Write a Review:</h3>
    <form method="post" action="product_detail.php?prod_id=<?php echo $product_id; ?>">
        <div class="mb-3">
            <textarea name="review_text" class="form-control" rows="4" required placeholder="Write your review here..."></textarea>
        </div>
        <button type="submit" name="submit_review" class="btn btn-primary">Submit Review</button>
    </form>
</div>

</body>
</html>

<?php
$conn->close(); // Close connection
?>
