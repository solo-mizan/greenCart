import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { withAuth, apiSuccess, apiError, AuthenticatedRequest } from "@/lib/utils/api";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "greencart/products";

    if (!file) return apiError("কোনো ফাইল পাওয়া যায়নি", 400);
    if (file.size > 5 * 1024 * 1024) return apiError("ফাইল সাইজ ৫MB-র বেশি হওয়া যাবে না", 400);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return apiError("শুধুমাত্র JPEG, PNG, WebP ফর্ম্যাট গ্রহণযোগ্য", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return apiSuccess({ url: result.secure_url, publicId: result.public_id });
  } catch {
    return apiError("ছবি আপলোড ব্যর্থ হয়েছে", 500);
  }
}, true) as (req: NextRequest) => Promise<Response>;
