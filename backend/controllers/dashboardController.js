const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getStats = async (req, res, next) => {
    try {
        const { status } = req.query; // Optional status filter: delivered, pending, cancelled
        
        const matchStage = {
            status: { $ne: 'cancelled' }
        };
        
        if (status) {
            matchStage.status = status;
        }

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        
        const startOfWeek = new Date();
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const getSalesData = async (startDate) => {
            const results = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate },
                        ...matchStage
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                }
            ]);
            return results.length > 0 ? results[0] : { totalSales: 0, count: 0 };
        };

        // Get daily sales for the last 7 days
        const getDailySales = async () => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const results = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo },
                        status: { $ne: 'cancelled' }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        totalSales: { $sum: "$totalAmount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            // Fill in gaps for days with zero sales
            const dailyData = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(sevenDaysAgo);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const dayMatch = results.find(r => r._id === dateStr);
                dailyData.push({
                    date: dateStr,
                    totalSales: dayMatch ? dayMatch.totalSales : 0
                });
            }
            return dailyData;
        };

        const [dayStats, weekStats, monthStats, yearStats, dailySales, lowStockCount] = await Promise.all([
            getSalesData(startOfDay),
            getSalesData(startOfWeek),
            getSalesData(startOfMonth),
            getSalesData(startOfYear),
            getDailySales(),
            Product.countDocuments({ countInStock: { $lt: 10 } })
        ]);

        // Get recent orders for the dashboard feed
        const recentOrders = await Order.find(matchStage)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        res.json({
            sales: {
                day: dayStats,
                week: weekStats,
                month: monthStats,
                year: yearStats
            },
            dailySales,
            lowStockCount,
            recentOrders
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats
};
