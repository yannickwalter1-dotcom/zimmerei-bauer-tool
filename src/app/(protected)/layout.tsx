import Nav from "./nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6">
        {children}
      </main>
      <Nav />
    </div>
  );
}
