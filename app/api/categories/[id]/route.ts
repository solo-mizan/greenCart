import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";
import { categorySchema } from "@/lib/validations/schemas";

interface Context { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Context) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) return apiError("বিভাগ পাওয়া যায়নি", 404);
    return apiSuccess(category);
  } catch (e) { return handleApiError(e); }
}

export const PATCH = withAuth(async (req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    const body = await req.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
    await connectDB();
    const cat = await Category.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!cat) return apiError("বিভাগ পাওয়া যায়নি", 404);
    return apiSuccess(cat);
  } catch (e) { return handleApiError(e); }
}, true);

export const DELETE = withAuth(async (_req: AuthenticatedRequest, context: unknown) => {
  try {
    const { id } = await (context as Context).params;
    await connectDB();
    await Category.findByIdAndUpdate(id, { isActive: false });
    return apiSuccess({ message: "বিভাগ মুছে ফেলা হয়েছে" });
  } catch (e) { return handleApiError(e); }
}, true);
