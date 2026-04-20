import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Category from "@/models/Category";
import { apiSuccess, apiError, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";
import { categorySchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
    }
    await connectDB();
    const category = await Category.create(parsed.data);
    return apiSuccess(category, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, true) as (req: NextRequest) => Promise<Response>;
