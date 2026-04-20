import { z } from "zod";

// ─── User ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে").max(60),
  email: z.string().email("সঠিক ইমেইল দিন"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশি নম্বর দিন").optional(),
  firebaseUid: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  phone: z.string().regex(/^01[3-9]\d{8}$/).optional(),
  avatar: z.string().url().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, "লেবেল দিন"),
  street: z.string().min(3, "রাস্তার ঠিকানা দিন"),
  area: z.string().min(2, "এলাকা দিন"),
  city: z.string().min(2, "শহর দিন"),
  district: z.string().min(2, "জেলা দিন"),
  postalCode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// ─── Product ──────────────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2, "পণ্যের নাম দিন").max(120),
  description: z.string().min(10, "বিবরণ কমপক্ষে ১০ অক্ষর হতে হবে"),
  price: z.number().positive("দাম ০-র বেশি হতে হবে"),
  discountPrice: z.number().positive().optional(),
  unit: z.string().min(1, "একক দিন"),
  quantity: z.number().int().min(0, "স্টক ০ বা বেশি হতে হবে"),
  images: z.array(z.string().url()).min(1, "কমপক্ষে ১টি ছবি দিন"),
  category: z.string().min(1, "বিভাগ নির্বাচন করুন"),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sku: z.string().optional(),
  weight: z.number().positive().optional(),
  origin: z.string().optional(),
});

export const productUpdateSchema = productSchema.partial();

// ─── Category ─────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(2, "বিভাগের নাম দিন").max(60),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "স্লাগে শুধু ইংরেজি, সংখ্যা ও - ব্যবহার করুন"),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const cartItemSchema = z.object({
  productId: z.string().min(1, "পণ্যের আইডি দিন"),
  quantity: z.number().int().min(1, "পরিমাণ কমপক্ষে ১ হতে হবে"),
});

// ─── Order ────────────────────────────────────────────────────────────────────

export const shippingAddressSchema = z.object({
  name: z.string().min(2, "নাম দিন"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),
  street: z.string().min(3, "রাস্তার ঠিকানা দিন"),
  area: z.string().min(2, "এলাকা দিন"),
  city: z.string().min(2, "শহর দিন"),
  district: z.string().min(2, "জেলা দিন"),
  postalCode: z.string().optional(),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["cod", "sslcommerz", "stripe"]).default("cod"),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  note: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
