# Amazon Clone - MERN Stack E-Commerce

A full-stack, production-ready E-Commerce application built with the MERN stack (MongoDB, Express, React, Node.js). It features a robust authentication system, a complete shopping cart/checkout flow integrated with Stripe, and a dedicated comprehensive Admin panel for managing products and orders.

## 🚀 Live Demo
- **Frontend / Customer Portal**: [Add your live frontend URL here]
- **Admin Login**: [Add your live frontend URL here]/admin
  - *Demo Admin Credentials:* `admin@gmail.com` / `admin123`

## 🛠️ Tech Stack
### Frontend
- **React.js** - UI Library
- **React Router** - Navigation
- **Context API** - Global state management (Cart, Auth)
- **Axios** - API requests
- **Stripe.js** - Secure payment processing

### Backend
- **Node.js & Express.js** - Server framework
- **MongoDB & Mongoose** - NoSQL Database & ODM
- **Argon2** - Secure password hashing
- **JWT (JSON Web Tokens)** - Authentication (Access & Refresh tokens)
- **Stripe** - Webhook-free synchronous payment verification

### Deployment
- **Vercel** - Fully configured for Vercel Serverless Functions (`@vercel/node`) and Static UI deployments.

## ✨ Key Features

### User Features
- **Authentication**: Secure Login/Registration with CSRF protection, access tokens, and refresh tokens.
- **Product Catalog**: Browse products with detailed views, stock availability, and reviews.
- **Shopping Cart**: Fully functional cart that persists locally and calculates totals dynamically.
- **Stripe Checkout**: Secure, production-grade checkout system with direct session verification (Webhooks bypassed for Vercel stability).
- **Order Tracking**: Users can view their order history and current status.

### Admin Features
- **Dashboard**: High-level overview of the store's performance.
- **Product Management**: Create, update, and delete products (CRUD).
- **Active Orders**: View newly placed orders and update their fulfillment status (Pending, Processing, Shipped, Delivered).
- **Order History**: Keep track of completed or older orders.
- **Reviews Management**: Moderate customer product reviews.

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anasbughio/E_Commerce.git
   cd E_Commerce
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Create a .env file and add your REACT_APP variables
   npm start
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file and add your MongoDB URI, JWT Secrets, and Stripe Keys
   npm run dev
   ```

## 🔒 Environment Variables

You will need to create two `.env` files.

**1. `/backend/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
REFRESH_TOKEN_EXP=7d
```

**2. `/frontend/.env`**
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🌐 Deployment to Vercel
This project includes a `vercel.json` file designed to instantly deploy both the frontend and backend on Vercel.

1. Import the repository into your Vercel dashboard.
2. Vercel will automatically read the `vercel.json` build configurations.
3. Crucial: Open the **Settings > Environment Variables** tab in your Vercel project and add all the Backend and Frontend `.env` variables from above. Ensure `CLIENT_URL` is updated to your deployed Vercel frontend URL.
4. Redeploy the application.

## 🛒 Stripe Payment Flow Architecture
This application utilizes an advanced synchronous Stripe checkout verification system, custom-tailored for Edge/Serverless deployments:
1. User clicks Checkout -> Backend creates a Stripe Checkout Session with a unique ID and redirects the User.
2. User completes payment on Stripe's secure portal.
3. Stripe redirects back to the Frontend Success page, appending `?session_id=...` to the URL.
4. The React application immediately intercepts this ID and requests the backend to verify the session with Stripe natively.
5. If Stripe confirms payment is `paid`, the Backend safely creates the order and deducts inventory stock. This bypasses Vercel JSON parser interference commonly seen with traditional Webhooks.

---
*Developed by Anas Bughio.*
