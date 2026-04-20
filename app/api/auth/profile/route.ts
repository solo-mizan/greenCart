import { NextResponse } from "next/server";
import { withAuth, apiSuccess, apiError, AuthenticatedRequest } from "@/lib/utils/api";
import { updateProfileSchema, addressSchema } from "@/lib/validations/schemas";
import User from "@/models/User";

// Update profile
export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
  }
  const user = await User.findByIdAndUpdate(req.user._id, parsed.data, { new: true });
  return apiSuccess({ name: user!.name, phone: user!.phone, avatar: user!.avatar });
});

// Add a delivery address
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("যাচাইকরণ ব্যর্থ", 422, parsed.error.flatten().fieldErrors);
  }

  const user = await User.findById(req.user._id);
  if (!user) return apiError("ব্যবহারকারী পাওয়া যায়নি", 404);

  if (parsed.data.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push(parsed.data as typeof user.addresses[0]);
  await user.save();

  return apiSuccess(user.addresses, 201);
}) as () => Promise<NextResponse>;
