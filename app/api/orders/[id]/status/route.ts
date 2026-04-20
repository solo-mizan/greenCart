import { connectDB } from "@/lib/db/connect";
import Order from "@/models/Order";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";
import { updateOrderStatusSchema } from "@/lib/validations/schemas";

interface Context { params: Promise<{ id: string }> }

export const PATCH = withAuth(async (req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    const body = await req.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);

    await connectDB();
    const order = await Order.findById(id);
    if (!order) return apiError("অর্ডার পাওয়া যায়নি", 404);

    order.status = parsed.data.status;
    order.statusHistory.push({
      status: parsed.data.status,
      timestamp: new Date(),
      note: parsed.data.note,
    });

    if (parsed.data.status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";
    }
    if (parsed.data.status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();
    return apiSuccess(order);
  } catch (e) { return handleApiError(e); }
}, true);
