import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations/schemas";
import { apiSuccess, apiError, handleApiError } from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
    }

    const { name, email, phone, firebaseUid } = parsed.data;

    await connectDB();

    const existing = await User.findOne({
      $or: [{ email }, { firebaseUid }],
    });

    if (existing) {
      return apiError("এই ইমেইল দিয়ে অ্যাকাউন্ট আগেই আছে", 409);
    }

    const user = await User.create({ name, email, phone, firebaseUid });

    return apiSuccess(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
