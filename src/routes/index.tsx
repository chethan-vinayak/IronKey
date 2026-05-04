import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Shield, ShieldAlert, ShieldCheck, Copy, RefreshCw, Check, AlertTriangle, Sparkles, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { analyzePassword, generatePassphrase, generateStrongPassword } from "@/lib/password-analyzer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IRONKEY — Password Strength Analyzer" },
      { name: "description", content: "IRONKEY analyzes password strength, checks against breached password lists, and suggests stronger alternatives." },
    ],
  }),
  component: Index,
});

function Index() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setSuggestions([
      generateStrongPassword(18),
      generatePassphrase(),
      generateStrongPassword(24),
    ]);
  }, []);

  const analysis = useMemo(() => analyzePassword(password), [password]);

  const strengthColor = [
    "var(--strength-0)",
    "var(--strength-1)",
    "var(--strength-2)",
    "var(--strength-3)",
    "var(--strength-4)",
  ][Math.min(4, Math.floor(analysis.score / 20))];

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const regenerate = () => {
    setSuggestions([
      generateStrongPassword(18),
      generatePassphrase(),
      generateStrongPassword(24),
    ]);
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--gradient-bg)" }}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-10 text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
          >
            <KeyRound className="h-8 w-8 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-hero)" }}>
              IRONKEY
            </span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Real-time password strength analysis & breach detection
          </p>
        </header>

        {/* Input Card */}
        <Card className="p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            Enter a password to analyze
          </label>
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Type your password..."
              className="h-14 pr-12 font-mono text-base"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Strength Bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {analysis.isBreached ? (
                  <ShieldAlert className="h-4 w-4" style={{ color: strengthColor }} />
                ) : analysis.score >= 65 ? (
                  <ShieldCheck className="h-4 w-4" style={{ color: strengthColor }} />
                ) : (
                  <Shield className="h-4 w-4" style={{ color: strengthColor }} />
                )}
                <span className="text-sm font-semibold" style={{ color: strengthColor }}>
                  {password ? analysis.label : "Awaiting input"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {password ? `${analysis.score}/100` : "—"}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${analysis.score}%`,
                  background: strengthColor,
                  boxShadow: password ? `0 0 12px ${strengthColor}` : "none",
                }}
              />
            </div>
          </div>

          {/* Stats */}
          {password && (
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Length" value={password.length.toString()} />
              <Stat label="Entropy" value={`${analysis.entropy} bits`} />
              <Stat label="Crack time" value={analysis.crackTime} small />
            </div>
          )}

          {/* Breach Warning */}
          {analysis.isBreached && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Found in breach lists</p>
                <p className="text-sm text-muted-foreground">
                  This password appears in the rockyou.txt corpus or other common-password lists. Attackers try these first.
                </p>
              </div>
            </div>
          )}

          {/* Checks */}
          {password && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Security checks</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CheckItem ok={analysis.checks.length} label="At least 8 characters" />
                <CheckItem ok={analysis.checks.longLength} label="14+ characters (recommended)" />
                <CheckItem ok={analysis.checks.uppercase} label="Uppercase letters" />
                <CheckItem ok={analysis.checks.lowercase} label="Lowercase letters" />
                <CheckItem ok={analysis.checks.numbers} label="Numbers" />
                <CheckItem ok={analysis.checks.symbols} label="Symbols" />
                <CheckItem ok={analysis.checks.noCommon} label="Not in breach lists" />
                <CheckItem ok={analysis.checks.noSequential} label="No sequential patterns" />
                <CheckItem ok={analysis.checks.noRepeats} label="No repeated characters" />
              </div>
            </div>
          )}

          {/* Suggestions */}
          {password && analysis.suggestions.length > 0 && (
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Recommendations
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Generator */}
        <Card className="mt-6 p-6 sm:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Strong password suggestions</h2>
              <p className="text-sm text-muted-foreground">Cryptographically generated alternatives</p>
            </div>
            <Button variant="outline" size="sm" onClick={regenerate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </div>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3"
              >
                <code className="flex-1 truncate font-mono text-sm text-foreground">{s}</code>
                <button
                  onClick={() => copy(s)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {copied === s ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </Card>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          All analysis runs locally in your browser. Your password is never sent anywhere.
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-semibold text-foreground ${small ? "text-xs sm:text-sm" : "text-base"}`}>{value}</div>
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
          ok ? "bg-primary/20" : "bg-muted"
        }`}
      >
        {ok ? (
          <Check className="h-3 w-3 text-primary" strokeWidth={3} />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        )}
      </div>
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}
