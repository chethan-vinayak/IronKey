import { isCommonPassword } from "./common-passwords";

export interface PasswordAnalysis {
  score: number; // 0-100
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong" | "Fortress";
  entropy: number; // bits
  crackTime: string;
  checks: {
    length: boolean;
    longLength: boolean;
    lowercase: boolean;
    uppercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommon: boolean;
    noSequential: boolean;
    noRepeats: boolean;
  };
  suggestions: string[];
  isBreached: boolean;
}

const SEQUENTIAL = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

function hasSequential(pw: string): boolean {
  const lower = pw.toLowerCase();
  for (const seq of SEQUENTIAL) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const chunk = seq.slice(i, i + 4);
      if (lower.includes(chunk) || lower.includes(chunk.split("").reverse().join(""))) return true;
    }
  }
  return false;
}

function hasRepeats(pw: string): boolean {
  return /(.)\1{2,}/.test(pw);
}

function calcEntropy(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  if (pool === 0) return 0;
  return +(pw.length * Math.log2(pool)).toFixed(1);
}

function formatTime(seconds: number): string {
  if (seconds < 1) return "instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1e9) return `${(seconds / 31536000 / 1e6).toFixed(1)} million years`;
  return "centuries upon centuries";
}

export function analyzePassword(pw: string): PasswordAnalysis {
  const checks = {
    length: pw.length >= 8,
    longLength: pw.length >= 14,
    lowercase: /[a-z]/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    numbers: /[0-9]/.test(pw),
    symbols: /[^a-zA-Z0-9]/.test(pw),
    noCommon: pw.length > 0 && !isCommonPassword(pw),
    noSequential: pw.length > 0 && !hasSequential(pw),
    noRepeats: pw.length > 0 && !hasRepeats(pw),
  };

  const isBreached = pw.length > 0 && isCommonPassword(pw);
  const entropy = calcEntropy(pw);

  // Score
  let score = 0;
  if (checks.length) score += 10;
  if (checks.longLength) score += 15;
  if (pw.length >= 20) score += 10;
  if (checks.lowercase) score += 8;
  if (checks.uppercase) score += 8;
  if (checks.numbers) score += 8;
  if (checks.symbols) score += 12;
  if (checks.noCommon) score += 12;
  if (checks.noSequential) score += 8;
  if (checks.noRepeats) score += 5;
  score += Math.min(10, Math.floor(entropy / 12));
  if (isBreached) score = Math.min(score, 15);
  score = Math.max(0, Math.min(100, score));

  let label: PasswordAnalysis["label"] = "Very Weak";
  if (score >= 95) label = "Fortress";
  else if (score >= 80) label = "Very Strong";
  else if (score >= 65) label = "Strong";
  else if (score >= 45) label = "Fair";
  else if (score >= 25) label = "Weak";

  // Crack time at 10 billion guesses/sec (modern GPU)
  const guesses = Math.pow(2, entropy);
  const crackTime = isBreached ? "instantly (in breach lists)" : formatTime(guesses / 1e10);

  // Suggestions
  const suggestions: string[] = [];
  if (isBreached) suggestions.push("This password appears in known data breaches — change it immediately.");
  if (!checks.length) suggestions.push("Use at least 8 characters (14+ recommended).");
  else if (!checks.longLength) suggestions.push("Make it longer — aim for 14+ characters for real security.");
  if (!checks.uppercase) suggestions.push("Mix in UPPERCASE letters.");
  if (!checks.lowercase) suggestions.push("Mix in lowercase letters.");
  if (!checks.numbers) suggestions.push("Add some numbers (avoid 1234 or your birth year).");
  if (!checks.symbols) suggestions.push("Add symbols like !@#$%^&* for stronger entropy.");
  if (!checks.noSequential) suggestions.push("Avoid sequential patterns like 'abcd' or '1234'.");
  if (!checks.noRepeats) suggestions.push("Avoid repeated characters like 'aaa' or '111'.");
  if (suggestions.length === 0) suggestions.push("Excellent! Store it in a password manager and never reuse it.");

  return { score, label, entropy, crackTime, checks, suggestions, isBreached };
}

const WORDS = [
  "Falcon","Quartz","Velvet","Nebula","Cipher","Tundra","Mango","Orbit","Phantom","Glacier",
  "Obsidian","Saffron","Voltage","Whisper","Crimson","Lantern","Mosaic","Pioneer","Thunder","Zephyr",
  "Cobalt","Marble","Solstice","Vortex","Harbor","Drift","Echo","Bramble","Comet","Ember"
];
const SYMBOLS = "!@#$%^&*?-_=+";

function rand(n: number): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % n;
  }
  return Math.floor(Math.random() * n);
}

export function generateStrongPassword(length = 18): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*?-_=+";
  let pw = "";
  // Guarantee one of each
  pw += "abcdefghijkmnopqrstuvwxyz"[rand(25)];
  pw += "ABCDEFGHJKLMNPQRSTUVWXYZ"[rand(24)];
  pw += "23456789"[rand(8)];
  pw += SYMBOLS[rand(SYMBOLS.length)];
  for (let i = pw.length; i < length; i++) pw += chars[rand(chars.length)];
  return pw.split("").sort(() => rand(3) - 1).join("");
}

export function generatePassphrase(): string {
  const w1 = WORDS[rand(WORDS.length)];
  const w2 = WORDS[rand(WORDS.length)];
  const w3 = WORDS[rand(WORDS.length)];
  const num = rand(99);
  const sym = SYMBOLS[rand(SYMBOLS.length)];
  return `${w1}-${w2}${sym}${w3}${num}`;
}
