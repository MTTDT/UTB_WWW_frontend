// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign In</h2>

      {error && <p className="auth-error">{error}</p>}

      <label>
        Username
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign In"}
      </button>

      {onSwitchToRegister && (
        <p className="auth-switch">
          No account?{" "}
          <button type="button" onClick={onSwitchToRegister}>
            Register
          </button>
        </p>
      )}
    </form>
  );
}