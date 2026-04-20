import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Order from "@/models/Order";
import { apiPaginated, withAuth, AuthenticatedRequest, parsePagination, handleApiError } from "@/lib/utils/api";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);
    const query: Record<string, unknown> = {};

    const status = searchParams.get("status");
    if (status) query.status = status;

    const search = searchParams.get("search");
    if (search) query.orderNumber = { $regex: search, $options: "i" };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return apiPaginated(orders, page, limit, total);
  } catch (e) { return handleApiError(e); }
}, true) as (req: NextRequest) => Promise<Response>;
