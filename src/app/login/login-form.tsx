"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ weiter }: { weiter: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="weiter" value={weiter} />
      <input
        type="password"
        name="code"
        inputMode="numeric"
        autoFocus
        required
        placeholder="Zugangscode"
        className="h-14 w-full rounded-xl border border-zinc-300 px-4 text-center text-xl tracking-widest focus:border-zinc-900 focus:outline-none"
      />
      {state.fehler && (
        <p className="text-center text-sm font-medium text-red-600">
          {state.fehler}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-14 w-full rounded-xl bg-zinc-900 text-lg font-semibold text-white transition active:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "Prüfe..." : "Anmelden"}
      </button>
    </form>
  );
}
