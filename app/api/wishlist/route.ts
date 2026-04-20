import { connectDB } from "@/lib/db/connect";
import Wishlist from "@/models/Wishlist";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate("products", "name images price discountPrice unit rating");
    return apiSuccess(wishlist ?? { products: [] });
  } catch (e) { return handleApiError(e); }
});

// Toggle product in wishlist
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { productId } = await req.json();
    if (!productId) return apiError("পণ্যের আইডি প্রয়োজন", 400);

    await connectDB();
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

    const idx = wishlist.products.findIndex((p) => p.toString() === productId);
    let action: "added" | "removed";
    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      action = "removed";
    } else {
      wishlist.products.push(productId);
      action = "added";
    }

    await wishlist.save();
    return apiSuccess({ action, productId });
  } catch (e) { return handleApiError(e); }
});
