export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-vh-green-950 to-vh-green-900">
      <div className="mx-auto flex min-h-screen max-w-[560px] flex-col">
        {children}
      </div>
    </div>
  );
}
