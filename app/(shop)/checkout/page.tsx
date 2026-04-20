import type { Metadata } from "next";
import CheckoutPage from "@/components/order/CheckoutPage";
export const metadata: Metadata = { title: "চেকআউট" };
export default function Checkout() { return <CheckoutPage />; }
