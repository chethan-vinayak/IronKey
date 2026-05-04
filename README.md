# 🔐 IRONKEY — Password Strength Analyzer

A sleek, privacy-first tool that evaluates the strength of user-entered passwords in real time, checks them against famous breach lists (rockyou.txt-style corpus), and suggests cryptographically strong alternatives.

> **All analysis runs locally in your browser. Your password is never sent over the network.**

---

## ✨ Features

- **Real-time strength scoring (0–100)** with six tiers: Very Weak → Fortress
- **Entropy calculation** in bits, based on character pool size and length
- **Crack-time estimation** assuming a modern attacker at 10 billion guesses/sec
- **Breach detection** against a curated set of the most common passwords from `rockyou.txt` and other leak corpora
- **9 security checks**:
  - Minimum length (8) and recommended length (14+)
  - Uppercase, lowercase, numbers, and symbols
  - Not in known breach lists
  - No sequential patterns (`abcd`, `1234`, `qwerty`)
  - No repeated characters (`aaa`, `111`)
- **Smart recommendations** tailored to what your password is missing
- **Strong password generator** — produces both random passwords and human-friendly passphrases using `crypto.getRandomValues()`
- **Copy-to-clipboard** for instant use
- **Show/hide password** toggle
- **Modern dark UI** with gradient accents, glow effects, and smooth animations

---

## 🧠 What You'll Learn

This project demonstrates several core concepts in **password security and basic cryptography**:

| Concept | How IRONKEY uses it |
|---|---|
| **Shannon entropy** | `bits = length × log₂(poolSize)` — measures unpredictability |
| **Brute-force economics** | Crack time = `2^entropy / guesses-per-second` |
| **Breach corpora** | Why attackers always try `rockyou.txt` first |
| **Pattern weakness** | Why `Password1!` is weak despite passing complexity rules |
| **CSPRNG** | `crypto.getRandomValues()` vs. `Math.random()` for generating secrets |
| **Passphrases** | Why `Falcon-Quartz!Nebula42` beats `X#9k!` for both security and usability |

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + SSR)
- **Build tool**: Vite 7
- **Styling**: Tailwind CSS v4 with semantic design tokens (`oklch` color space)
- **UI primitives**: shadcn/ui + Radix
- **Icons**: lucide-react
- **Language**: TypeScript (strict mode)
- **Runtime**: Cloudflare Workers (edge-ready)

---

## 📁 Project Structure

```
ironkey/
├── src/
│   ├── routes/
│   │   ├── __root.tsx           # Root layout (HTML shell, meta tags)
│   │   └── index.tsx            # Main IRONKEY UI
│   ├── lib/
│   │   ├── password-analyzer.ts # Scoring, entropy, generators
│   │   ├── common-passwords.ts  # rockyou-style breach list
│   │   └── utils.ts
│   ├── components/ui/           # shadcn UI components
│   ├── styles.css               # Design system (colors, gradients, shadows)
│   └── router.tsx
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20+

### Install & Run

```bash
# Clone
git clone https://github.com/<your-username>/ironkey.git
cd ironkey

# Install dependencies
bun install

# Start dev server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
bun run build
```

---

## 🔬 How the Scoring Works

The score (0–100) is composed from weighted signals:

| Signal | Weight |
|---|---|
| Length ≥ 8 | +10 |
| Length ≥ 14 | +15 |
| Length ≥ 20 | +10 |
| Lowercase / Uppercase / Numbers | +8 each |
| Symbols | +12 |
| Not in breach list | +12 |
| No sequential pattern | +8 |
| No repeats | +5 |
| Entropy bonus | up to +10 |

If the password is found in the breach list, the score is **capped at 15** regardless of complexity — because attackers will guess it instantly.

### Strength Tiers

| Score | Label |
|---|---|
| 95–100 | 🛡️ Fortress |
| 80–94 | Very Strong |
| 65–79 | Strong |
| 45–64 | Fair |
| 25–44 | Weak |
| 0–24 | Very Weak |

---

## 🔒 Privacy

IRONKEY is **100% client-side**. There is no backend, no API call, no logging.
Your password never leaves your browser tab.

---

## 🧩 Possible Extensions

- Integrate with the [HaveIBeenPwned k-anonymity API](https://haveibeenpwned.com/API/v3#PwnedPasswords) for live breach checking (only the first 5 chars of the SHA-1 hash leave the device)
- Load the **full** rockyou.txt (~14M lines) via a Bloom filter for compact in-browser lookups
- Add password history tracking with Lovable Cloud to prevent reuse
- Export an exportable security audit (PDF) for a list of accounts

---

## 📜 License

MIT — free to use, modify, and learn from.

---

## 🙌 Credits

Built with [Lovable](https://lovable.dev). Inspired by zxcvbn, NIST SP 800-63B password guidelines, and the eternal lessons of the rockyou.txt leak.
