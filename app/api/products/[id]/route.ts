import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";
import { productUpdateSchema } from "@/lib/validations/schemas";

interface Context {
  params: Promise<{ id: string }>;
}

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: Context) {
  try {
    await connectDB();
    const { id } = await params;

    // Support slug OR ObjectId lookup
    const product = await Product.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }],
      isActive: true,
    }).populate("category", "name slug icon");

    if (!product) return apiError("পণ্য পাওয়া যায়নি", 404);
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/products/[id] — admin only
export const PATCH = withAuth(async (req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
    }
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true })
      .populate("category", "name slug");
    if (!product) return apiError("পণ্য পাওয়া যায়নি", 404);
    return apiSuccess(product);
  } catch (error) {
    return handleApiError(error);
  }
}, true);

// DELETE /api/products/[id] — admin only (soft delete)
export const DELETE = withAuth(async (req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) return apiError("পণ্য পাওয়া যায়নি", 404);
    return apiSuccess({ message: "পণ্য সফলভাবে মুছে ফেলা হয়েছে" });
  } catch (error) {
    return handleApiError(error);
  }
}, true);
