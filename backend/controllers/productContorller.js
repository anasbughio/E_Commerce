const fs = require("fs");
const path = require("path");
const Product = require("../models/product.js");
const cloudinary = require("../config/cloudinary.js");

// ✅ Create Product
const createProduct = async (req, res) => {
  try {
    console.log("🟢 createProduct body:", req.body);
console.log("🟢 createProduct file:", req.file);

    const { name, description, price, category, stock } = req.body;
    let imageUrl = "";

    // Upload to Cloudinary if image provided
    if (req.file) {
      const uploadPath = path.join(__dirname, "..", req.file.path);
      const uploadResult = await cloudinary.uploader.upload(uploadPath, {
        folder: "ecommerce_products",
      });
      imageUrl = uploadResult.secure_url;

      // Remove temp file
      fs.unlinkSync(uploadPath);
    }

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });

    res.status(201).json({ message: "✅ Product created successfully", product });
  } catch (error) {
    console.error("Product creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Delete product
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "🗑️ Product deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: "Internal server on error" });
  }
};

// ✅ Get single product
const productDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update Product (with optional new image)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;
    let updateData = { name, description, price, category, stock };

    // Upload new image if provided
    if (req.file) {
      const uploadPath = path.join(__dirname, "..", req.file.path);
      const uploadResult = await cloudinary.uploader.upload(uploadPath, {
        folder: "ecommerce_products",
      });
      updateData.imageUrl = uploadResult.secure_url;
      fs.unlinkSync(uploadPath);
    }

    // Clean undefined fields
    Object.keys(updateData).forEach(
      (key) =>
        (updateData[key] === undefined || updateData[key] === "") &&
        delete updateData[key]
    );

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "✅ Product updated successfully", product: updated });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const review = {
       name: req.user.name, // now contains username
      rating: Number(rating),
      comment,
      user: req.user.id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ message: "Server error while adding review" });
  }
};


const getAllReviews = async (req, res) => {
  try {
    const products = await Product.find({}, 'name reviews');
    const allReviews = products.flatMap(product =>
      product.reviews.map(review => ({
        ...review._doc,
        productId: product._id,
        productName: product.name,
      }))
    );
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

// Delete a specific review
const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== reviewId
    );

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      (product.numReviews || 1);

    await product.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  deleteProduct,
  productDetails,
  updateProduct,
  addReview,
  getAllReviews,
  deleteReview,
};
