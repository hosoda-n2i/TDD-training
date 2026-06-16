import { describe, it, expect } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("1000 を ¥1,000 に整形する", () => {
    expect(formatPrice(1000)).toBe("¥1,000");
  });

  it("0 を ¥0 に整形する", () => {
    expect(formatPrice(0)).toBe("¥0");
  });

  it("1234567 を ¥1,234,567 に整形する", () => {
    expect(formatPrice(1234567)).toBe("¥1,234,567");
  });

  it("小数 1.6 は四捨五入して ¥2 に整形する", () => {
    expect(formatPrice(1.6)).toBe("¥2");
  });

  it("小数 1.4 は四捨五入して ¥1 に整形する", () => {
    expect(formatPrice(1.4)).toBe("¥1");
  });

  it("負数 -1 は Error を投げる", () => {
    expect(() => formatPrice(-1)).toThrow();
  });

  it("Number.MAX_SAFE_INTEGER を整形する", () => {
    expect(formatPrice(Number.MAX_SAFE_INTEGER)).toBe(
      "¥9,007,199,254,740,991"
    );
  });
});
