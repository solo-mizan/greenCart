import { connectDB } from "@/lib/db/connect";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, parsePagination, apiPaginated, handleApiError } from "@/lib/utils/api";
import { createOrderSchema } from "@/lib/validations/schemas";

const SHIPPING_FEE = 60;
const FREE_SHIPPING_THRESHOLD = 500;

// GET /api/orders — user's own orders
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await connectDB();
    const { page, limit, skip } = parsePagination(req);
    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: req.user._id }),
    ]);
    return apiPaginated(orders, page, limit, total);
  } catch (e) { return handleApiError(e); }
});

// POST /api/orders — place order from cart
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);

    await connectDB();
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return apiError("কার্ট খালি", 400);
    }

    // Validate stock & build order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return apiError(`"${item.name}" পণ্যটি এখন উপলব্ধ নয়`, 400);
      }
      if (product.quantity < item.quantity) {
        return apiError(`"${product.name}": মাত্র ${product.quantity} ${product.unit} স্টকে আছে`, 400);
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] ?? "",
        price: product.discountPrice ?? product.price,
        quantity: item.quantity,
        unit: product.unit,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    // Deduct stock
    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { quantity: -item.quantity } })
      )
    );

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: parsed.data.shippingAddress,
      paymentMethod: parsed.data.paymentMethod,
      notes: parsed.data.notes,
      subtotal,
      shippingFee,
      total,
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    return apiSuccess(order, 201);
  } catch (e) { return handleApiError(e); }
});
