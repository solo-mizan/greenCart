import { connectDB } from "@/lib/db/connect";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";
import { cartItemSchema } from "@/lib/validations/schemas";

// GET /api/cart
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name images price discountPrice unit quantity isActive");
    return apiSuccess(cart ?? { items: [] });
  } catch (e) { return handleApiError(e); }
});

// POST /api/cart — add or update item
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = cartItemSchema.safeParse(body);
    if (!parsed.success) return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);

    const { productId, quantity } = parsed.data;
    await connectDB();

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return apiError("পণ্য পাওয়া যায়নি", 404);
    if (product.quantity < quantity) return apiError(`মাত্র ${product.quantity} ${product.unit} স্টকে আছে`, 400);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex((i) => i.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity = quantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.discountPrice ?? product.price,
        name: product.name,
        image: product.images[0] ?? "",
        unit: product.unit,
      });
    }

    await cart.save();
    const populated = await cart.populate("items.product", "name images price discountPrice unit quantity");
    return apiSuccess(populated);
  } catch (e) { return handleApiError(e); }
});

// DELETE /api/cart — clear or remove single item
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    await connectDB();

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return apiSuccess({ message: "কার্ট খালি" });

    if (productId) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      cart.items = [];
    }

    await cart.save();
    return apiSuccess(cart);
  } catch (e) { return handleApiError(e); }
});
