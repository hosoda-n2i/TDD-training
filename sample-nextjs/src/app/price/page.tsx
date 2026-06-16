"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatPrice";

export default function PricePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value === "") {
      setResult(null);
      setError(null);
      return;
    }
    const num = Number(value);
    try {
      setResult(formatPrice(num));
      setError(null);
    } catch {
      setError("0以上の整数を入力してください");
      setResult(null);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-semibold">金額整形</h1>
      <label className="flex flex-col gap-2 w-full max-w-xs">
        <span>金額（円）</span>
        <input
          type="number"
          aria-label="金額"
          value={input}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="例: 1234567"
        />
      </label>
      {result !== null && (
        <p className="text-2xl font-bold">{result}</p>
      )}
      {error !== null && (
        <p className="text-red-600">{error}</p>
      )}
    </main>
  );
}
