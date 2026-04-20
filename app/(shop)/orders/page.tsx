import type { Metadata } from "next";
import OrdersPage from "@/components/order/OrdersPage";
export const metadata: Metadata = { title: "আমার অর্ডার" };
export default function Orders() { return <OrdersPage />; }
