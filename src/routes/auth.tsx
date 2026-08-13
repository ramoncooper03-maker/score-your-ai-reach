import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AIeometer" },
      {
        name: "description",
        content: "Sign in or create your AIeometer account to measure your AI visibility.",
      },
      { property: "og:title", content: "Sign in — AIeometer" },
      { property: "og:description", content: "Access your AIeometer dashboard and reports." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) void navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Google sign-in failed. Please try again.");
        return;
      }
      if (result.redirected) return;
      void navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border bg-surface p-12 lg:flex">
        <Wordmark />
        <div className="max-w-md">
          <h1 className="text-3xl font-semibold text-ink">Measurement, not marketing claims</h1>
          <p className="mt-5 text-sm leading-relaxed text-ink-soft">
            Standardized buyer-intent tests across multiple web-grounded AI engines, deterministic
            scoring in code, and the raw evidence retained behind every number.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          AI answers vary. AIeometer reports what standardized tests observed — never a permanent
          ranking.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-sm border-border/80 shadow-card">
          <CardContent className="p-8">
            <div className="lg:hidden">
              <Wordmark />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-ink lg:mt-0">
              {mode === "signin" ? "Sign in" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Access your dashboard and reports."
                : "Start with one business, add more later."}
            </p>

            <Button
              variant="outline"
              className="mt-7 w-full"
              onClick={() => void handleGoogle()}
              disabled={busy}
            >
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Your name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <button
              type="button"
              className="mt-6 w-full text-center text-sm text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
