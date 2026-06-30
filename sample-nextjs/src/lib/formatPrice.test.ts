import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("1000 を ¥1,000 に整形する", () => {
    // @covers REQ-001
    expect(formatPrice(1000)).toBe("¥1,000");
  });

  it("0 を ¥0 に整形する", () => {
    // @covers REQ-002
    expect(formatPrice(0)).toBe("¥0");
  });

  it("1234567 を ¥1,234,567 に整形する", () => {
    // @covers REQ-001
    expect(formatPrice(1234567)).toBe("¥1,234,567");
  });

  it("小数 1.6 は四捨五入して ¥2 に整形する", () => {
    // @covers REQ-003
    expect(formatPrice(1.6)).toBe("¥2");
  });

  it("小数 1.4 は四捨五入して ¥1 に整形する", () => {
    // @covers REQ-003
    expect(formatPrice(1.4)).toBe("¥1");
  });

  it("負数 -1 は Error を投げる", () => {
    // @covers REQ-004
    expect(() => formatPrice(-1)).toThrow();
  });

  it("負数のエラーは理由（0以上）を伝えるメッセージを持つ", () => {
    // @covers REQ-004 — /harden で見つかった生存ミュータント（メッセージ→""）を kill
    expect(() => formatPrice(-1)).toThrow(/0以上/);
  });

  it("NaN は Error を投げる", () => {
    // @covers REQ-006 — /adversary が指摘した silent failure（¥NaN）への回帰テスト
    expect(() => formatPrice(NaN)).toThrow();
  });

  it("Infinity / -Infinity は Error を投げる", () => {
    // @covers REQ-006
    expect(() => formatPrice(Infinity)).toThrow();
    expect(() => formatPrice(-Infinity)).toThrow();
  });

  it("Number.MAX_SAFE_INTEGER を整形する", () => {
    // @covers REQ-001
    expect(formatPrice(Number.MAX_SAFE_INTEGER)).toBe("¥9,007,199,254,740,991");
  });
});

// VDD: property-based（/harden 由来）。個別例でなく入力空間全体で成り立つ不変条件を検証する。
describe("formatPrice (property-based)", () => {
  it("非負の入力は ¥ + 数字とカンマだけの文字列になる（出力ドメイン）", () => {
    // @covers REQ-001
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: Number.MAX_SAFE_INTEGER, noNaN: true }),
        (x) => {
          expect(formatPrice(x)).toMatch(/^¥[\d,]+$/);
        },
      ),
    );
  });

  it("非負整数はカンマ/¥ を除けば元の数値に戻る（roundtrip）", () => {
    // @covers REQ-001
    fc.assert(
      fc.property(fc.nat(), (n) => {
        const formatted = formatPrice(n);
        expect(Number(formatted.replace(/[¥,]/g, ""))).toBe(n);
      }),
    );
  });

  it("整形後の数値は入力を四捨五入した整数に等しい（REQ-003）", () => {
    // @covers REQ-003
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: Number.MAX_SAFE_INTEGER, noNaN: true }),
        (x) => {
          const formatted = formatPrice(x);
          expect(Number(formatted.replace(/[¥,]/g, ""))).toBe(Math.round(x));
        },
      ),
    );
  });

  it("負数は必ず Error を投げる（REQ-004）", () => {
    // @covers REQ-004
    fc.assert(
      fc.property(
        fc.double({
          min: -Number.MAX_SAFE_INTEGER,
          max: -Number.MIN_VALUE,
          noNaN: true,
        }),
        (x) => {
          expect(() => formatPrice(x)).toThrow();
        },
      ),
    );
  });

  it("非有限値（NaN / ±Infinity）は必ず Error を投げる（REQ-006）", () => {
    // @covers REQ-006 — noNaN レンジの property が踏まない入力クラスを明示的に踏む
    fc.assert(
      fc.property(fc.constantFrom(NaN, Infinity, -Infinity), (x) => {
        expect(() => formatPrice(x)).toThrow();
      }),
    );
  });
});
