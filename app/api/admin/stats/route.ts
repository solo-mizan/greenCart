import { connectDB } from "@/lib/db/connect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { apiSuccess, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";

export const GET = withAuth(async () => {
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalUsers,
      totalProducts,
      lowStockProducts,
      revenueAgg,
      lastMonthRevenueAgg,
      recentOrders,
      monthlyOrdersAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      User.countDocuments({ role: "user" }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ quantity: { $lte: 5 }, isActive: true }),
      Order.aggregate([
        { $match: { status: "delivered", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { status: "delivered", createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email").lean(),
      Order.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            orders: { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const thisMonthRevenue = revenueAgg[0]?.total ?? 0;
    const lastMonthRevenue = lastMonthRevenueAgg[0]?.total ?? 0;
    const revenueGrowth = lastMonthRevenue > 0
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : null;

    return apiSuccess({
      orders: { total: totalOrders, pending: pendingOrders, delivered: deliveredOrders, cancelled: cancelledOrders },
      users: totalUsers,
      products: { total: totalProducts, lowStock: lowStockProducts },
      revenue: { thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue, growth: revenueGrowth },
      recentOrders,
      monthlyChart: monthlyOrdersAgg,
    });
  } catch (e) { return handleApiError(e); }
}, true);
