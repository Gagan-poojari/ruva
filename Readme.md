**🛍️ Saree & Traditional Wear**

**E-Commerce Platform**

Complete Developer Roadmap & README

Next.js • Node.js • MongoDB • Express • WhatsApp Notify

**1. Project Overview**

A full-stack e-commerce web application for a traditional saree and wedding wear showroom. Built on the MERN stack with Next.js as the frontend framework, the platform enables customers to browse stock, place orders online, and receive delivery updates via WhatsApp --- making it ideal for a small-town or village-based business context.

**Tech Stack at a Glance**

|                  |             |                |             |                  |
|------------------|-------------|----------------|-------------|------------------|
| **Next.js (JS)** | **Node.js** | **Express.js** | **MongoDB** | **WhatsApp API** |

|                       |                     |              |                   |
|-----------------------|---------------------|--------------|-------------------|
| **Razorpay / Stripe** | **Cloudinary / S3** | **JWT Auth** | **Vercel Deploy** |

**2. Core Features**

**2.1 Customer-Facing Store**

- Homepage with hero banner, featured collections, new arrivals

- Product catalog with filters: category, color, fabric, price range, occasion

- Individual product page: image gallery, description, size chart, stock status

- Wishlist / Save for later

- Shopping cart with quantity management

- Guest checkout + registered user checkout

- Order history and tracking page

**2.2 Admin / Owner Dashboard**

- Secure admin login (JWT-protected)

- Add / Edit / Delete products with multi-image upload

- Manage inventory and stock counts

- View and manage all orders (pending, packed, shipped, delivered)

- Update order status (triggers WhatsApp notification to customer)

- Sales reports: daily, weekly, monthly

- Coupon / discount code management

**2.3 Payments**

- Razorpay (recommended for India --- UPI, cards, net banking, wallets)

- Order confirmation email + WhatsApp message on successful payment

- Refund handling via Razorpay dashboard

**2.4 WhatsApp Delivery Updates**

- Twilio WhatsApp API or WhatsApp Business Cloud API (Meta)

- Automated messages at: Order Confirmed, Packed, Shipped, Out for Delivery, Delivered

- Fallback SMS via Twilio if WhatsApp is unavailable

**3. Project Folder Structure**

saree-ecommerce/

├── frontend/ \# Next.js app

│ ├── app/ \# App Router pages

│ │ ├── page.jsx \# Homepage

│ │ ├── shop/ \# Product listing

│ │ ├── product/\[id\]/ \# Product detail

│ │ ├── cart/ \# Cart page

│ │ ├── checkout/ \# Checkout flow

│ │ ├── orders/ \# Order tracking

│ │ └── admin/ \# Admin dashboard

│ ├── components/ \# Reusable UI components

│ ├── context/ \# Cart, Auth context

│ ├── lib/ \# API call helpers

│ └── public/ \# Static assets

│

├── backend/ \# Node.js + Express

│ ├── config/ \# DB, env, Cloudinary config

│ ├── controllers/ \# Route logic

│ ├── middleware/ \# Auth, error handling

│ ├── models/ \# Mongoose schemas

│ ├── routes/ \# API routes

│ ├── services/ \# WhatsApp, Payment services

│ └── server.js \# Express entry point

│

└── README.md

**4. Database Models (MongoDB / Mongoose)**

**4.1 User**

- \_id, name, email, passwordHash, phone (WhatsApp number), role (customer \| admin)

- addresses: \[ { label, street, city, state, pincode } \]

- createdAt, updatedAt

**4.2 Product**

- \_id, name, slug, description, category, fabric, occasion

- price, discountPrice, stock (Number)

- images: \[ { url, publicId } \] --- stored in Cloudinary

- sizes: \[ { label, stock } \]

- tags, isFeatured (Boolean), createdAt

**4.3 Order**

- \_id, user (ref), items: \[ { product, qty, price, size } \]

- shippingAddress, paymentMethod, paymentStatus

- razorpayOrderId, razorpayPaymentId

- status: pending \| confirmed \| packed \| shipped \| delivered \| cancelled

- whatsappSent (Boolean), totalAmount, createdAt

**4.4 Coupon**

- code, discountType (flat \| percent), discountValue, minOrderValue, expiry, isActive

**5. Backend API Routes**

**Auth --- /api/auth**

|            |                       |                              |
|------------|-----------------------|------------------------------|
| **Method** | **Endpoint**          | **Description**              |
| **POST**   | /api/auth/register    | Register new customer        |
| **POST**   | /api/auth/login       | Login, returns JWT           |
| **POST**   | /api/auth/admin/login | Admin login                  |
| **GET**    | /api/auth/me          | Get current user (protected) |

**Products --- /api/products**

|            |                   |                                         |
|------------|-------------------|-----------------------------------------|
| **Method** | **Endpoint**      | **Description**                         |
| **GET**    | /api/products     | List all products (filters, pagination) |
| **GET**    | /api/products/:id | Single product detail                   |
| **POST**   | /api/products     | Create product (admin)                  |
| **PUT**    | /api/products/:id | Update product (admin)                  |
| **DELETE** | /api/products/:id | Delete product (admin)                  |

**Orders --- /api/orders**

|            |                        |                                  |
|------------|------------------------|----------------------------------|
| **Method** | **Endpoint**           | **Description**                  |
| **POST**   | /api/orders            | Create order + Razorpay order    |
| **POST**   | /api/orders/verify     | Verify Razorpay payment          |
| **GET**    | /api/orders/my         | Customer\'s own orders           |
| **GET**    | /api/orders            | All orders (admin)               |
| **PUT**    | /api/orders/:id/status | Update status + WhatsApp trigger |

