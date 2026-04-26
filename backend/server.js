const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS: allow configured frontend + local dev + vercel previews
const normalizeOrigin = (value) => (value || "").replace(/\/+$/, "").trim();
const envFrontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
const allowedOrigins = new Set(
    [
        envFrontendOrigin,
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
        let isVercelPreview = false;
        try {
            isVercelPreview = /\.vercel\.app$/i.test(new URL(normalized).hostname);
        } catch {
            isVercelPreview = false;
        }
        const isAllowed = allowedOrigins.has(normalized) || isVercelPreview;

        if (isAllowed) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-refund-token"],
};

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
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

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Increase timeout for large file uploads (10 minutes)
server.timeout = 600000;
