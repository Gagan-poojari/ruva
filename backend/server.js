const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { monitorApiError } = require('./services/monitoring');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS: explicit allowlist only
const normalizeOrigin = (value) => (value || "").replace(/\/+$/, "").trim();
const envFrontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
const envAllowlist = (process.env.CORS_ALLOWLIST || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);
const allowedOrigins = new Set(
    [
        envFrontendOrigin,
        ...envAllowlist,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ruva-five.vercel.app",
    ].filter(Boolean)
);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser tools (no Origin header) like curl/postman/server-to-server.
        if (!origin) return callback(null, true);

        const normalized = normalizeOrigin(origin);
        const isAllowed = allowedOrigins.has(normalized);

        if (isAllowed) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-refund-token"],
};

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests. Please try again shortly.",
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many authentication attempts. Please try again later.",
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(globalLimiter);
app.use('/api/orders/razorpay/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Routes
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Handle Mongoose/MongoDB Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        message = 'A saree with this name already exists. Please use a unique name.';
    }

    monitorApiError({
        req,
        statusCode,
        message,
        stack: err.stack,
    }).catch((monitorError) => {
        console.error('[MONITOR] Failed to process api error:', monitorError.message);
    });

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

// Keep Render free tier alive (ping every 14 minutes)
if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const https = require('https');
      https.get('https://ruva-backend.onrender.com/', (res) => {
        console.log(`[Keep-alive] ping status: ${res.statusCode}`);
      }).on('error', (e) => {
        console.error('[Keep-alive] ping failed:', e.message);
      });
    }, 14 * 60 * 1000); // every 14 minutes
  }

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Increase timeout for large file uploads (10 minutes)
server.timeout = 600000;
