import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { barsAfterFill, closeFromVenueTrades, netClosePnl, pathExcursion, rebaseStopsFromFill, sizePosition, walkPath } from "./paper.ts";
import type { Bar } from "./types.ts";

function bar(i: number, o: Partial<Bar> = {}): Bar {
  const t0 = Date.UTC(2024, 0, 1);
  return {
    time: t0 + i * 5 * 60_000,
    open: 100,
    high: 100.2,
    low: 99.8,
    close: 100,
    volume: 1,
    ...o,
  };
}

describe("barsAfterFill — wait for the next closed candle", () => {
  it("does not use the signal candle as an exit path", () => {
    const tf = 5 * 60_000;
    const t0 = Date.UTC(2024, 0, 1);
    const signal = bar(0);
    const next = bar(1, { high: 111, close: 110 });
    assert.deepEqual(
      barsAfterFill([signal, next], t0, tf).map((b) => b.time),
      [next.time],
    );
  });
  it("returns empty while the next candle is still forming — leave the trade open", () => {
    const tf = 5 * 60_000;
    const t0 = Date.UTC(2024, 0, 1);
    assert.equal(barsAfterFill([bar(0)], t0, tf).length, 0);
  });
});

describe("walkPath — SL/TP across missed ticks", () => {
  it("closes on an older 5m bar even if the latest bar never tagged SL", () => {
    const bars: Bar[] = [
      bar(0),
      bar(1, { low: 89, high: 100.1, close: 95 }),
      bar(2, { low: 99.5, high: 100.4, close: 100 }),
    ];
    const hit = walkPath({
      side: "long",
      entry: 100,
      sl: 90,
      tp: 110,
      bars,
    });
    assert.equal(hit.hit?.reason, "sl");
    assert.equal(hit.hit?.exit, 90);
    assert.equal(hit.hit?.barTime, bars[1]!.time);
  });

  it("takes the first chronological hit, not the last bar", () => {
    const bars: Bar[] = [
      bar(0, { high: 111, low: 99.9, close: 110 }),
      bar(1, { high: 100.1, low: 89, close: 90 }),
    ];
    const hit = walkPath({
      side: "long",
      entry: 100,
      sl: 90,
      tp: 110,
      bars,
    });
    assert.equal(hit.hit?.reason, "tp");
    assert.equal(hit.hit?.exit, 110);
  });

  it("moves TREX stop to entry after +0.35R then can BE-exit on a later bar", () => {
    const bars: Bar[] = [
      bar(0, { high: 104, low: 100.1, close: 103.5 }),
      bar(1, { high: 103.2, low: 99.9, close: 100 }),
    ];
    const hit = walkPath({
      side: "long",
      entry: 100,
      sl: 90,
      tp: 110,
      bars,
      beAtR: 0.35,
    });
    assert.equal(hit.beMoved, true);
    assert.equal(hit.hit?.reason, "be");
    assert.equal(hit.hit?.exit, 100);
    assert.equal(hit.hit?.barTime, bars[1]!.time);
  });
});

describe("pathExcursion", () => {
  it("tracks MAE against the trade and MFE in favor, in R", () => {
    const bars: Bar[] = [
      bar(0, { low: 98, high: 101, close: 100 }),
      bar(1, { low: 96, high: 108, close: 107 }),
    ];
    const x = pathExcursion({
      side: "long",
      entry: 100,
      origSl: 90,
      bars,
    });
    assert.equal(x.maeR, 0.4);
    assert.equal(x.mfeR, 0.8);
  });
});

describe("rebaseStopsFromFill", () => {
  it("shifts SL/TP by the live fill vs paper entry, keeping distances", () => {
    const out = rebaseStopsFromFill({ paperEntry: 100, fill: 100.5, sl: 98, tp: 104 });
    assert.equal(out.sl, 98.5);
    assert.equal(out.tp, 104.5);
  });

  it("leaves SL/TP alone when fill is missing", () => {
    const out = rebaseStopsFromFill({ paperEntry: 100, fill: 0, sl: 98, tp: 104 });
    assert.equal(out.sl, 98);
    assert.equal(out.tp, 104);
  });
});

describe("closeFromVenueTrades", () => {
  it("uses venue closing fills for exit VWAP and realized PnL minus fees", () => {
    const openedAt = Date.UTC(2024, 0, 1, 12);
    const hit = closeFromVenueTrades({
      side: "long",
      entry: 100,
      openedAt,
      trades: [
        { time: openedAt, side: "BUY", price: 100.4, qty: 1, realizedPnl: 0, commission: -0.04 },
        { time: openedAt + 60_000, side: "SELL", price: 104, qty: 1, realizedPnl: 3.6, commission: -0.04 },
      ],
    });
    assert.ok(hit);
    assert.equal(hit!.exit, 104);
    assert.equal(Number(hit!.pnl.toFixed(4)), 3.52);
    assert.equal(Number(hit!.fees.toFixed(4)), 0.08);
  });

  it("falls back to gross minus actual commissions when the venue omits realized PnL", () => {
    const openedAt = Date.UTC(2024, 0, 1, 12);
    const hit = closeFromVenueTrades({
      side: "long",
      entry: 100,
      openedAt,
      trades: [
        { time: openedAt, side: "BUY", price: 100, qty: 2, realizedPnl: 0, commission: 0.08 },
        { time: openedAt + 60_000, side: "SELL", price: 110, qty: 2, realizedPnl: 0, commission: 0.088 },
      ],
    });
    assert.ok(hit);
    assert.equal(hit!.exit, 110);
    assert.equal(Number(hit!.fees.toFixed(4)), 0.168);
    assert.equal(Number(hit!.pnl.toFixed(4)), 20 - 0.168);
  });
});

describe("sizePosition — margin % × coin leverage", () => {
  it("5x at 15% matches 25x at 3% notional on $10k", () => {
    const low = sizePosition({ equity: 10_000, capitalPct: 15, entry: 100, sl: 98, leverage: 5 });
    const high = sizePosition({ equity: 10_000, capitalPct: 3, entry: 100, sl: 98, leverage: 25 });
    assert.ok(low && high);
    assert.equal(low.margin, 1500);
    assert.equal(high.margin, 300);
    assert.equal(low.notional, 7500);
    assert.equal(high.notional, 7500);
    assert.equal(low.qty, 75);
    assert.equal(high.qty, 75);
  });

  it("10x at 12% and 25x at 6% size to the configured notional", () => {
    const ten = sizePosition({ equity: 10_000, capitalPct: 12, entry: 50, sl: 49, leverage: 10 });
    const twentyFive = sizePosition({ equity: 10_000, capitalPct: 6, entry: 50, sl: 49, leverage: 25 });
    assert.ok(ten && twentyFive);
    assert.equal(ten.notional, 12_000);
    assert.equal(twentyFive.notional, 15_000);
  });

  it("sizes each fill as a percent of remaining free capital, not total equity", () => {
    const first = sizePosition({ equity: 10_000, capitalPct: 3, entry: 100, sl: 98, leverage: 25, capitalBase: "free" });
    assert.ok(first);
    assert.equal(first.margin, 300);

    const second = sizePosition({
      equity: 10_000,
      capitalPct: 15,
      entry: 50,
      sl: 49,
      leverage: 5,
      usedMargin: first.margin,
      capitalBase: "free",
    });
    assert.ok(second);
    assert.equal(second.margin, (10_000 - 300) * 0.15);
    assert.equal(second.notional, second.margin * 5);
  });

  it("from total equity keeps 15% of the whole account on the second fill", () => {
    const first = sizePosition({ equity: 10_000, capitalPct: 3, entry: 100, sl: 98, leverage: 25, capitalBase: "total" });
    assert.ok(first);
    assert.equal(first.margin, 300);

    const second = sizePosition({
      equity: 10_000,
      capitalPct: 15,
      entry: 50,
      sl: 49,
      leverage: 5,
      usedMargin: first.margin,
      capitalBase: "total",
    });
    assert.ok(second);
    assert.equal(second.margin, 1500);
  });

  it("uses the live available pile and ignores locked margin", () => {
    const sized = sizePosition({
      equity: 10_000,
      capitalPct: 15,
      entry: 100,
      sl: 98,
      leverage: 5,
      usedMargin: 9000,
      available: 850,
      capitalBase: "free",
    });
    assert.ok(sized);
    assert.equal(sized.margin, 850 * 0.15);
  });

  it("from total still never spends more than free cash", () => {
    const sized = sizePosition({
      equity: 10_000,
      capitalPct: 15,
      entry: 100,
      sl: 98,
      leverage: 5,
      usedMargin: 9200,
      capitalBase: "total",
    });
    assert.ok(sized);
    assert.equal(Number(sized.margin.toFixed(6)), 800 * 0.995);
  });

  it("sizes a leftover free pile instead of refusing the fill", () => {
    const sized = sizePosition({
      equity: 10_000,
      capitalPct: 15,
      entry: 100,
      sl: 98,
      leverage: 5,
      usedMargin: 9200,
      capitalBase: "free",
    });
    assert.ok(sized);
    assert.equal(Number(sized.margin.toFixed(6)), 120);
  });

  it("refuses when nothing is free", () => {
    const sized = sizePosition({
      equity: 10_000,
      capitalPct: 15,
      entry: 100,
      sl: 98,
      leverage: 5,
      usedMargin: 10_000,
    });
    assert.equal(sized, null);
  });
});

describe("netClosePnl — journal writes net dollars after round-trip fees", () => {
  it("subtracts open + close commission from gross and stores net R", () => {
    const openFee = (100 * 1 * 4) / 10000;
    const closeFee = (110 * 1 * 4) / 10000;
    const settled = netClosePnl({
      side: "long",
      entry: 100,
      exit: 110,
      qty: 1,
      riskUsd: 10,
      openFee,
    });
    assert.equal(Number(settled.fees.toFixed(6)), Number((openFee + closeFee).toFixed(6)));
    assert.equal(Number(settled.pnl.toFixed(6)), Number((10 - openFee - closeFee).toFixed(6)));
    assert.equal(settled.pnlR, settled.pnl / 10);
  });
});
