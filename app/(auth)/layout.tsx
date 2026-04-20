export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-green-50 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
