import { withAuth, apiSuccess, AuthenticatedRequest } from "@/lib/utils/api";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const user = req.user;
  return apiSuccess({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    addresses: user.addresses,
    createdAt: user.createdAt,
  });
});
