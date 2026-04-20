import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebase/admin";
import { connectDB } from "@/lib/db/connect";
import User, { IUser } from "@/models/User";

// ─── Standard Response Helpers ───────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

export function apiPaginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

export interface AuthenticatedRequest extends NextRequest {
  user: IUser;
}

type RouteHandler = (req: AuthenticatedRequest, context?: unknown) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler, requireAdmin = false) {
  return async (req: NextRequest, context?: unknown) => {
    try {
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return apiError("অনুমোদন টোকেন প্রয়োজন", 401);
      }

      const token = authHeader.split("Bearer ")[1];

      let decoded: admin.auth.DecodedIdToken;
      try {
        decoded = await admin.auth().verifyIdToken(token);
      } catch {
        return apiError("অবৈধ বা মেয়াদোত্তীর্ণ টোকেন", 401);
      }

      await connectDB();
      let user = await User.findOne({ firebaseUid: decoded.uid });

      if (!user) {
        // Create user if not exists
        user = await User.create({
          name: decoded.name || "ব্যবহারকারী",
          email: decoded.email,
          firebaseUid: decoded.uid,
        });
      }

      if (requireAdmin && user.role !== "admin") {
        return apiError("এই পৃষ্ঠায় প্রবেশাধিকার নেই", 403);
      }

      const authReq = req as AuthenticatedRequest;
      authReq.user = user;

      return handler(authReq, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return apiError("সার্ভার ত্রুটি", 500);
    }
  };
}

// ─── Pagination Parser ────────────────────────────────────────────────────────

export function parsePagination(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12")));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// ─── Error Handler ────────────────────────────────────────────────────────────

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof Error) {
    if (error.message.includes("Cast to ObjectId")) {
      return apiError("অবৈধ আইডি ফরম্যাট", 400);
    }
    if ((error as any).code === 11000) {
      return apiError("এই তথ্য ইতিমধ্যে বিদ্যমান", 409);
    }
  }
  return apiError("সার্ভার ত্রুটি হয়েছে", 500);
}
