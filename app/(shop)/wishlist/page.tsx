import type { Metadata } from "next";
import WishlistPage from "@/components/product/WishlistPage";
export const metadata: Metadata = { title: "উইশলিস্ট" };
export default function Wishlist() { return <WishlistPage />; }
