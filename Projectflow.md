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

**6. Development Roadmap (Phase-by-Phase)**

|                                      |                                                   |
|--------------------------------------|---------------------------------------------------|
| **Phase 1: Setup & Foundation**      | **Week 1**                                        |
| Initialize Next.js frontend repo     | npx create-next-app@latest frontend               |
| Initialize Node.js + Express backend | npm init, install express, mongoose, dotenv, cors |
| Connect MongoDB Atlas                | Configure MONGODB_URI in .env                     |
| Setup Cloudinary account             | For product image uploads                         |
| Create Git repo + branch strategy    | main, dev, feature/\* branches                    |
| Setup .env files                     | backend/.env and frontend/.env.local              |

|                                  |                                   |
|----------------------------------|-----------------------------------|
| **Phase 2: Auth & User System**  | **Week 2**                        |
| User & Admin Mongoose models     | Passwords hashed with bcryptjs    |
| JWT auth middleware              | Protect routes, role-based access |
| Register / Login API routes      | POST /api/auth/register & /login  |
| Next.js login & register pages   | With form validation              |
| Auth context (React Context API) | Store JWT, user info globally     |
| Protected routes in Next.js      | Middleware.js for admin pages     |

|                                             |                                           |
|---------------------------------------------|-------------------------------------------|
| **Phase 3: Product Catalog & Admin Upload** | **Weeks 3--4**                            |
| Product Mongoose model                      | All fields defined in Section 4.2         |
| Image upload with Multer + Cloudinary       | multipart/form-data handling              |
| CRUD API routes for products                | GET, POST, PUT, DELETE /api/products      |
| Admin: Add Product page                     | Multi-image upload, form fields           |
| Admin: Edit / Delete Product page           | Pre-filled form, delete confirm           |
| Customer: Shop page with filters            | Category, price, fabric, search           |
| Customer: Product detail page               | Image gallery, size selector, add to cart |

|                                       |                                                  |
|---------------------------------------|--------------------------------------------------|
| **Phase 4: Cart & Checkout**          | **Week 5**                                       |
| Cart state via React Context          | Add, remove, update qty, persist to localStorage |
| Cart page UI                          | Item list, totals, coupon field                  |
| Checkout page                         | Address form, order summary                      |
| Order model + create order API        | POST /api/orders creates Razorpay order too      |
| Shipping address save to user profile | Optional: save for future use                    |

|                                              |                                              |
|----------------------------------------------|----------------------------------------------|
| **Phase 5: Payments --- Razorpay**           | **Week 6**                                   |
| Razorpay account setup                       | Get Key ID and Key Secret                    |
| Backend: Create Razorpay order               | razorpay.orders.create({ amount, currency }) |
| Frontend: Razorpay checkout script           | window.Razorpay({ key, order_id, \... })     |
| Backend: Verify payment signature            | HMAC SHA256 verification                     |
| On success: update order status to confirmed | Mark paymentStatus: \'paid\'                 |
| Razorpay webhook (optional)                  | For refund events, dispute notifications     |

|                                              |                                                |
|----------------------------------------------|------------------------------------------------|
| **Phase 6: WhatsApp Delivery Notifications** | **Week 7**                                     |
| Choose provider: Twilio or Meta Cloud API    | Twilio easier to start; Meta free long-term    |
| Install Twilio SDK                           | npm install twilio (backend)                   |
| WhatsApp message templates                   | Approved templates for each order status       |
| Notification service: services/whatsapp.js   | sendWhatsApp(phone, templateName, params)      |
| Hook into order status update route          | PUT /api/orders/:id/status triggers WA message |
| Test with Twilio sandbox number              | whatsapp:+14155238886 for testing              |

|                                         |                                          |
|-----------------------------------------|------------------------------------------|
| **Phase 7: Admin Dashboard Completion** | **Week 8**                               |
| Order management table                  | Sortable, filterable list of all orders  |
| Order status dropdown                   | Select status → triggers WhatsApp notify |
| Inventory low-stock alerts              | Highlight products with stock \< 5       |
| Sales summary cards                     | Today\'s revenue, orders, top products   |
| Coupon code CRUD                        | Admin can create discount codes          |

|                                           |                                          |
|-------------------------------------------|------------------------------------------|
| **Phase 8: Polish, Testing & Deployment** | **Weeks 9--10**                          |
| Mobile-responsive design                  | TailwindCSS breakpoints throughout       |
| SEO: Next.js metadata API                 | Title, description, OG tags per page     |
| Loading skeletons + error states          | Suspense boundaries, try/catch           |
| API error handling middleware             | Consistent JSON error responses          |
| Deploy frontend to Vercel                 | Connect GitHub repo, set env vars        |
| Deploy backend to Railway / Render        | Free tier, auto-deploys from Git         |
| Deploy MongoDB Atlas                      | Already cloud-hosted, just whitelist IPs |
| Domain setup + HTTPS                      | Client\'s custom domain via Vercel       |

**7. Environment Variables**

**Backend --- backend/.env**

PORT=5000

MONGODB_URI=mongodb+srv://\<user\>:\<pass\>@cluster.mongodb.net/saree-shop

JWT_SECRET=your_super_secret_jwt_key

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx

RAZORPAY_KEY_SECRET=your_razorpay_secret

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx

TWILIO_AUTH_TOKEN=your_twilio_token

TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

**Frontend --- frontend/.env.local**

NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx

**8. WhatsApp Integration --- Detailed Guide**

**Option A: Twilio (Recommended for Launch)**

1.  Sign up at twilio.com, activate WhatsApp Sandbox

2.  Install SDK: npm install twilio

3.  Create services/whatsapp.js in backend

const twilio = require(\'twilio\');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendWhatsApp(toPhone, message) {

await client.messages.create({

from: process.env.TWILIO_WHATSAPP_FROM,

to: \`whatsapp:+91\${toPhone}\`,

body: message

});

}

module.exports = { sendWhatsApp };

**Option B: Meta WhatsApp Cloud API (Free, Long-term)**

4.  Create Meta Business account + WhatsApp Business App

5.  Get Phone Number ID and Access Token from Meta Developer Console

6.  Submit message templates for approval (required for business-initiated messages)

7.  Use fetch() to call https://graph.facebook.com/v18.0/{phone_number_id}/messages

**Message Templates (Example)**

- Order Confirmed: \"Hi {name}! Your order \#{orderId} for {item} has been confirmed. Total: Rs. {amount}. Thank you for shopping with us!\"

- Shipped: \"Great news {name}! Your order \#{orderId} has been shipped and is on the way. Expected delivery: {eta}.\"

- Delivered: \"Hello {name}! Your order \#{orderId} has been delivered. We hope you love your new {item}! Please share your feedback.\"

**9. Razorpay Payment Integration --- Flow**

**Step-by-step Flow**

8.  Customer clicks \'Place Order\' on checkout page

9.  Frontend calls POST /api/orders → backend creates Razorpay order, returns order_id

10. Frontend opens Razorpay payment popup using Razorpay JS SDK

11. Customer pays via UPI / card / wallet

12. On success: Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature

13. Frontend calls POST /api/orders/verify with those 3 values

14. Backend verifies signature using HMAC SHA256 (razorpay_order_id + \'\|\' + razorpay_payment_id, secret)

15. If valid: mark order as paid, trigger WhatsApp notification, redirect to order success page

**Important: Never trust the frontend for payment confirmation. Always verify the signature server-side.**

**10. Deployment Architecture**

|                 |                               |                                                |
|-----------------|-------------------------------|------------------------------------------------|
| **Layer**       | **Service**                   | **Notes**                                      |
| **Frontend**    | Vercel (Free)                 | Auto-deploys from GitHub, custom domain, HTTPS |
| **Backend API** | Railway or Render (Free tier) | Deploy Node/Express, add env vars in dashboard |
| **Database**    | MongoDB Atlas (Free M0)       | Cloud MongoDB, whitelist Railway/Render IPs    |
| **Images**      | Cloudinary (Free tier)        | 25GB storage, auto image optimization          |
| **Payments**    | Razorpay (Live)               | 2% transaction fee, Indian payment methods     |
| **WhatsApp**    | Twilio or Meta API            | Twilio: \~\$0.005/msg; Meta Cloud API: Free    |
| **Domain**      | Client buys .in / .com        | Point A record to Vercel IP                    |

**11. Key NPM Packages**

**Backend**

|                           |                                 |
|---------------------------|---------------------------------|
| **Package**               | **Purpose**                     |
| express                   | Web framework                   |
| mongoose                  | MongoDB ODM                     |
| bcryptjs                  | Password hashing                |
| jsonwebtoken              | JWT generation & verification   |
| multer                    | Multipart file upload handling  |
| cloudinary                | Upload images to Cloudinary CDN |
| multer-storage-cloudinary | Multer + Cloudinary integration |
| razorpay                  | Razorpay Node.js SDK            |
| twilio                    | WhatsApp / SMS via Twilio       |
| cors                      | Cross-Origin Resource Sharing   |
| dotenv                    | Load .env variables             |
| express-validator         | Request validation middleware   |

**Frontend**

|                  |                                      |
|------------------|--------------------------------------|
| **Package**      | **Purpose**                          |
| next             | React SSR/SSG framework              |
| react, react-dom | UI library                           |
| tailwindcss      | Utility-first CSS styling            |
| axios            | HTTP requests to backend API         |
| react-hot-toast  | Toast notifications                  |
| react-hook-form  | Form state management                |
| swiper           | Image carousel / gallery             |
| lucide-react     | Icon library                         |
| next/image       | Optimized image rendering (built-in) |

**12. Developer Tips & Gotchas**

**WhatsApp**

- Twilio sandbox requires the customer to first message the sandbox number to opt in --- not ideal for production. Switch to Twilio business number or Meta Cloud API before launch.

- Meta Cloud API requires template message approval (24--48 hrs). Submit templates early.

- Always store customer phone as string with country code prefix: +91XXXXXXXXXX

**Razorpay**

- Use rzp_test\_\* keys during development, switch to rzp_live\_\* only when going live.

- Razorpay popup will be blocked if not triggered by a direct user click event.

- Always handle payment.failed and modal.ondismiss events gracefully.

**Image Uploads**

- Set a max file size limit in Multer (e.g., 5MB) to prevent abuse.

- Use Cloudinary transformations to auto-resize product images (w_800,q_auto,f_auto).

- Store Cloudinary public_id alongside URL so you can delete images when a product is removed.

**Admin Security**

- Admin routes must use both verifyJWT and requireAdmin middleware.

- Never expose admin routes in the frontend if the role is not admin.

- Add rate limiting (express-rate-limit) to auth endpoints to prevent brute force.

*Built with ❤️ for a local traditional wear business*

Next.js • Node.js • MongoDB • Express • Razorpay • WhatsApp
