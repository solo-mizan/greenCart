import type { Metadata } from "next";
import CartPage from "@/components/cart/CartPage";
export const metadata: Metadata = { title: "আমার কার্ট" };
export default function Cart() { return <CartPage />; }
