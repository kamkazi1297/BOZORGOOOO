import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FALLBACK_UNIVERSE, filterByMinCap, minCapUsd, looksLikeFallbackUniverse } from "@/lib/market/universe";
import { fetchKlinesCached } from "@/lib/market/klines";
import { clearListedCache } from "@/lib/market/venues";
import { onlyClosedBars, runIndicator } from "@/lib/engine/run";
import { SCAN_RULE, type IndicatorName, type Timeframe, type VenueId } from "@/lib/engine/types";
import {
  clearUniverse,
  getSettings,
  listClosedPositions,
  listEquity,
  listOpenPositions,
  listScanLog,
  listSignals,
  listUniverse,
  patchSettings,
  publicSettings,
  replaceUniverse,
  resetJournal,
  rotateTickToken,
  saveTradeNote,
  seedDemoJournal,
  maybeSeedJournal,
  setScanCursor,
  stats,
} from "./desk.server";
import { lockOperator, lockStatus, requireOperator, setOperatorPin, unlockOperator } from "./lock.server";
import { bookVenue, getAdapter } from "@/lib/exchanges/registry";
import { stringifyLevSizeTiers } from "@/lib/engine/lev-size";
import { accountFrom, clearUniverseCache, overlayLiveSnapshot, refreshUniverse, runTick } from "./tick.server";

export const getDesk = createServerFn({ method: "GET" }).handler(async () => {
  await maybeSeedJournal();
  const lock = await lockStatus();
  const settings = publicSettings(await getSettings(), { unlocked: lock.unlocked });
  const venue = bookVenue(settings.venue);
  let universe = await listUniverse();
  const bookStale =
    !universe.length ||
    !settings.universeVenue ||
    bookVenue(settings.universeVenue) !== venue ||
    looksLikeFallbackUniverse(universe);
  if (bookStale) {
    try {
      universe = (await refreshUniverse(minCapUsd(settings.minMarketCapUsd), venue, true)).map((a) => ({
        symbol: a.symbol,
        base: a.base,
        name: a.name,
        market_cap_usd: a.marketCapUsd,
        volume_24h_usd: a.volume24hUsd,
        max_leverage: a.maxLeverage,
        venue_symbol: a.venueSymbol ?? a.symbol,
      }));
    } catch {
      if (venue === "paper") {
        await replaceUniverse(FALLBACK_UNIVERSE);
        universe = await listUniverse();
      } else {
        try {
          await clearUniverse();
        } catch {
          /* keep whatever is stored; the scan path will refuse a mismatched book */
        }
        universe = [];
      }
    }
  }
  universe = filterByMinCap(universe, minCapUsd(settings.minMarketCapUsd), (a) => Number(a.market_cap_usd));
  const [openRaw, closed, signals, equity, scans, st] = await Promise.all([
    listOpenPositions(),
    listClosedPositions(60),
    listSignals(60),
    listEquity(80),
    listScanLog(24),
    stats(),
  ]);
  const live = await overlayLiveSnapshot(settings, openRaw);
  return {
    settings: live.settings,
    lock,
    open: live.open,
    closed,
    signals,
    equity: equity.reverse(),
    scans,
    universe,
    stats: st,
  };
});

export const tickNow = createServerFn({ method: "POST" })
  .validator(z.object({ forceUniverse: z.boolean().optional(), source: z.string().max(32).optional() }).optional())
  .handler(async ({ data }) => {
    const lock = await lockStatus();
    if (lock.hasPin && !lock.unlocked) {
      throw new Error("Desk is locked. Unlock to run a manual scan.");
    }
    return runTick({ forceUniverse: data?.forceUniverse, source: data?.source ?? "manual" });
  });

export const rotateDeskToken = createServerFn({ method: "POST" }).handler(async () => {
  await requireOperator();
  const row = await rotateTickToken();
  return publicSettings(row, { unlocked: true });
});

export const saveDeskSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({
      mode: z.enum(["paper", "live"]).optional(),
      venue: z.enum(["paper", "hyperliquid", "lighter", "aster", "ourbit"]).optional(),
      risk_pct: z.number().min(0.1).max(5).optional(),
      capital_pct: z.number().min(1).max(100).optional(),
      max_leverage: z.number().int().min(1).max(200).optional(),
      stack_lev_count: z.number().int().min(0).max(20).optional(),
      stack_lev_cap: z.number().int().min(1).max(200).optional(),
      lev_size_tiers: z
        .array(
          z.object({
            leverage: z.number().int().min(1).max(200),
            capitalPct: z.number().min(1).max(100),
          }),
        )
        .max(20)
        .optional(),
      max_positions: z.number().int().min(1).max(20).optional(),
      min_market_cap_usd: z.number().min(0).max(5e12).optional(),
      equity_usd: z.number().positive().optional(),
      starting_equity_usd: z.number().positive().optional(),
      live_enabled: z.number().int().min(0).max(1).optional(),
      bot_enabled: z.number().int().min(0).max(1).optional(),
      paper_24h: z.number().int().min(0).max(1).optional(),
      scan_batch: z.number().int().min(0).max(250).optional(),
      lighter_api_key: z.string().nullable().optional(),
      lighter_api_private_key: z.string().nullable().optional(),
      lighter_account_index: z.number().int().nullable().optional(),
      lighter_api_key_index: z.number().int().nullable().optional(),
      aster_api_key: z.string().nullable().optional(),
      aster_api_secret: z.string().nullable().optional(),
      ourbit_api_key: z.string().nullable().optional(),
      ourbit_api_secret: z.string().nullable().optional(),
      hyperliquid_private_key: z.string().nullable().optional(),
      hyperliquid_wallet_address: z.string().nullable().optional(),
      engine_gates: z.string().max(8000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireOperator();
    if (data.mode === "live" && data.venue === "paper") {
      throw new Error("Paper is simulation only. Pick Hyperliquid, Lighter, Aster, or OURBIT for live fills.");
    }
    const before = await getSettings();
    const { lev_size_tiers, ...rest } = data;
    const patch: typeof rest & { lev_size_tiers?: string } = { ...rest };
    if (lev_size_tiers !== undefined) {
      patch.lev_size_tiers = stringifyLevSizeTiers(lev_size_tiers);
    }
    const inferred: VenueId | undefined = data.venue
      ? data.venue
      : data.hyperliquid_private_key
        ? "hyperliquid"
        : data.lighter_api_private_key
          ? "lighter"
          : data.aster_api_secret
            ? "aster"
            : data.ourbit_api_key && data.ourbit_api_secret
              ? "ourbit"
              : undefined;
    if (inferred) patch.venue = inferred;
    const newKeys = Boolean(
      patch.hyperliquid_private_key ||
        patch.lighter_api_private_key ||
        patch.aster_api_secret ||
        (patch.ourbit_api_key && patch.ourbit_api_secret),
    );
    const row = await patchSettings(patch);
    const venueChanged = Boolean(patch.venue && patch.venue !== before.venue);
    const modeChanged = Boolean(patch.mode && patch.mode !== before.mode);
    const capChanged =
      patch.min_market_cap_usd != null &&
      minCapUsd(patch.min_market_cap_usd) !== minCapUsd(before.min_market_cap_usd);
    if (capChanged) {
      try {
        await setScanCursor(0);
      } catch {
        /* cursor reset is best-effort */
      }
    }
    if (venueChanged || modeChanged || newKeys) {
      const v = bookVenue(row.venue);
      try {
        await setScanCursor(0);
      } catch {
        /* cursor reset is best-effort */
      }
      try {
        clearListedCache(v);
        clearUniverseCache();
        await refreshUniverse(minCapUsd(row.min_market_cap_usd), v, true);
      } catch {
        if (v !== "paper") {
          try {
            await clearUniverse();
          } catch {
            /* next getDesk retries */
          }
        }
      }
    }
    return publicSettings(row, { unlocked: true });
  });

export const setDeskPin = createServerFn({ method: "POST" })
  .validator(z.object({ pin: z.string().min(6).max(64) }))
  .handler(async ({ data }) => {
    return setOperatorPin(data.pin);
  });

export const unlockDesk = createServerFn({ method: "POST" })
  .validator(z.object({ pin: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    return unlockOperator(data.pin);
  });

export const lockDesk = createServerFn({ method: "POST" }).handler(async () => {
  return lockOperator();
});

export const refreshCoins = createServerFn({ method: "POST" }).handler(async () => {
  const lock = await lockStatus();
  if (lock.hasPin && !lock.unlocked) {
    throw new Error("Desk is locked.");
  }
  const s = await getSettings();
  const venue = bookVenue(s.venue);
  clearListedCache(venue);
  clearUniverseCache();
  const assets = await refreshUniverse(minCapUsd(s.min_market_cap_usd), venue, true);
  return { count: assets.length, venue };
});

export const testVenue = createServerFn({ method: "POST" })
  .validator(z.object({ venue: z.enum(["hyperliquid", "lighter", "aster", "ourbit"]) }))
  .handler(async ({ data }) => {
    await requireOperator();
    const settings = await getSettings();
    const adapter = getAdapter(data.venue as VenueId);
    if (!adapter) return { ok: false, message: "No adapter" };
    const res = await adapter.testConnection(accountFrom(settings, data.venue));
    if (res.ok) {
      try {
        await patchSettings({
          venue: data.venue,
        });
      } catch {
        /* venue switch is best-effort; the ping itself succeeded */
      }
      try {
        clearListedCache(data.venue as VenueId);
        clearUniverseCache();
        const assets = await refreshUniverse(minCapUsd(settings.min_market_cap_usd), data.venue as VenueId, true);
        return {
          ok: true,
          message: `${res.message} · ${assets.length} perps from ${adapter.label}`,
        };
      } catch (e) {
        return {
          ok: true,
          message: `${res.message} · book failed (${e instanceof Error ? e.message : "listed markets"})`,
        };
      }
    }
    return res;
  });

export const getJournal = createServerFn({ method: "GET" }).handler(async () => {
  await maybeSeedJournal();
  const lock = await lockStatus();
  const settings = publicSettings(await getSettings(), { unlocked: lock.unlocked });
  const [openRaw, closed, st] = await Promise.all([
    listOpenPositions(),
    listClosedPositions(2000),
    stats(),
  ]);
  const live = await overlayLiveSnapshot(settings, openRaw);
  return { settings: live.settings, lock, open: live.open, closed, stats: st };
});

export const resetDeskJournal = createServerFn({ method: "POST" })
  .validator(z.object({ scope: z.enum(["closed", "paper"]) }))
  .handler(async ({ data }) => {
    const lock = await lockStatus();
    if (lock.hasPin) await requireOperator();
    return resetJournal(data.scope);
  });

export const seedDeskJournal = createServerFn({ method: "POST" }).handler(async () => {
  const lock = await lockStatus();
  if (lock.hasPin) await requireOperator();
  return seedDemoJournal();
});

export const saveDeskTradeNote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), notes: z.string().max(2000) }))
  .handler(async ({ data }) => {
    const lock = await lockStatus();
    if (lock.hasPin) await requireOperator();
    return saveTradeNote(data.id, data.notes);
  });

export const probeBtc = createServerFn({ method: "GET" }).handler(async () => {
  const settings = await getSettings();
  const venue = bookVenue(settings.venue);
  const tf: Timeframe = "15m";
  const raw = await fetchKlinesCached("BTCUSDT", tf, 400, venue);
  const bars = onlyClosedBars(raw, tf);
  const htf = onlyClosedBars(await fetchKlinesCached("BTCUSDT", "1h", 200, venue), "1h");
  const htf2 = onlyClosedBars(await fetchKlinesCached("BTCUSDT", "4h", 120, venue), "4h");
  const engines = [];
  for (const name of SCAN_RULE[tf]) {
    const res = runIndicator(bars, tf, name as IndicatorName, htf, htf2);
    engines.push({
      name,
      count: res.signals.length,
      lastBias: res.lastBias,
      armed: res.armed,
      lastAtr: res.lastAtr,
      lastClose: res.lastClose,
      last: res.signals.slice(-3).map((s) => ({
        side: s.side,
        entry: s.entry,
        sl: s.sl,
        tp: s.tp,
        rr: s.rr,
        barTime: s.barTime,
        reason: s.reason,
      })),
    });
  }
  return {
    symbol: "BTCUSDT",
    tf,
    bars: bars.length,
    lastBar: bars[bars.length - 1]?.time ?? 0,
    engines,
  };
});
