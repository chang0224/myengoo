import { useState, useCallback } from 'react';

const PASSCODE = '0224';
const AUTH_KEY = 'myengoo_auth';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === 'true'
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (input === PASSCODE) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        setAuthenticated(true);
      } else {
        setError(true);
        setInput('');
      }
    },
    [input]
  );

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-2 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs rounded-2xl bg-surface p-8 shadow-lg text-center"
      >
        <div className="text-4xl mb-3">📚</div>
        <h1 className="text-lg font-semibold text-text mb-6">단어 외우기</h1>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          // biome-ignore lint/a11y/noAutofocus: password gate needs immediate focus
          autoFocus
          placeholder="암호 4자리"
          value={input}
          onChange={(e) => {
            setError(false);
            setInput(e.target.value);
          }}
          className={`w-full rounded-lg border px-4 py-3 text-center text-xl tracking-[0.3em] outline-none transition
            ${error ? 'border-incorrect shake' : 'border-border focus:border-primary'}`}
        />
        {error && (
          <p className="mt-2 text-sm text-incorrect">암호가 틀렸습니다</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-primary py-3 text-white font-medium hover:bg-primary-hover transition"
        >
          입장
        </button>
      </form>
    </div>
  );
}
