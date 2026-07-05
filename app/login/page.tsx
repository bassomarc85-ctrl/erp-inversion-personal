import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-8">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">
          Oficina patrimonial
        </p>
        <h1 className="font-display text-2xl font-medium mb-6">Acceso privado</h1>

        {searchParams?.error && (
          <p className="text-loss text-sm mb-4">{searchParams.error}</p>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-surfacealt border border-border rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accentlight text-white rounded px-4 py-2 text-sm font-medium transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
