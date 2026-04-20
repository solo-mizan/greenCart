/**
 * GreenCart — Database Seed Script
 * Usage: npx tsx scripts/seed.ts
 * Requires MONGODB_URI in .env.local
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load env vars
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI পাওয়া যায়নি। .env.local ফাইল চেক করুন।");
  process.exit(1);
}

// ── Minimal inline schemas for seeding ─────────────────────────────────────

const CategorySchema = new mongoose.Schema({
  name: String, slug: String, icon: String, description: String,
  isActive: { type: Boolean, default: true }, sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String,
  price: Number, discountPrice: Number, unit: String, quantity: Number,
  images: [String], category: mongoose.Schema.Types.ObjectId,
  tags: [String], isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 }, reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product   = mongoose.models.Product  || mongoose.model("Product",  ProductSchema);

// ── Seed data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "তাজা সবজি",     slug: "vegetables", icon: "🥦", sortOrder: 1,
    description: "প্রতিদিন সকালে সংগ্রহ করা তাজা সবজি" },
  { name: "ফলমূল",          slug: "fruits",     icon: "🍎", sortOrder: 2,
    description: "দেশী ও বিদেশী তাজা ফল" },
  { name: "দুগ্ধজাত পণ্য",  slug: "dairy",      icon: "🥛", sortOrder: 3,
    description: "দুধ, দই, পনির ও মাখন" },
  { name: "মাছ ও মাংস",     slug: "meat-fish",  icon: "🐟", sortOrder: 4,
    description: "তাজা মাছ, মুরগি ও গরুর মাংস" },
  { name: "চাল ও ডাল",      slug: "grains",     icon: "🌾", sortOrder: 5,
    description: "বিভিন্ন জাতের চাল ও ডাল" },
  { name: "মসলা",           slug: "spices",     icon: "🧂", sortOrder: 6,
    description: "দেশী মসলা ও পাউডার" },
  { name: "তেল ও ঘি",       slug: "oil-ghee",   icon: "🫒", sortOrder: 7,
    description: "সয়াবিন, সরিষার তেল ও ঘি" },
  { name: "বেকারি",          slug: "bakery",     icon: "🍞", sortOrder: 8,
    description: "পাউরুটি, বিস্কুট ও কেক" },
];

const IMG = (w = 400, h = 400, bg = "bbf7d0", fg = "15803d") =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=GreenCart`;

function makeProducts(catMap: Map<string, string>) {
  return [
    // ── সবজি ──
    { name: "পালং শাক", slug: "palang-shak", description: "তাজা সবুজ পালং শাক, ভিটামিন সমৃদ্ধ।", price: 30, unit: "আঁটি", quantity: 120, category: catMap.get("vegetables"), images: [IMG(400,400,"dcfce7","15803d")], tags: ["তাজা","শাক"], isFeatured: false },
    { name: "টমেটো", slug: "tomato", description: "লাল টকটকে দেশী টমেটো। রান্না ও সালাদ উভয়ের জন্য উপযুক্ত।", price: 60, discountPrice: 50, unit: "কেজি", quantity: 200, category: catMap.get("vegetables"), images: [IMG(400,400,"fef9c3","ca8a04")], tags: ["তাজা","সবজি"], isFeatured: true, rating: 4.5, reviewCount: 23 },
    { name: "করলা", slug: "korola", description: "তেতো করলা, ডায়াবেটিস নিয়ন্ত্রণে সহায়ক।", price: 50, unit: "কেজি", quantity: 80, category: catMap.get("vegetables"), images: [IMG(400,400,"d1fae5","065f46")], tags: ["তাজা"] },
    { name: "বেগুন", slug: "begun", description: "কালো বেগুন, ভর্তা ও ভাজির জন্য উত্তম।", price: 45, unit: "কেজি", quantity: 100, category: catMap.get("vegetables"), images: [IMG(400,400,"ede9fe","5b21b6")], tags: ["দেশী"] },
    { name: "ঢেঁড়স", slug: "dherosh", description: "তাজা সবুজ ঢেঁড়স, ভর্তা ও তরকারিতে অতুলনীয়।", price: 40, unit: "কেজি", quantity: 60, category: catMap.get("vegetables"), images: [IMG(400,400,"dcfce7","166534")] },
    { name: "ফুলকপি", slug: "fulkopi", description: "তুষার সাদা ফুলকপি। শীতের সেরা সবজি।", price: 35, discountPrice: 30, unit: "পিস", quantity: 150, category: catMap.get("vegetables"), images: [IMG(400,400,"f1f5f9","475569")], isFeatured: true, rating: 4.2, reviewCount: 15 },

    // ── ফলমূল ──
    { name: "কলা (সাগর)", slug: "kola-sagor", description: "পাকা মিষ্টি সাগর কলা। শক্তির ভালো উৎস।", price: 70, unit: "ডজন", quantity: 90, category: catMap.get("fruits"), images: [IMG(400,400,"fef9c3","92400e")], tags: ["দেশী","মিষ্টি"], isFeatured: true, rating: 4.8, reviewCount: 42 },
    { name: "আম (ল্যাংড়া)", slug: "am-langra", description: "রসালো ল্যাংড়া আম। মৌসুমি ফল।", price: 150, discountPrice: 130, unit: "কেজি", quantity: 40, category: catMap.get("fruits"), images: [IMG(400,400,"fef3c7","b45309")], tags: ["মৌসুমি","মিষ্টি"], isFeatured: true, rating: 4.9, reviewCount: 67 },
    { name: "পেঁপে", slug: "pepe", description: "কাঁচা ও পাকা পেঁপে। রান্না ও খাওয়া উভয় উপযোগী।", price: 40, unit: "কেজি", quantity: 75, category: catMap.get("fruits"), images: [IMG(400,400,"fed7aa","c2410c")] },
    { name: "তরমুজ", slug: "tormuuj", description: "লাল রসালো তরমুজ। গরমে তৃষ্ণা মেটায়।", price: 80, unit: "কেজি", quantity: 30, category: catMap.get("fruits"), images: [IMG(400,400,"fce7f3","9d174d")] },

    // ── দুগ্ধজাত ──
    { name: "তাজা দুধ (আধা লিটার)", slug: "fresh-milk-half", description: "খামার থেকে সংগ্রহ করা তাজা গরুর দুধ।", price: 45, unit: "পিস", quantity: 200, category: catMap.get("dairy"), images: [IMG(400,400,"dbeafe","1e40af")], isFeatured: true, rating: 4.6, reviewCount: 30 },
    { name: "দই (মিষ্টি)", slug: "doi-mishti", description: "ঘরে তৈরি মিষ্টি দই। বিশেষ উপলক্ষের জন্য আদর্শ।", price: 60, unit: "পাত্র", quantity: 50, category: catMap.get("dairy"), images: [IMG(400,400,"fef9c3","854d0e")] },
    { name: "পনির", slug: "ponir", description: "তাজা সাদা পনির। স্যান্ডউইচ ও রান্নায় চমৎকার।", price: 120, unit: "২০০গ্রাম", quantity: 35, category: catMap.get("dairy"), images: [IMG(400,400,"f0fdf4","166534")] },

    // ── চাল ও ডাল ──
    { name: "মিনিকেট চাল", slug: "miniket-chal", description: "প্রিমিয়াম মিনিকেট চাল। রান্নায় সুঘ্রাণ ছড়ায়।", price: 75, discountPrice: 70, unit: "কেজি", quantity: 500, category: catMap.get("grains"), images: [IMG(400,400,"fef9c3","a16207")], isFeatured: true, rating: 4.4, reviewCount: 55 },
    { name: "মুসুর ডাল", slug: "musur-dal", description: "পুষ্টিকর মুসুর ডাল। প্রতিদিনের রান্নার জন্য অপরিহার্য।", price: 110, unit: "কেজি", quantity: 300, category: catMap.get("grains"), images: [IMG(400,400,"fed7aa","c2410c")] },
    { name: "মুগ ডাল", slug: "mug-dal", description: "সবুজ মুগ ডাল। ভিটামিন ও প্রোটিনে ভরপুর।", price: 130, unit: "কেজি", quantity: 150, category: catMap.get("grains"), images: [IMG(400,400,"d1fae5","065f46")] },

    // ── মসলা ──
    { name: "হলুদ গুঁড়ো", slug: "holud-guro", description: "খাঁটি দেশী হলুদ গুঁড়ো। অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ।", price: 80, unit: "২০০গ্রাম", quantity: 200, category: catMap.get("spices"), images: [IMG(400,400,"fef9c3","92400e")] },
    { name: "মরিচ গুঁড়ো", slug: "morich-guro", description: "তীক্ষ্ণ লাল মরিচ গুঁড়ো। রান্নায় রং ও ঝাল আনে।", price: 90, unit: "২০০গ্রাম", quantity: 180, category: catMap.get("spices"), images: [IMG(400,400,"fee2e2","dc2626")] },
    { name: "ধনিয়া গুঁড়ো", slug: "dhonia-guro", description: "সুগন্ধি ধনিয়া গুঁড়ো। মাংস ও তরকারিতে ব্যবহার হয়।", price: 70, unit: "১৫০গ্রাম", quantity: 160, category: catMap.get("spices"), images: [IMG(400,400,"dcfce7","166534")] },

    // ── তেল ──
    { name: "সয়াবিন তেল (১ লিটার)", slug: "soybean-oil-1L", description: "বিশুদ্ধ সয়াবিন তেল। দৈনন্দিন রান্নার জন্য।", price: 175, discountPrice: 165, unit: "বোতল", quantity: 300, category: catMap.get("oil-ghee"), images: [IMG(400,400,"fef9c3","ca8a04")], isFeatured: true, rating: 4.3, reviewCount: 28 },
    { name: "সরিষার তেল", slug: "shorisha-oil", description: "খাঁটি সরিষার তেল। ভর্তা ও ভাজিতে অনন্য।", price: 200, unit: "৫০০মি.লি.", quantity: 120, category: catMap.get("oil-ghee"), images: [IMG(400,400,"fef3c7","b45309")] },
  ];
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 GreenCart সিড শুরু হচ্ছে...\n");

  await mongoose.connect(MONGODB_URI!);
  console.log("✅ MongoDB-তে সংযুক্ত হয়েছে");

  // Categories
  await Category.deleteMany({});
  const savedCats = await Category.insertMany(CATEGORIES);
  console.log(`✅ ${savedCats.length}টি বিভাগ তৈরি হয়েছে`);

  const catMap = new Map<string, string>();
  savedCats.forEach((c: { slug: string; _id: { toString(): string } }) => catMap.set(c.slug, c._id.toString()));

  // Products
  await Product.deleteMany({});
  const products = makeProducts(catMap);
  const savedProds = await Product.insertMany(products);
  console.log(`✅ ${savedProds.length}টি পণ্য তৈরি হয়েছে\n`);

  console.log("🎉 সিড সম্পূর্ণ হয়েছে!\n");
  console.log("── তৈরি হয়েছে ──────────────────────────");
  savedCats.forEach((c: { name: string; slug: string }) => console.log(`  📁 ${c.name} (${c.slug})`));
  console.log("─────────────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ সিড ব্যর্থ হয়েছে:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
