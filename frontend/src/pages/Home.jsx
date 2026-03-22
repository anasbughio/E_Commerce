import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../api/axios";
import UserNavbar from "../components/UserNavbar";
import "../styles/Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        const data = Array.isArray(res.data.products)
          ? res.data.products
          : Array.isArray(res.data)
          ? res.data
          : [];
        setProducts(data.filter((p) => p.stock > 0));
        setFilteredProducts(data.filter((p) => p.stock > 0));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  // Filtering + Sorting
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

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        ⏳ Loading products...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar />

      <div className="px-6 py-4 space-y-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          🛍️ Available Products
        </h1>

        {/* Filters + Search + Sort */}
        <div className="filter-bar flex flex-wrap justify-center gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home</option>
            <option value="other">Other</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priceLow">Price: Low → High</option>
            <option value="priceHigh">Price: High → Low</option>
          </select>
        </div>

        {/* Product Grid */}
      {/* Product Rows (Amazon-style) */}
{/* Product Grid (4–5 products per row) */}
{filteredProducts.length === 0 ? (
  <div className="text-center text-gray-600 py-10">
    😔 No products found.
  </div>
) : (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="text-xl font-semibold mb-4">Featured Products</h2>

    {/* Grid Layout */}
 <div className="product-grid">

      {currentProducts.map((product) => (
        <div
          key={product._id}
          className="product-card text-center flex flex-col justify-between"
        >
          <Link
            to={`/products/${product._id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img
              src={
                product.image?.url ||
                product.imageUrl ||
                "https://via.placeholder.com/200"
              }
              alt={product.name}
              className="h-48 w-full object-contain"
            />
            <div className="p-2">
              <h3 className="font-semibold text-base truncate">
                {product.name}
              </h3>
              <p className="text-gray-700 font-medium">${product.price}</p>
            </div>
          </Link>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`w-full py-2 font-medium mt-auto ${
              product.stock === 0
                ? "out-stock-btn cursor-not-allowed"
                : "add-cart-btn"
            }`}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      ))}
    </div>
  </div>
)}



        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
        <button
  disabled={currentPage === 1}
  onClick={() => setCurrentPage((p) => p - 1)}
  className="pagination-btn px-4 py-2 disabled:opacity-50"
>
  Prev
</button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
           <button
  disabled={currentPage === totalPages}
  onClick={() => setCurrentPage((p) => p + 1)}
  className="pagination-btn px-4 py-2 disabled:opacity-50"
>
  Next
</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
