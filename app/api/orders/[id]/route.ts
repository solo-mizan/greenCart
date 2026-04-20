import { connectDB } from "@/lib/db/connect";
import Order from "@/models/Order";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";

interface Context { params: Promise<{ id: string }> }

export const GET = withAuth(async (req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    await connectDB();
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return apiError("অর্ডার পাওয়া যায়নি", 404);
    return apiSuccess(order);
  } catch (e) { return handleApiError(e); }
});

// Cancel order (user side — only pending/confirmed)
export const DELETE = withAuth(async (req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    const body = await req.json().catch(() => ({}));
    await connectDB();

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) return apiError("অর্ডার পাওয়া যায়নি", 404);
    if (!["pending", "confirmed"].includes(order.status)) {
      return apiError("এই অর্ডার বাতিল করা সম্ভব নয়", 400);
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = body.reason ?? "গ্রাহক কর্তৃক বাতিল";
    order.statusHistory.push({ status: "cancelled", timestamp: new Date() });
    await order.save();

    return apiSuccess({ message: "অর্ডার বাতিল করা হয়েছে" });
  } catch (e) { return handleApiError(e); }
});
