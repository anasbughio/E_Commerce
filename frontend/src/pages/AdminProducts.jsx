// src/pages/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import AdminNavbar from "../components/AdminNavbar";
import "../styles/AdminProducts.css"; // ✅ new CSS import

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "other",
    stock: "",
    image: null,
  });

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const data = res.data.products || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setFormData({ ...formData, image: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products/create", data);
        toast.success("Product created successfully!");
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "other",
        stock: "",
        image: null,
      });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted!");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product!");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: null,
    });
  };

  useEffect(() => {
    let result = [...products];

    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category === categoryFilter);
    }

    switch (sortOption) {
      case "priceLow":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceHigh":
        result.sort((a, b) => b.price - a.price);
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [search, categoryFilter, sortOption, products]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (loading) {
    return <div className="loading">⏳ Loading products...</div>;
  }

  return (
    <>
       <AdminNavbar />
    <div className="admin-container">
   
      <h1 className="admin-title">🛒 Admin Product Management</h1>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
        <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
        <div className="form-grid">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
          <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" required />
          <input name="stock" type="number" value={formData.stock} onChange={handleChange} placeholder="Stock Quantity" required />
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home</option>
            <option value="other">Other</option>
          </select>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
          <button type="submit" className="btn-primary">
            {editingProduct ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>

      {/* Search + Filters */}
      <div className="filter-bar">
        <input type="text" placeholder="🔍 Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          <option value="books">Books</option>
          <option value="home">Home</option>
          <option value="other">Other</option>
        </select>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priceLow">Price: Low → High</option>
          <option value="priceHigh">Price: High → Low</option>
        </select>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">😔 No products found.</div>
      ) : (
        <div className="product-grid">
          {currentProducts.map((product) => (
            <div key={product._id} className="product-card">
              <img
                src={product.image?.url || product.imageUrl || "https://via.placeholder.com/150"}
                alt={product.name}
              />
              <h3>{product.name}</h3>
              <p className="price">${product.price}</p>
              <p className="category">{product.category}</p>
              <p className="stock">Stock: {product.stock}</p>
              <div className="actions">
                <button onClick={() => handleEdit(product)} className="btn-edit">Edit</button>
                <button onClick={() => handleDelete(product._id)} className="btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminProducts;
