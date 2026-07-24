import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ weiter?: string }>;
}) {
  const { weiter } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-zinc-900">
          Zimmerei Bauer
        </h1>
        <p className="mb-6 text-center text-sm text-zinc-500">
          Bitte Zugangscode eingeben
        </p>
        <LoginForm weiter={weiter ?? "/"} />
      </div>
    </div>
  );
}
