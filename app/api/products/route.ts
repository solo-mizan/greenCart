import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import { apiSuccess, apiError, apiPaginated, parsePagination, withAuth, AuthenticatedRequest, handleApiError } from "@/lib/utils/api";
import { productSchema } from "@/lib/validations/schemas";
import slugify from "@/lib/utils/slugify";

// GET /api/products — public with search/filter/sort/pagination
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { page, limit, skip } = parsePagination(req);
    const { searchParams } = new URL(req.url);

    const query: Record<string, unknown> = { isActive: true };

    // Full-text search
    const search = searchParams.get("search");
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    const category = searchParams.get("category");
    if (category) query.category = category;

    // Price range
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
    }

    // Featured filter
    if (searchParams.get("featured") === "true") query.isFeatured = true;

    // Sort
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
    };
    const sort = sortMap[searchParams.get("sort") ?? "newest"] ?? sortMap.newest;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug icon")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return apiPaginated(products, page, limit, total);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/products — admin only
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
    }

    await connectDB();
    const slug = slugify(parsed.data.name);

    // Ensure slug uniqueness
    let finalSlug = slug;
    let count = 0;
    while (await Product.exists({ slug: finalSlug })) {
      finalSlug = `${slug}-${++count}`;
    }

    const product = await Product.create({ ...parsed.data, slug: finalSlug });
    const populated = await product.populate("category", "name slug");
    return apiSuccess(populated, 201);
  } catch (error) {
    return handleApiError(error);
  }
}, true);
