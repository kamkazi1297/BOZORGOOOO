import { a as TF_MS, c as isApexName, d as isShetexName, f as isTrexName, i as SCAN_RULE, l as isHalcyonName, n as HTF2_OF, o as apexProfile, r as HTF_OF, t as ALL_INDICATORS, u as isKetexName } from "./types-MiIsfLYT.mjs";
import { n as getAddress, t as privateKeyToAccount } from "../_libs/viem.mjs";
import { i as HttpTransport, n as formatSize, r as ExchangeClient, t as formatPrice } from "../_libs/@nktkas/hyperliquid+[...].mjs";
import { createRequire } from "node:module";
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
//#region node_modules/.nitro/vite/services/ssr/assets/tick.server-CbcdAWH0.js
var VENUE_META = [
	{
		id: "paper",
		label: "Paper",
		kind: "sim",
		blurbFa: "کاغذی. جهان ارز، اهرم و چارت از پرپچوال‌های زندهٔ آستر — بدون کلید.",
		blurbEn: "Simulated fills. Universe, leverage and charts from live Aster perps. No keys.",
		docs: ""
	},
	{
		id: "aster",
		label: "Aster",
		kind: "dex",
		blurbFa: "پرپچوال غیرمتمرکز. آدرس کیف API + کلید خصوصی. فقط ارزهای لیست‌شده روی آستر، روی چارت آستر.",
		blurbEn: "Perp DEX. API wallet address + private key. Only Aster-listed perps, scanned on Aster candles.",
		docs: "https://www.asterdex.com/en/api-wallet"
	},
	{
		id: "hyperliquid",
		label: "Hyperliquid",
		kind: "dex",
		blurbFa: "پرپچوال آن‌چین. بعد از وصل، لیست ارز و چارت از خود هایپرلیکوئید است. کلید ایجنت + آدرس اصلی.",
		blurbEn: "On-chain perps. After connect, listed coins and charts come from Hyperliquid itself. Agent key + master address.",
		docs: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api"
	},
	{
		id: "lighter",
		label: "Lighter",
		kind: "dex",
		blurbFa: "صرافی zk. لیست بازار و کندل از خود لایتر. کلید API + ایندکس حساب.",
		blurbEn: "zk DEX. Markets and candles from Lighter itself. API key + account index.",
		docs: "https://apidocs.lighter.xyz/docs/get-started"
	},
	{
		id: "ourbit",
		label: "OURBIT",
		kind: "cex",
		blurbFa: "صرافی متمرکز USDT-M. جهان ارز، اهرم و چارت از خود اوربیت. API Key + Secret.",
		blurbEn: "Centralized USDT-M. Universe, leverage and charts from OURBIT itself. API key + secret.",
		docs: "https://www.ourbit.com/support/articles/17827791513175"
	}
];
var STABLES = /* @__PURE__ */ new Set([
	"USDT",
	"USDC",
	"DAI",
	"FDUSD",
	"USDE",
	"USDS",
	"BUSD",
	"TUSD",
	"PYUSD"
]);
var FALLBACK_BASES = [
	"BTC",
	"ETH",
	"BNB",
	"SOL",
	"XRP",
	"DOGE",
	"ADA",
	"TRX",
	"AVAX",
	"LINK"
];
/** True when the stored book is the 10-coin emergency list, not a live venue book. */
function looksLikeFallbackUniverse(rows) {
	if (rows.length !== FALLBACK_BASES.length) return false;
	const want = new Set(FALLBACK_BASES);
	return rows.every((r) => want.has(r.base.toUpperCase()));
}
function coinOf(symbol) {
	return symbol.replace(/USDT|USDC|-SWAP-|-PERP/gi, "").replace(/[-_/]/g, "").toUpperCase();
}
/** Base coin if this row is a tradeable perp on a USDT-margined book. Empty string = skip. */
function isTradeableBase(raw) {
	const base = coinOf(raw) || raw.toUpperCase().replace(/[^A-Z0-9:]/g, "");
	if (!base || base.length < 2 || base.length > 16) return "";
	if (STABLES.has(base)) return "";
	if (base.includes(":")) return "";
	return base;
}
/** How that venue names the perp on its own book / chart. */
function nativeSymbol(venue, symbolOrBase) {
	const base = coinOf(symbolOrBase);
	if (venue === "ourbit") return `${base}_USDT`;
	if (venue === "hyperliquid" || venue === "lighter") return base;
	return `${base}USDT`;
}
function chartHostLabel(venue) {
	if (venue === "paper") return "Aster";
	if (venue === "hyperliquid") return "Hyperliquid";
	if (venue === "lighter") return "Lighter";
	if (venue === "aster") return "Aster";
	return "OURBIT";
}
/** Book + candles follow the selected venue even in paper mode. Live only gates real orders. */
function bookVenue(venue) {
	if (venue === "toobit") return "ourbit";
	if (venue === "hyperliquid" || venue === "lighter" || venue === "aster" || venue === "ourbit" || venue === "paper") return venue;
	return "paper";
}
function venueLabel(venue) {
	const id = bookVenue(venue);
	return VENUE_META.find((v) => v.id === id)?.label ?? id;
}
var HOSTS = ["https://fapi.asterdex.com"];
var TF_MAP = {
	"5m": "5m",
	"15m": "15m",
	"1h": "1h",
	"4h": "4h",
	"1d": "1d",
	"1w": "1w"
};
function toBar(k) {
	return {
		time: k[0],
		open: Number(k[1]),
		high: Number(k[2]),
		low: Number(k[3]),
		close: Number(k[4]),
		volume: Number(k[5])
	};
}
async function getJson$1(url) {
	let lastErr = null;
	for (let i = 0; i < 3; i++) {
		const res = await fetch(url, { headers: { Accept: "application/json" } });
		if (res.status === 429 || res.status === 418) {
			lastErr = /* @__PURE__ */ new Error(`kline ${res.status}`);
			await new Promise((r) => setTimeout(r, 350 * (i + 1)));
			continue;
		}
		if (!res.ok) throw new Error(`kline ${res.status}`);
		return res.json();
	}
	throw lastErr ?? /* @__PURE__ */ new Error("kline 429");
}
async function fetchKlines(symbol, tf, limit = 500, endTime) {
	const interval = TF_MAP[tf];
	const q = new URLSearchParams({
		symbol,
		interval,
		limit: String(Math.min(1500, limit))
	});
	if (endTime) q.set("endTime", String(endTime));
	let lastErr;
	for (const host of HOSTS) try {
		const rows = await getJson$1(`${host}/fapi/v1/klines?${q}`);
		if (Array.isArray(rows) && rows.length) return rows.map(toBar);
	} catch (err) {
		lastErr = err;
	}
	throw lastErr instanceof Error ? lastErr : /* @__PURE__ */ new Error("no kline source");
}
async function fetchLastPrice(symbol) {
	for (const host of HOSTS) try {
		const t = await getJson$1(`${host}/fapi/v1/ticker/price?symbol=${symbol}`);
		const n = Number(t.price);
		if (Number.isFinite(n)) return n;
	} catch {}
	const bars = await fetchKlines(symbol, "5m", 1);
	return bars[bars.length - 1]?.close ?? NaN;
}
function defaultMaxLeverage(symbol) {
	const s = symbol.replace(/USDT|USDC/g, "");
	if (s === "BTC") return 125;
	if (s === "ETH") return 100;
	if ([
		"BNB",
		"SOL",
		"XRP",
		"DOGE",
		"ADA"
	].includes(s)) return 75;
	if ([
		"AVAX",
		"LINK",
		"DOT",
		"LTC",
		"BCH",
		"UNI",
		"SUI",
		"NEAR",
		"APT"
	].includes(s)) return 50;
	return 25;
}
function capLeverage(n, fallback = 25) {
	const v = Math.round(Number(n));
	if (!Number.isFinite(v) || v < 1) return Math.min(200, Math.max(1, fallback));
	return Math.min(200, Math.max(1, v));
}
/**
* If `count` open trades already have leverage > `cap`, new fills use `cap`
* as the user ceiling (still never above `userCap`). Count 0 disables.
*/
function stackedUserLevCap(userCap, openLevs, count, cap) {
	const user = capLeverage(userCap, 200);
	const n = Math.round(Number(count));
	if (!Number.isFinite(n) || n <= 0) return user;
	const stacked = Math.min(user, capLeverage(cap, 75));
	let high = 0;
	for (const lev of openLevs) if (Number(lev) > stacked) {
		high += 1;
		if (high >= n) return stacked;
	}
	return user;
}
var BASE$2 = "https://mainnet.zklighter.elliot.ai";
function wasmPaths() {
	const candidates = [
		join(process.cwd(), "wasm"),
		join(process.cwd(), "node_modules/lighter-ts-sdk"),
		join(process.cwd(), "lighter-wasm")
	];
	try {
		const require = createRequire(import.meta.url);
		let dir = dirname(require.resolve("lighter-ts-sdk"));
		for (let i = 0; i < 8; i++) {
			candidates.push(dir);
			dir = dirname(dir);
		}
	} catch {}
	for (const root of candidates) {
		const nested = join(root, "wasm/lighter-signer.wasm");
		const nestedExec = join(root, "wasm/wasm_exec.js");
		if (existsSync(nested) && existsSync(nestedExec)) return {
			wasmPath: nested,
			wasmExecPath: nestedExec
		};
		const flat = join(root, "lighter-signer.wasm");
		const flatExec = join(root, "wasm_exec.js");
		if (existsSync(flat) && existsSync(flatExec)) return {
			wasmPath: flat,
			wasmExecPath: flatExec
		};
	}
	throw new Error("Lighter WASM signer files were not found next to lighter-ts-sdk.");
}
var marketsCache = null;
async function fetchLighterMarkets() {
	const now = Date.now();
	if (marketsCache && now - marketsCache.at < 6e5 && marketsCache.rows.length) return marketsCache.rows;
	try {
		const res = await fetch(`${BASE$2}/api/v1/orderBookDetails`);
		if (!res.ok) throw new Error("lighter markets");
		const json = await res.json();
		const mapped = (Array.isArray(json) ? json : json.order_book_details ?? []).map((r) => {
			const raw = (r.symbol ?? "").toUpperCase().replace(/[-_/]/g, "");
			const coin = raw.replace(/USDT|USD$/, "");
			const symbol = raw.endsWith("USDT") || raw.endsWith("USD") ? `${coin}USDT` : `${raw}USDT`;
			const minImf = Number(r.min_initial_margin_fraction ?? 0);
			const defImf = Number(r.default_initial_margin_fraction ?? 0);
			const fromMin = minImf > 0 ? Math.max(1, Math.round(1e4 / minImf)) : 0;
			const fromDef = defImf > 0 ? Math.max(1, Math.round(1e4 / defImf)) : 0;
			return {
				symbol,
				coin,
				marketIndex: Number(r.market_id ?? r.market_index),
				maxLeverage: capLeverage(Number(r.max_leverage ?? 0) || fromMin || fromDef || 25),
				sizeDecimals: Number(r.size_decimals ?? 4),
				priceDecimals: Number(r.price_decimals ?? 2),
				minBase: Number(r.min_base_amount ?? 0),
				lastPrice: Number(r.last_trade_price ?? 0),
				status: String(r.status ?? "active").toLowerCase(),
				volume24hUsd: Number(r.daily_quote_token_volume ?? 0) || 0
			};
		}).filter((r) => r.coin.length >= 2 && Number.isFinite(r.marketIndex));
		if (mapped.length) marketsCache = {
			at: now,
			rows: mapped
		};
		return mapped.length ? mapped : marketsCache?.rows ?? [];
	} catch {
		return marketsCache?.rows ?? [];
	}
}
function scale(n, decimals) {
	return Math.max(1, Math.round(n * 10 ** decimals));
}
function marketOf(markets, symbol) {
	const coin = coinOf(symbol);
	return markets.find((m) => m.coin === coin || m.symbol === symbol.toUpperCase()) ?? null;
}
/** Snapshot of live order indexes on one market. null if the public read fails. */
async function listActiveOrderIndexes(account, marketIndex) {
	if (account.accountIndex == null) return null;
	try {
		const q = new URLSearchParams({
			account_index: String(account.accountIndex),
			market_id: String(marketIndex)
		});
		const res = await fetch(`${BASE$2}/api/v1/accountActiveOrders?${q}`);
		if (!res.ok) return null;
		const json = await res.json();
		const orders = Array.isArray(json) ? json : json.orders ?? [];
		const ids = [];
		for (const o of orders) {
			if (Number(o.market_index ?? o.market_id ?? o.marketIndex ?? marketIndex) !== marketIndex) continue;
			const idx = Number(o.order_index ?? o.orderIndex);
			if (Number.isFinite(idx) && idx > 0) ids.push(idx);
		}
		return ids;
	} catch {
		return null;
	}
}
async function withSigner(account, fn) {
	if (!account.privateKey) throw new Error("Lighter API private key missing");
	if (account.accountIndex == null) throw new Error("Lighter account index missing");
	const { SignerClient } = await import("../_libs/lighter-ts-sdk.mjs").then((n) => n.t);
	const wasm = wasmPaths();
	const client = new SignerClient({
		url: BASE$2,
		network: "mainnet",
		privateKey: account.privateKey.trim(),
		accountIndex: account.accountIndex,
		apiKeyIndex: account.apiKeyIndex ?? 2,
		wasmConfig: wasm,
		enableWebSocket: false,
		enableBatching: false
	});
	try {
		await client.initialize();
		await client.ensureWasmClient();
		return await fn(client);
	} finally {
		try {
			await client.close();
		} catch {}
	}
}
async function accountQuery(account) {
	const q = account.accountIndex != null ? `by=index&value=${account.accountIndex}` : account.apiKey ? `by=l1_address&value=${account.apiKey}` : null;
	if (!q) return null;
	const res = await fetch(`${BASE$2}/api/v1/account?${q}`);
	if (!res.ok) return null;
	return await res.json();
}
var lighterAdapter = {
	id: "lighter",
	label: "Lighter",
	kind: "dex",
	docs: "https://apidocs.lighter.xyz/docs/get-started",
	symbolOf: (base) => base,
	async listMarkets() {
		const rows = await fetchLighterMarkets();
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		for (const r of rows) {
			if (r.status && r.status !== "active") continue;
			const base = isTradeableBase(r.coin);
			if (!base || seen.has(base)) continue;
			seen.add(base);
			out.push({
				base,
				symbol: `${base}USDT`,
				venueSymbol: nativeSymbol("lighter", base),
				volume24hUsd: r.volume24hUsd,
				maxLeverage: r.maxLeverage
			});
		}
		return out;
	},
	async fetchMaxLeverage(symbol) {
		return capLeverage(marketOf(await fetchLighterMarkets(), symbol)?.maxLeverage || defaultMaxLeverage(symbol));
	},
	async fetchWallet(account) {
		if (!account.apiKey && account.accountIndex == null) return null;
		try {
			const json = await accountQuery(account);
			if (!json) return null;
			const acc = json.accounts?.[0] ?? json;
			const available = Number(acc.available_balance ?? acc.collateral ?? 0);
			const equity = Number(acc.collateral ?? acc.available_balance ?? 0);
			if (!Number.isFinite(available) && !Number.isFinite(equity)) return null;
			const a = Number.isFinite(available) ? Math.max(0, available) : 0;
			return {
				equity: Number.isFinite(equity) ? Math.max(0, equity) : a,
				available: a
			};
		} catch {
			return null;
		}
	},
	async fetchBalance(account) {
		return (this.fetchWallet ? await this.fetchWallet(account) : null)?.available ?? null;
	},
	async placeOrder(account, order) {
		try {
			const mkt = marketOf(await fetchLighterMarkets(), order.symbol);
			if (!mkt) return {
				ok: false,
				message: `Lighter has no market for ${order.symbol}`
			};
			if (mkt.minBase > 0 && order.qty < mkt.minBase) return {
				ok: false,
				message: `Lighter min size is ${mkt.minBase} ${mkt.coin}`
			};
			const qty = scale(order.qty, mkt.sizeDecimals);
			const sl = scale(order.sl, mkt.priceDecimals);
			const tp = scale(order.tp, mkt.priceDecimals);
			const isAsk = order.side === "short";
			const hash = await withSigner(account, async (client) => {
				try {
					await client.updateLeverage(mkt.marketIndex, 0, capLeverage(Math.min(order.leverage, mkt.maxLeverage)));
				} catch {}
				let ideal = 0;
				try {
					ideal = await client.getBestPrice(mkt.marketIndex, isAsk);
				} catch {
					ideal = mkt.lastPrice ? scale(mkt.lastPrice, mkt.priceDecimals) : 0;
				}
				const otoco = await client.createOtocoOrder({
					mainOrder: {
						marketIndex: mkt.marketIndex,
						baseAmount: qty,
						isAsk,
						orderType: 1,
						clientOrderIndex: Date.now() % 1e9,
						avgExecutionPrice: ideal || void 0,
						idealPrice: ideal || void 0,
						maxSlippage: .012
					},
					stopLoss: {
						triggerPrice: sl,
						isLimit: false
					},
					takeProfit: {
						triggerPrice: tp,
						isLimit: false
					}
				});
				if (otoco.error) throw new Error(otoco.error);
				if (!otoco.hash) throw new Error("Lighter OTOCO did not confirm — no order sent");
				return otoco.hash;
			});
			let pos;
			let readFailed = false;
			for (let i = 0; i < 4; i++) {
				if (i) await new Promise((r) => setTimeout(r, 350));
				try {
					pos = (await this.fetchPositions(account)).find((p) => coinOf(p.symbol) === mkt.coin);
					readFailed = false;
					if (pos?.qty) break;
				} catch {
					readFailed = true;
				}
			}
			if (readFailed && !pos?.qty) try {
				const closed = await this.closePosition(account, order.symbol);
				if (closed.ok || closed.message === "flat") return {
					ok: false,
					orderId: hash,
					message: "Lighter fill unconfirmed — flattened, no unprotected position left"
				};
				return {
					ok: false,
					liveOpen: true,
					orderId: hash,
					message: `Lighter fill unconfirmed — flatten failed (${closed.message})`
				};
			} catch (err) {
				return {
					ok: false,
					liveOpen: true,
					orderId: hash,
					message: `Lighter fill unconfirmed — flatten failed (${err instanceof Error ? err.message : "close threw"})`
				};
			}
			if (!pos?.qty) return {
				ok: false,
				orderId: hash,
				message: "Lighter OTOCO did not fill"
			};
			let prot = {
				onVenue: true,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
			for (let i = 0; i < 3; i++) {
				prot = await this.fetchProtection(account, {
					symbol: order.symbol,
					sl: order.sl,
					tp: order.tp
				});
				if (!prot.unknown && prot.hasSl && prot.hasTp) break;
				if (i < 2) await new Promise((r) => setTimeout(r, 350));
			}
			if (prot.unknown || !prot.hasSl || !prot.hasTp) {
				const missing = prot.unknown ? "SL/TP unconfirmed" : [!prot.hasSl && "SL", !prot.hasTp && "TP"].filter(Boolean).join("+") + " missing";
				try {
					const closed = await this.closePosition(account, order.symbol);
					if (closed.ok || closed.message === "flat") return {
						ok: false,
						orderId: hash,
						message: `Lighter filled but ${missing} — flattened, no unprotected position left`
					};
					return {
						ok: false,
						liveOpen: true,
						orderId: hash,
						message: `Lighter filled but ${missing} — flatten failed (${closed.message})`
					};
				} catch (err) {
					return {
						ok: false,
						liveOpen: true,
						orderId: hash,
						message: `Lighter filled but ${missing} — flatten failed (${err instanceof Error ? err.message : "close threw"})`
					};
				}
			}
			return {
				ok: true,
				orderId: hash,
				message: `Lighter ${order.side} ${mkt.coin} · SL/TP on venue`
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Lighter order failed"
			};
		}
	},
	async updateStop(account, order) {
		try {
			const mkt = marketOf(await fetchLighterMarkets(), order.symbol);
			if (!mkt) return {
				ok: false,
				message: `Lighter has no market for ${order.symbol}`
			};
			const qty = scale(order.qty, mkt.sizeDecimals);
			const sl = scale(order.sl, mkt.priceDecimals);
			const tp = scale(order.tp, mkt.priceDecimals);
			const isAsk = order.side === "long";
			const oldIndexes = await listActiveOrderIndexes(account, mkt.marketIndex) ?? [];
			return {
				ok: true,
				orderId: await withSigner(account, async (client) => {
					const oco = await client.createOcoOrder({ orders: [{
						marketIndex: mkt.marketIndex,
						clientOrderIndex: Date.now() % 1e9,
						baseAmount: qty,
						price: sl,
						isAsk,
						orderType: 2,
						reduceOnly: true,
						triggerPrice: sl
					}, {
						marketIndex: mkt.marketIndex,
						clientOrderIndex: (Date.now() + 1) % 1e9,
						baseAmount: qty,
						price: tp,
						isAsk,
						orderType: 4,
						reduceOnly: true,
						triggerPrice: tp
					}] });
					if (oco.error) throw new Error(oco.error);
					if (!oco.hash) throw new Error("Lighter OCO did not confirm — existing SL/TP left in place");
					for (const orderIndex of oldIndexes) try {
						await client.cancelOrder({
							marketIndex: mkt.marketIndex,
							orderIndex
						});
					} catch {}
					return oco.hash;
				}),
				message: "Lighter SL moved to BE · TP replaced"
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Lighter update stop failed"
			};
		}
	},
	async closePosition(account, symbol) {
		try {
			const mkt = marketOf(await fetchLighterMarkets(), symbol);
			if (!mkt) return {
				ok: false,
				message: "no market"
			};
			const pos = (await this.fetchPositions(account)).find((p) => coinOf(p.symbol) === mkt.coin);
			if (!pos || !pos.qty) return {
				ok: true,
				message: "flat"
			};
			const qty = scale(pos.qty, mkt.sizeDecimals);
			const isAsk = pos.side === "long";
			const hash = await withSigner(account, async (client) => {
				let px = 0;
				try {
					px = await client.getBestPrice(mkt.marketIndex, isAsk);
				} catch {
					px = scale(pos.entry || mkt.lastPrice || 1, mkt.priceDecimals);
				}
				const [, h, err] = await client.createMarketOrder({
					marketIndex: mkt.marketIndex,
					clientOrderIndex: Date.now() % 1e9,
					baseAmount: qty,
					avgExecutionPrice: px,
					isAsk,
					reduceOnly: true
				});
				if (err) throw new Error(err);
				return h;
			});
			let left;
			let readFailed = false;
			for (let i = 0; i < 3; i++) {
				try {
					left = (await this.fetchPositions(account)).find((p) => coinOf(p.symbol) === mkt.coin);
					readFailed = false;
					if (!left?.qty) break;
				} catch {
					readFailed = true;
				}
				if (i < 2) await new Promise((r) => setTimeout(r, 400));
			}
			if (readFailed) return {
				ok: false,
				orderId: hash,
				message: "Lighter close unconfirmed — SL/TP left in place"
			};
			if (left?.qty) return {
				ok: false,
				orderId: hash,
				message: "Lighter close left a remainder — SL/TP left in place"
			};
			const leftovers = await listActiveOrderIndexes(account, mkt.marketIndex) ?? [];
			let others = 0;
			try {
				others = (await this.fetchPositions(account)).filter((p) => coinOf(p.symbol) !== mkt.coin && p.qty).length;
			} catch {
				others = 1;
			}
			try {
				await withSigner(account, async (client) => {
					if (others === 0) {
						const result = await client.cancelAllOrders(0, Date.now());
						const err = Array.isArray(result) ? result[result.length - 1] : null;
						if (typeof err === "string" && err) throw new Error(err);
						return;
					}
					for (const orderIndex of leftovers) try {
						await client.cancelOrder({
							marketIndex: mkt.marketIndex,
							orderIndex
						});
					} catch {}
				});
			} catch {
				if (leftovers.length) try {
					await withSigner(account, async (client) => {
						for (const orderIndex of leftovers) try {
							await client.cancelOrder({
								marketIndex: mkt.marketIndex,
								orderIndex
							});
						} catch {}
					});
				} catch {}
			}
			return {
				ok: true,
				orderId: hash,
				message: "closed"
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "close failed"
			};
		}
	},
	async fetchPositions(account) {
		const json = await accountQuery(account);
		if (!json) throw new Error("Lighter account query failed");
		return (json.accounts?.[0]?.positions ?? []).filter((p) => Number(p.position) !== 0).map((p) => ({
			symbol: p.symbol,
			side: Number(p.position) > 0 ? "long" : "short",
			qty: Math.abs(Number(p.position)),
			entry: Number(p.avg_entry_price ?? 0),
			leverage: Number(p.leverage ?? 1),
			upl: Number(p.unrealized_pnl ?? 0)
		}));
	},
	async fetchProtection(account, input) {
		const mkt = marketOf(await fetchLighterMarkets(), input.symbol);
		if (!mkt) return {
			onVenue: false,
			hasSl: false,
			hasTp: false,
			unknown: true
		};
		let onVenue = false;
		try {
			const pos = (await this.fetchPositions(account)).find((p) => coinOf(p.symbol) === mkt.coin);
			onVenue = Boolean(pos?.qty);
		} catch {
			return {
				onVenue: false,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
		}
		const indexes = await listActiveOrderIndexes(account, mkt.marketIndex);
		if (indexes == null) return {
			onVenue,
			hasSl: false,
			hasTp: false,
			unknown: true
		};
		return {
			onVenue,
			hasSl: indexes.length >= 2,
			hasTp: indexes.length >= 2,
			unknown: false
		};
	},
	async testConnection(account) {
		try {
			const bal = await this.fetchBalance(account);
			if (account.accountIndex == null && !account.apiKey) return {
				ok: false,
				message: "Need L1 address or account index to read the account."
			};
			if (bal == null) return {
				ok: false,
				message: "Account not found on Lighter mainnet."
			};
			if (!account.privateKey) return {
				ok: false,
				message: `Account visible (${bal.toFixed(2)} USDC) but no API private key — cannot sign orders.`
			};
			const check = await withSigner(account, async (client) => client.checkClient(true));
			if (check) return {
				ok: false,
				message: check
			};
			return {
				ok: true,
				message: `Lighter signer ready · account ${account.accountIndex} · ${bal.toFixed(2)} USDC`
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Lighter ping failed"
			};
		}
	}
};
function hmacSha256Hex(secret, payload) {
	return createHmac("sha256", secret).update(payload).digest("hex");
}
function signedQuery(params, secret) {
	const body = Object.entries(params).filter(([, v]) => v !== void 0 && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
	const signature = hmacSha256Hex(secret, body);
	return {
		body,
		signature,
		qs: `${body}&signature=${signature}`
	};
}
/** Compact JSON — MEXC-style contract sign uses the exact POST body string. */
function ourbitBody(payload) {
	if (payload == null) return "";
	return JSON.stringify(payload);
}
/** Sorted query string (no URL-encoding) for GET signatures. */
function ourbitQuery(params) {
	return Object.entries(params).filter(([, v]) => v !== void 0 && v !== "").sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("&");
}
function ourbitSign(apiKey, secret, timestamp, paramString) {
	return hmacSha256Hex(secret, `${apiKey}${timestamp}${paramString}`);
}
function ourbitKlineInterval(tf) {
	if (tf === "5m") return "Min5";
	if (tf === "15m") return "Min15";
	if (tf === "1h") return "Min60";
	if (tf === "4h") return "Hour4";
	if (tf === "1d") return "Day1";
	if (tf === "1w") return "Week1";
	return "Min5";
}
function ourbitBarTimeMs(raw) {
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return 0;
	return n < 0xe8d4a51000 ? n * 1e3 : n;
}
function ourbitCloseSide(long) {
	return long ? 4 : 2;
}
function ourbitOpenSide(long) {
	return long ? 1 : 3;
}
/** Map OURBIT contract side (1–4) onto BUY/SELL for the journal closer. */
function ourbitTradeSide(side) {
	const n = Number(side);
	if (n === 1 || n === 2) return "BUY";
	if (n === 3 || n === 4) return "SELL";
	const s = String(side ?? "").toUpperCase();
	if (s === "BUY" || s === "SELL") return s;
	return "";
}
var EPS$5 = 1e-10;
/** Margin = capitalPct of FREE capital. Locked margin is ignored. Notional = margin × leverage. */
function sizePosition(opts) {
	const lev = Math.max(1, opts.leverage);
	const pct = Math.min(100, Math.max(1, opts.capitalPct));
	const free = opts.available != null && Number.isFinite(opts.available) ? Math.max(0, opts.available) : Math.max(0, opts.equity - Math.max(0, opts.usedMargin ?? 0));
	const want = free * (pct / 100);
	if (!(want > 0) || !(opts.entry > 0) || !(free > 0)) return null;
	const margin = Math.min(want, free * .995);
	if (!(margin > 0)) return null;
	const notional = margin * lev;
	const qty = notional / opts.entry;
	if (!(qty > 0)) return null;
	return {
		qty,
		notional,
		margin,
		risk: qty * Math.abs(opts.entry - opts.sl),
		leverage: lev,
		fees: notional * 4 / 1e4
	};
}
/** Same-bar SL+TP = SL, matching the APEX header contract. */
function pathExit(side, sl, tp, bar) {
	if (side === "long") {
		const hitSl = bar.low <= sl;
		const hitTp = bar.high >= tp;
		if (hitSl && hitTp) return "sl";
		if (hitSl) return "sl";
		if (hitTp) return "tp";
		return null;
	}
	const hitSl = bar.high >= sl;
	const hitTp = bar.low <= tp;
	if (hitSl && hitTp) return "sl";
	if (hitSl) return "sl";
	if (hitTp) return "tp";
	return null;
}
/**
* Walk every bar after the fill (oldest first). First touch of SL/TP wins.
* TREX: once price travels beAtR in favor, stop moves to entry on that bar
* before the same-bar SL/TP check — same as the paper simulator.
*/
function walkPath(opts) {
	let sl = opts.sl;
	const origSl = opts.sl;
	let beMoved = false;
	let i = 0;
	for (const bar of opts.bars) {
		i += 1;
		let hit = pathExit(opts.side, sl, opts.tp, bar);
		if (!hit && opts.beAtR && !beMoved) {
			const dist = Math.abs(opts.entry - origSl);
			const fav = opts.side === "long" ? bar.high - opts.entry : opts.entry - bar.low;
			if (dist > 0 && fav >= opts.beAtR * dist) {
				sl = opts.entry;
				beMoved = true;
				hit = pathExit(opts.side, sl, opts.tp, bar);
			}
		}
		if (hit) {
			const atBe = beMoved && Math.abs(sl - opts.entry) <= EPS$5 * Math.max(1, opts.entry);
			const reason = hit === "tp" ? "tp" : atBe ? "be" : "sl";
			const exit = hit === "sl" ? sl : opts.tp;
			return {
				sl,
				beMoved,
				hit: {
					reason,
					exit,
					sl,
					barTime: bar.time
				},
				barsHeld: i
			};
		}
	}
	return {
		sl,
		beMoved,
		hit: null,
		barsHeld: i
	};
}
/** Reconstruct original stop if BE already pulled SL to entry. */
function origStopPx(opts) {
	const orig = Number(opts.origSl);
	if (Number.isFinite(orig) && orig > 0 && Math.abs(opts.entry - orig) > 1e-12) return orig;
	if (Math.abs(opts.entry - opts.sl) > 1e-8) return opts.sl;
	const qty = Number(opts.qty);
	const risk = Number(opts.risk);
	const dist = qty > 0 && risk > 0 ? risk / qty : 0;
	if (!(dist > 0)) return opts.sl;
	return opts.side === "long" ? opts.entry - dist : opts.entry + dist;
}
/** Max adverse / favorable excursion in R, using the original stop distance. */
function pathExcursion(opts) {
	const dist = Math.abs(opts.entry - opts.origSl);
	if (!(dist > 0) || !opts.bars.length) return {
		maeR: 0,
		mfeR: 0
	};
	let mae = 0;
	let mfe = 0;
	for (const bar of opts.bars) if (opts.side === "long") {
		mae = Math.max(mae, (opts.entry - bar.low) / dist);
		mfe = Math.max(mfe, (bar.high - opts.entry) / dist);
	} else {
		mae = Math.max(mae, (bar.high - opts.entry) / dist);
		mfe = Math.max(mfe, (opts.entry - bar.low) / dist);
	}
	return {
		maeR: mae,
		mfeR: mfe
	};
}
function pnlAt(side, entry, exit, qty, openFee) {
	const gross = side === "long" ? (exit - entry) * qty : (entry - exit) * qty;
	const closeFee = estimatedCloseFee(exit, qty);
	return gross - Math.abs(openFee) - closeFee;
}
function estimatedCloseFee(exit, qty) {
	return Math.abs(exit * qty) * 4 / 1e4;
}
/** Net R after fees: dollars made / dollars risked. Falls back to price R if risk is missing. */
function netPnlR(pnlUsd, riskUsd, fallback = 0) {
	if (Number.isFinite(pnlUsd) && Number.isFinite(riskUsd) && riskUsd > 0) return pnlUsd / riskUsd;
	return fallback;
}
/** Gross price move minus round-trip commission. This is what the journal stores. */
function netClosePnl(opts) {
	const openFee = opts.openFee != null && Number.isFinite(opts.openFee) ? Math.abs(opts.openFee) : Math.abs(opts.entry * opts.qty) * 4 / 1e4;
	const fees = openFee + estimatedCloseFee(opts.exit, opts.qty);
	const pnl = pnlAt(opts.side, opts.entry, opts.exit, opts.qty, openFee);
	return {
		pnl,
		fees,
		pnlR: netPnlR(pnl, opts.riskUsd)
	};
}
/** Shift SL/TP by the live fill vs the paper/signal entry. Distances stay the same. */
function rebaseStopsFromFill(opts) {
	const paper = Number(opts.paperEntry);
	const fill = Number(opts.fill);
	if (!(paper > 0) || !(fill > 0) || !Number.isFinite(paper) || !Number.isFinite(fill)) return {
		sl: opts.sl,
		tp: opts.tp
	};
	const d = fill - paper;
	if (!Number.isFinite(d) || Math.abs(d) < 1e-12) return {
		sl: opts.sl,
		tp: opts.tp
	};
	return {
		sl: opts.sl + d,
		tp: opts.tp + d
	};
}
/** VWAP of closing fills + realized PnL actually booked on the venue. */
function closeFromVenueTrades(opts) {
	const closeSide = opts.side === "long" ? "SELL" : "BUY";
	const after = opts.trades.filter((t) => Number(t.time) >= opts.openedAt - 15e3);
	const closes = after.filter((t) => String(t.side).toUpperCase() === closeSide);
	if (!closes.length) return null;
	let notional = 0;
	let qty = 0;
	let pnl = 0;
	let fees = 0;
	let sawPnl = false;
	for (const t of after) fees += Math.abs(Number(t.commission) || 0);
	for (const t of closes) {
		const q = Math.abs(Number(t.qty) || 0);
		const px = Number(t.price) || 0;
		if (q > 0 && px > 0) {
			notional += px * q;
			qty += q;
		}
		const r = Number(t.realizedPnl);
		if (Number.isFinite(r) && r !== 0) {
			pnl += r;
			sawPnl = true;
		}
	}
	if (!(qty > 0)) return null;
	const exit = notional / qty;
	if (!sawPnl) pnl = (opts.side === "long" ? (exit - opts.entry) * qty : (opts.entry - exit) * qty) - fees;
	else pnl -= fees;
	return {
		exit,
		pnl,
		fees
	};
}
function roundToStep(qty, step, min = 0) {
	const s = step > 0 ? step : 1;
	const n = Math.floor(qty / s + 1e-12) * s;
	const v = Number(n.toPrecision(12));
	if (v < min) return 0;
	return v;
}
/** Highest maxOpenPosLeverage / initialLeverage on a symbol's Aster brackets. */
function maxLeverageFromAsterTiers(tiers) {
	if (!tiers?.length) return 0;
	return Math.max(0, ...tiers.map((b) => Number(b.maxOpenPosLeverage ?? b.initialLeverage ?? 0)));
}
/** Public web payload, signed v3 array, or signed v3 single-symbol object. */
function asterBracketRows(raw) {
	if (Array.isArray(raw)) return raw;
	if (!raw || typeof raw !== "object") return [];
	const o = raw;
	if (Array.isArray(o.data?.brackets)) return o.data.brackets;
	if (o.symbol && (o.brackets || o.riskBrackets)) return [o];
	return [];
}
var cache$1 = null;
function put(map, symbolOrCoin, lev) {
	const coin = coinOf(symbolOrCoin);
	if (!coin || !(lev > 0)) return;
	map[coin] = Math.max(map[coin] ?? 0, capLeverage(lev));
}
async function fetchHyperliquidMap() {
	const map = {};
	try {
		const res = await fetch("https://api.hyperliquid.xyz/info", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ type: "meta" })
		});
		if (!res.ok) return map;
		const json = await res.json();
		for (const u of json.universe ?? []) put(map, u.name, u.maxLeverage);
	} catch {}
	return map;
}
async function fetchLighterMap() {
	const map = {};
	try {
		const rows = await fetchLighterMarkets();
		for (const r of rows) put(map, r.coin, r.maxLeverage);
	} catch {}
	return map;
}
async function fetchOurbitMap() {
	const map = {};
	try {
		const res = await fetch("https://futures.ourbit.com/api/v1/contract/detail", {
			headers: {
				Accept: "application/json",
				"User-Agent": "Mozilla/5.0"
			},
			signal: AbortSignal.timeout(2e4)
		});
		if (!res.ok) return map;
		const json = await res.json();
		for (const c of json.data ?? []) if (c.symbol) put(map, c.symbol, Number(c.maxLeverage ?? 0));
	} catch {}
	return map;
}
async function fetchAsterMap() {
	const map = {};
	try {
		const res = await fetch("https://www.asterdex.com/bapi/futures/v1/public/future/common/brackets", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json"
			},
			body: "{}",
			signal: AbortSignal.timeout(15e3)
		});
		if (!res.ok) return map;
		const json = await res.json();
		for (const row of asterBracketRows(json)) {
			if (!row.symbol) continue;
			put(map, row.symbol, maxLeverageFromAsterTiers(row.riskBrackets ?? row.brackets));
		}
	} catch {}
	return map;
}
async function loadPublicLeverageMaps() {
	const now = Date.now();
	if (cache$1 && now - cache$1.at < 6e5) return cache$1.maps;
	const [hyperliquid, lighter, ourbit, aster] = await Promise.all([
		fetchHyperliquidMap(),
		fetchLighterMap(),
		fetchOurbitMap(),
		fetchAsterMap()
	]);
	cache$1 = {
		at: now,
		maps: {
			hyperliquid,
			lighter,
			ourbit,
			aster
		}
	};
	return cache$1.maps;
}
/** Paper book is Aster — size to Aster's own max, not a blend of other venues. */
async function publicMaxLeverage(symbol) {
	const maps = await loadPublicLeverageMaps();
	const coin = coinOf(symbol);
	return capLeverage(maps.aster[coin] || 25);
}
async function venueMaxLeverage(venue, symbol) {
	if (venue === "paper") return publicMaxLeverage(symbol);
	const maps = await loadPublicLeverageMaps();
	const coin = coinOf(symbol);
	if (venue === "hyperliquid") return capLeverage(maps.hyperliquid[coin] || defaultMaxLeverage(symbol));
	if (venue === "lighter") return capLeverage(maps.lighter[coin] || defaultMaxLeverage(symbol));
	if (venue === "ourbit") return capLeverage(maps.ourbit[coin] || defaultMaxLeverage(symbol));
	if (venue === "aster") return capLeverage(maps.aster[coin] || 25);
	return capLeverage(defaultMaxLeverage(symbol));
}
var ASTER_V3_DOMAIN = {
	name: "AsterSignTransaction",
	version: "1",
	chainId: 1666,
	verifyingContract: "0x0000000000000000000000000000000000000000"
};
var ASTER_V3_TYPES = { Message: [{
	name: "msg",
	type: "string"
}] };
var ADDR_RE = /^0x[0-9a-fA-F]{40}$/;
var PK_RE = /^0x[0-9a-fA-F]{64}$/;
var lastNonceUs = 0;
function nextAsterNonce() {
	const now = Date.now() * 1e3;
	const n = now <= lastNonceUs ? lastNonceUs + 1 : now;
	lastNonceUs = n;
	return String(n);
}
function asterV3Path(path) {
	return path.replace(/^\/fapi\/v[12]\//, "/fapi/v3/");
}
function formEncode(params) {
	return Object.keys(params).filter((k) => params[k] !== void 0 && params[k] !== "").sort().map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
}
function normalizeAsterPk(raw) {
	if (!raw) return null;
	const s = raw.trim();
	if (!s) return null;
	const pk = s.startsWith("0x") ? s : `0x${s}`;
	return PK_RE.test(pk) ? pk : null;
}
function asterUserAddress(account) {
	const w = (account.walletAddress ?? account.apiKey ?? "").trim();
	if (!ADDR_RE.test(w)) return null;
	try {
		return getAddress(w);
	} catch {
		return w;
	}
}
function asterSignerPk(account) {
	return normalizeAsterPk(account.privateKey ?? account.apiSecret ?? "");
}
function isAsterV3(account) {
	return Boolean(asterSignerPk(account));
}
async function signAsterV3(privateKey, msg) {
	return privateKeyToAccount(privateKey).signTypedData({
		domain: ASTER_V3_DOMAIN,
		types: ASTER_V3_TYPES,
		primaryType: "Message",
		message: { msg }
	});
}
var BASE$1 = "https://fapi.asterdex.com";
var specCache$1 = null;
function roundPrice$1(n, tick) {
	const s = tick > 0 ? tick : .1;
	return Number((Math.round(n / s) * s).toPrecision(12));
}
async function loadSpecs$1() {
	const now = Date.now();
	if (specCache$1 && now - specCache$1.at < 6e5) return specCache$1.rows;
	const res = await fetch(`${BASE$1}/fapi/v1/exchangeInfo`);
	if (!res.ok) throw new Error(`Aster exchangeInfo ${res.status}`);
	const rows = ((await res.json()).symbols ?? []).map((s) => {
		const lot = s.filters?.find((f) => f.filterType === "LOT_SIZE") ?? s.filters?.find((f) => f.filterType === "MARKET_LOT_SIZE");
		const px = s.filters?.find((f) => f.filterType === "PRICE_FILTER");
		return {
			symbol: s.symbol,
			minQty: Number(lot?.minQty ?? 0),
			stepSize: Number(lot?.stepSize ?? 0) || 10 ** -(s.quantityPrecision ?? 3),
			qtyPrecision: s.quantityPrecision ?? 3,
			tickSize: Number(px?.tickSize ?? 0) || 10 ** -(s.pricePrecision ?? 1)
		};
	});
	specCache$1 = {
		at: now,
		rows
	};
	return rows;
}
async function signed$1(account, method, path, params) {
	if (isAsterV3(account)) {
		const pk = asterSignerPk(account);
		const signer = privateKeyToAccount(pk).address;
		const user = asterUserAddress(account) || signer;
		const filtered = {};
		for (const [k, v] of Object.entries(params)) {
			if (v === void 0 || v === "") continue;
			filtered[k] = String(v);
		}
		filtered.nonce = nextAsterNonce();
		filtered.user = user;
		filtered.signer = signer;
		const msg = formEncode(filtered);
		const body = `${msg}&signature=${await signAsterV3(pk, msg)}`;
		const v3 = asterV3Path(path);
		const useBody = method === "POST" || method === "DELETE";
		const url = useBody ? `${BASE$1}${v3}` : `${BASE$1}${v3}?${body}`;
		return parseAster(await fetch(url, {
			method,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: useBody ? body : void 0
		}), v3);
	}
	if (!account.apiKey || !account.apiSecret) throw new Error("Aster API wallet private key required");
	const { qs } = signedQuery({
		...params,
		timestamp: Date.now(),
		recvWindow: 5e3
	}, account.apiSecret);
	const url = method === "POST" ? `${BASE$1}${path}` : `${BASE$1}${path}?${qs}`;
	return parseAster(await fetch(url, {
		method,
		headers: {
			"X-MBX-APIKEY": account.apiKey,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: method === "POST" ? qs : void 0
	}), path);
}
async function parseAster(res, path) {
	const text = await res.text();
	let json = text;
	try {
		json = JSON.parse(text);
	} catch {}
	if (!res.ok) {
		const msg = typeof json === "object" && json && "msg" in json ? String(json.msg) : text;
		throw new Error(msg || `Aster ${res.status}`);
	}
	if (typeof json === "object" && json && "code" in json && Number(json.code) < 0) {
		const msg = "msg" in json ? String(json.msg) : path;
		throw new Error(msg || `Aster ${path} failed`);
	}
	return json;
}
function isStopType(type, origType) {
	const typ = `${type} ${origType}`.toUpperCase();
	if (typ.includes("TAKE_PROFIT")) return false;
	return typ.includes("STOP");
}
function sleep$3(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
async function asterPositionAmt(account, symbol) {
	try {
		const pos = await signed$1(account, "GET", "/fapi/v2/positionRisk", { symbol });
		return Number(pos[0]?.positionAmt ?? 0);
	} catch {
		return null;
	}
}
async function waitAsterFill(account, symbol, orderId) {
	if (orderId) try {
		const o = await signed$1(account, "GET", "/fapi/v1/order", {
			symbol,
			orderId
		});
		const px = Number(o.avgPrice ?? 0);
		const qty = Number(o.executedQty ?? 0);
		if (px > 0) return {
			px,
			qty
		};
	} catch {}
	let last = {
		px: 0,
		qty: 0
	};
	for (let i = 0; i < 6; i++) {
		try {
			const pos = await signed$1(account, "GET", "/fapi/v2/positionRisk", { symbol });
			const qty = Math.abs(Number(pos[0]?.positionAmt ?? 0));
			const px = Number(pos[0]?.entryPrice ?? 0);
			last = {
				px,
				qty
			};
			if (qty > 0 && px > 0) return last;
		} catch {}
		if (orderId) try {
			const mine = (await signed$1(account, "GET", "/fapi/v1/userTrades", {
				symbol,
				limit: 20
			})).filter((t) => String(t.orderId ?? "") === String(orderId));
			let notional = 0;
			let qty = 0;
			for (const t of mine) {
				const px = Number(t.price ?? 0);
				const q = Number(t.qty ?? 0);
				if (px > 0 && q > 0) {
					notional += px * q;
					qty += q;
				}
			}
			if (qty > 0 && notional > 0) {
				last = {
					px: notional / qty,
					qty
				};
				return last;
			}
		} catch {}
		if (i < 5) await sleep$3(350);
	}
	return last;
}
/** Wait until a fill shows up (or give up). 0 = confirmed flat, null = read failed. */
async function waitAsterAmt(account, symbol) {
	let last = null;
	for (let i = 0; i < 3; i++) {
		last = await asterPositionAmt(account, symbol);
		if (last != null && last !== 0) return last;
		if (i < 2) await sleep$3(300);
	}
	return last;
}
/** Wait until the position is gone after a close. */
async function waitAsterFlat(account, symbol) {
	let last = null;
	for (let i = 0; i < 3; i++) {
		last = await asterPositionAmt(account, symbol);
		if (last === 0) return "flat";
		if (i < 2) await sleep$3(300);
	}
	if (last == null) return "unknown";
	return last === 0 ? "flat" : "open";
}
async function asterPlaceStops(account, symbol, closeSide, sl, tp) {
	let slErr = "";
	let tpErr = "";
	try {
		await signed$1(account, "POST", "/fapi/v1/order", {
			symbol,
			side: closeSide,
			type: "STOP_MARKET",
			stopPrice: sl,
			closePosition: "true",
			workingType: "MARK_PRICE"
		});
	} catch (err) {
		slErr = err instanceof Error ? err.message : "SL rejected";
	}
	try {
		await signed$1(account, "POST", "/fapi/v1/order", {
			symbol,
			side: closeSide,
			type: "TAKE_PROFIT_MARKET",
			stopPrice: tp,
			closePosition: "true",
			workingType: "MARK_PRICE"
		});
	} catch (err) {
		tpErr = err instanceof Error ? err.message : "TP rejected";
	}
	return {
		slErr,
		tpErr
	};
}
/** Place new SL/TP first, then drop the previous ones — no unprotected gap. */
async function asterReplaceStops(account, symbol, closeSide, sl, tp) {
	let oldIds = [];
	try {
		oldIds = (await signed$1(account, "GET", "/fapi/v1/openOrders", { symbol })).map((o) => o.orderId);
	} catch {}
	const placed = await asterPlaceStops(account, symbol, closeSide, sl, tp);
	if (!placed.slErr && !placed.tpErr) for (const orderId of oldIds) try {
		await signed$1(account, "DELETE", "/fapi/v1/order", {
			symbol,
			orderId
		});
	} catch {}
	return placed;
}
async function asterMarketClose(account, symbol) {
	const spec = (await loadSpecs$1()).find((s) => s.symbol === symbol);
	const amt = await asterPositionAmt(account, symbol);
	if (amt == null) return {
		ok: false,
		message: "Aster position read failed before close"
	};
	if (!amt) return {
		ok: true,
		message: "flat"
	};
	const qty = spec ? roundToStep(Math.abs(amt), spec.stepSize, spec.minQty) : Math.abs(amt);
	if (!qty) return {
		ok: false,
		message: `Aster close size below min for ${symbol}`
	};
	await signed$1(account, "POST", "/fapi/v1/order", {
		symbol,
		side: amt > 0 ? "SELL" : "BUY",
		type: "MARKET",
		quantity: qty,
		reduceOnly: "true"
	});
	return {
		ok: true,
		message: "closed"
	};
}
async function asterCancelOpen(account, symbol) {
	try {
		await signed$1(account, "DELETE", "/fapi/v1/allOpenOrders", { symbol });
	} catch {}
}
/** Two successful zero reads. One zero can be API lag right after a fill. */
async function confirmAsterAlreadyFlat(account, symbol) {
	let zeros = 0;
	for (let i = 0; i < 3; i++) {
		const amt = await asterPositionAmt(account, symbol);
		if (amt == null) zeros = 0;
		else if (!amt) {
			zeros += 1;
			if (zeros >= 2) return "flat";
		} else return "open";
		if (i < 2) await sleep$3(300);
	}
	return "unknown";
}
/** Close first. Never cancel SL/TP unless the position is confirmed flat. */
async function closeAndDisarm$1(account, symbol) {
	const closed = await asterMarketClose(account, symbol);
	if (!closed.ok && closed.message !== "flat") return closed;
	if (closed.message === "flat") {
		const state = await confirmAsterAlreadyFlat(account, symbol);
		if (state === "open") {
			const again = await asterMarketClose(account, symbol);
			if (!again.ok && again.message !== "flat") return again;
			if (again.message === "flat") return {
				ok: false,
				message: "Aster close unconfirmed — SL/TP left in place"
			};
			const after = await waitAsterFlat(account, symbol);
			if (after !== "flat") return {
				ok: false,
				message: after === "unknown" ? "Aster close unconfirmed — SL/TP left in place" : "Aster close left a remainder — SL/TP left in place"
			};
			await asterCancelOpen(account, symbol);
			return {
				ok: true,
				orderId: again.orderId,
				message: "closed"
			};
		}
		if (state !== "flat") return {
			ok: false,
			message: "Aster close unconfirmed — SL/TP left in place"
		};
		await asterCancelOpen(account, symbol);
		return closed;
	}
	const state = await waitAsterFlat(account, symbol);
	if (state !== "flat") return {
		ok: false,
		message: state === "unknown" ? "Aster close unconfirmed — SL/TP left in place" : "Aster close left a remainder — SL/TP left in place"
	};
	await asterCancelOpen(account, symbol);
	return closed;
}
function flattenMessage$2(closed, why, orderId) {
	if (closed.ok || closed.message === "flat") return {
		ok: false,
		message: `${why} — flattened, no unprotected position left`
	};
	return {
		ok: false,
		liveOpen: true,
		orderId,
		message: `${why} — flatten failed (${closed.message})`
	};
}
function numField(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : NaN;
}
/** Aster / Binance-style account payload → total equity + free capital. */
function parseAsterWallet(data) {
	if (data == null) return null;
	if (Array.isArray(data)) {
		const rows = data;
		const usdt = rows.find((r) => String(r.asset ?? "").toUpperCase() === "USDT") ?? rows[0];
		if (!usdt) return null;
		const available = numField(usdt.availableBalance ?? usdt.maxWithdrawAmount ?? usdt.balance);
		const equity = numField(usdt.marginBalance ?? usdt.crossWalletBalance ?? usdt.walletBalance ?? usdt.balance ?? available);
		if (!Number.isFinite(available) && !Number.isFinite(equity)) return null;
		const a = Number.isFinite(available) ? Math.max(0, available) : 0;
		return {
			equity: Number.isFinite(equity) ? Math.max(0, equity) : a,
			available: a
		};
	}
	if (typeof data !== "object") return null;
	const rec = data;
	const available = numField(rec.availableBalance ?? rec.maxWithdrawAmount);
	const equity = numField(rec.totalMarginBalance ?? rec.totalWalletBalance ?? rec.totalCrossWalletBalance ?? available);
	if (!Number.isFinite(available) && !Number.isFinite(equity)) return null;
	const a = Number.isFinite(available) ? Math.max(0, available) : 0;
	return {
		equity: Number.isFinite(equity) ? Math.max(0, equity) : a,
		available: a
	};
}
var asterAdapter = {
	id: "aster",
	label: "Aster",
	kind: "dex",
	docs: "https://www.asterdex.com/en/api-wallet",
	symbolOf: (base) => `${base}USDT`,
	async listMarkets() {
		const [infoRes, tickerRes, maps] = await Promise.all([
			fetch(`${BASE$1}/fapi/v1/exchangeInfo`, {
				headers: { Accept: "application/json" },
				signal: AbortSignal.timeout(2e4)
			}),
			fetch(`${BASE$1}/fapi/v1/ticker/24hr`, {
				headers: { Accept: "application/json" },
				signal: AbortSignal.timeout(12e3)
			}).catch(() => null),
			loadPublicLeverageMaps().catch(() => null)
		]);
		if (!infoRes.ok) throw new Error(`Aster exchangeInfo ${infoRes.status}`);
		const info = await infoRes.json();
		const vol = /* @__PURE__ */ new Map();
		if (tickerRes && tickerRes.ok) try {
			const raw = await tickerRes.json();
			const rows = Array.isArray(raw) ? raw : [raw];
			for (const t of rows) if (t.symbol) vol.set(t.symbol.toUpperCase(), Number(t.quoteVolume ?? 0) || 0);
		} catch {}
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		for (const s of info.symbols ?? []) {
			if (!s.symbol) continue;
			if (s.status && s.status !== "TRADING") continue;
			if (s.contractType && s.contractType !== "PERPETUAL") continue;
			if (s.quoteAsset && s.quoteAsset !== "USDT") continue;
			const base = isTradeableBase(s.symbol);
			if (!base || seen.has(base)) continue;
			seen.add(base);
			out.push({
				base,
				symbol: s.symbol,
				venueSymbol: nativeSymbol("aster", base),
				volume24hUsd: vol.get(s.symbol.toUpperCase()) ?? 0,
				maxLeverage: maps?.aster?.[base] ?? 0
			});
		}
		return out;
	},
	async fetchMaxLeverage(symbol, account) {
		if (account && (isAsterV3(account) || account.apiKey && account.apiSecret)) try {
			const raw = await signed$1(account, "GET", "/fapi/v1/leverageBracket", { symbol });
			const max = Math.max(0, ...asterBracketRows(raw).map((r) => maxLeverageFromAsterTiers(r.riskBrackets ?? r.brackets)));
			if (max) return capLeverage(max);
		} catch {}
		return venueMaxLeverage("aster", symbol);
	},
	async fetchWallet(account) {
		return parseAsterWallet(await signed$1(account, "GET", "/fapi/v2/account", {}));
	},
	async fetchBalance(account) {
		return (this.fetchWallet ? await this.fetchWallet(account) : null)?.available ?? null;
	},
	async placeOrder(account, order) {
		try {
			const spec = (await loadSpecs$1()).find((s) => s.symbol === order.symbol);
			const qty = spec ? roundToStep(order.qty, spec.stepSize, spec.minQty) : Number(order.qty.toPrecision(6));
			if (!qty) return {
				ok: false,
				message: `Aster size below min for ${order.symbol}`
			};
			try {
				await signed$1(account, "POST", "/fapi/v1/leverage", {
					symbol: order.symbol,
					leverage: capLeverage(order.leverage)
				});
			} catch {}
			const side = order.side === "long" ? "BUY" : "SELL";
			const closeSide = side === "BUY" ? "SELL" : "BUY";
			let data = {};
			try {
				data = await signed$1(account, "POST", "/fapi/v1/order", {
					symbol: order.symbol,
					side,
					type: "MARKET",
					quantity: qty,
					newOrderRespType: "RESULT"
				});
			} catch (err) {
				const why = err instanceof Error ? err.message : "Aster order failed";
				const amt = await waitAsterAmt(account, order.symbol);
				if (amt === 0) return {
					ok: false,
					message: why
				};
				if (amt == null) try {
					return flattenMessage$2(await closeAndDisarm$1(account, order.symbol), `Aster entry unconfirmed (${why})`);
				} catch (e) {
					return {
						ok: false,
						liveOpen: true,
						message: `Aster entry unconfirmed (${why}) — flatten failed (${e instanceof Error ? e.message : "close threw"})`
					};
				}
			}
			const fromResult = Number(data.avgPrice ?? 0);
			const filledFromResult = Number(data.executedQty ?? 0);
			let live = fromResult > 0 ? {
				px: fromResult,
				qty: filledFromResult
			} : await waitAsterFill(account, order.symbol, data.orderId);
			let fillPx = live.px > 0 ? live.px : 0;
			let filledQty = live.qty > 0 ? live.qty : qty;
			const paperEntry = Number(order.entry ?? 0);
			const rebased = rebaseStopsFromFill({
				paperEntry: paperEntry || fillPx,
				fill: fillPx || paperEntry,
				sl: order.sl,
				tp: order.tp
			});
			let sl = spec ? roundPrice$1(rebased.sl, spec.tickSize) : rebased.sl;
			let tp = spec ? roundPrice$1(rebased.tp, spec.tickSize) : rebased.tp;
			let { slErr, tpErr } = await asterPlaceStops(account, order.symbol, closeSide, sl, tp);
			if (slErr || tpErr) {
				const missing = [slErr && `SL: ${slErr}`, tpErr && `TP: ${tpErr}`].filter(Boolean).join(" · ");
				const oid = data.orderId ? String(data.orderId) : void 0;
				try {
					return flattenMessage$2(await closeAndDisarm$1(account, order.symbol), `Aster filled but ${missing}`, oid);
				} catch (err) {
					return {
						ok: false,
						liveOpen: true,
						orderId: oid,
						message: `Aster filled but ${missing} — flatten failed (${err instanceof Error ? err.message : "close threw"})`
					};
				}
			}
			if (!(fillPx > 0)) {
				live = await waitAsterFill(account, order.symbol, data.orderId);
				if (live.px > 0) {
					fillPx = live.px;
					if (live.qty > 0) filledQty = live.qty;
					const later = rebaseStopsFromFill({
						paperEntry: paperEntry || fillPx,
						fill: fillPx,
						sl: order.sl,
						tp: order.tp
					});
					const sl2 = spec ? roundPrice$1(later.sl, spec.tickSize) : later.sl;
					const tp2 = spec ? roundPrice$1(later.tp, spec.tickSize) : later.tp;
					if (Math.abs(sl2 - sl) > 1e-8 || Math.abs(tp2 - tp) > 1e-8) {
						const moved = await asterReplaceStops(account, order.symbol, closeSide, sl2, tp2);
						if (!moved.slErr && !moved.tpErr) {
							sl = sl2;
							tp = tp2;
						}
					}
				}
			}
			return {
				ok: true,
				orderId: data.orderId ? String(data.orderId) : void 0,
				fillPrice: fillPx || void 0,
				filledQty: filledQty || void 0,
				sl,
				tp,
				message: "Aster market fill · SL/TP on venue"
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Aster order failed"
			};
		}
	},
	async updateStop(account, order) {
		try {
			const spec = (await loadSpecs$1()).find((s) => s.symbol === order.symbol);
			const sl = spec ? roundPrice$1(order.sl, spec.tickSize) : order.sl;
			const tp = spec ? roundPrice$1(order.tp, spec.tickSize) : order.tp;
			const opens = await signed$1(account, "GET", "/fapi/v1/openOrders", { symbol: order.symbol });
			const oldStopIds = opens.filter((o) => isStopType(o.type ?? "", o.origType ?? "")).map((o) => o.orderId);
			const tpOrders = opens.filter((o) => `${o.type ?? ""} ${o.origType ?? ""}`.toUpperCase().includes("TAKE_PROFIT"));
			const closeSide = order.side === "long" ? "SELL" : "BUY";
			await signed$1(account, "POST", "/fapi/v1/order", {
				symbol: order.symbol,
				side: closeSide,
				type: "STOP_MARKET",
				stopPrice: sl,
				closePosition: "true",
				workingType: "MARK_PRICE"
			});
			for (const orderId of oldStopIds) try {
				await signed$1(account, "DELETE", "/fapi/v1/order", {
					symbol: order.symbol,
					orderId
				});
			} catch {}
			const restingTp = Number(tpOrders[0]?.stopPrice ?? 0);
			if (Number.isFinite(tp) && tp > 0 && (!restingTp || Math.abs(restingTp - tp) > 1e-8)) {
				await signed$1(account, "POST", "/fapi/v1/order", {
					symbol: order.symbol,
					side: closeSide,
					type: "TAKE_PROFIT_MARKET",
					stopPrice: tp,
					closePosition: "true",
					workingType: "MARK_PRICE"
				});
				for (const o of tpOrders) try {
					await signed$1(account, "DELETE", "/fapi/v1/order", {
						symbol: order.symbol,
						orderId: o.orderId
					});
				} catch {}
				return {
					ok: true,
					message: "Aster SL/TP moved onto live fill"
				};
			}
			return {
				ok: true,
				message: "Aster SL moved to BE · TP kept"
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Aster update stop failed"
			};
		}
	},
	async closePosition(account, symbol) {
		try {
			return await closeAndDisarm$1(account, symbol);
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "close failed"
			};
		}
	},
	async fetchPositions(account) {
		const raw = await signed$1(account, "GET", "/fapi/v2/positionRisk", {});
		return (Array.isArray(raw) ? raw : []).filter((r) => Number(r.positionAmt) !== 0).map((r) => ({
			symbol: r.symbol,
			side: Number(r.positionAmt) > 0 ? "long" : "short",
			qty: Math.abs(Number(r.positionAmt)),
			entry: Number(r.entryPrice),
			leverage: Number(r.leverage),
			upl: Number(r.unRealizedProfit)
		}));
	},
	async fetchTrades(account, opts) {
		const raw = await signed$1(account, "GET", "/fapi/v1/userTrades", {
			symbol: opts.symbol,
			startTime: opts.startTime,
			limit: 1e3
		});
		return (Array.isArray(raw) ? raw : []).map((r) => ({
			time: Number(r.time ?? r.insertTime ?? 0),
			side: String(r.side ?? ""),
			price: Number(r.price ?? 0),
			qty: Number(r.qty ?? 0),
			realizedPnl: Number(r.realizedPnl ?? r.realizedProfit ?? 0),
			commission: Number(r.commission ?? r.fee ?? 0),
			orderId: r.orderId != null ? String(r.orderId) : void 0
		}));
	},
	async fetchProtection(account, input) {
		const amt = await asterPositionAmt(account, input.symbol);
		if (amt == null) return {
			onVenue: false,
			hasSl: false,
			hasTp: false,
			unknown: true
		};
		const onVenue = amt !== 0;
		try {
			const opens = await signed$1(account, "GET", "/fapi/v1/openOrders", { symbol: input.symbol });
			let hasSl = false;
			let hasTp = false;
			for (const o of opens) if (`${o.type ?? ""} ${o.origType ?? ""}`.toUpperCase().includes("TAKE_PROFIT")) hasTp = true;
			else if (isStopType(o.type ?? "", o.origType ?? "")) hasSl = true;
			return {
				onVenue,
				hasSl,
				hasTp,
				unknown: false
			};
		} catch {
			return {
				onVenue,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
		}
	},
	async testConnection(account) {
		try {
			if (!isAsterV3(account) && (!account.apiKey || !account.apiSecret)) return {
				ok: false,
				message: "Aster API wallet private key required."
			};
			const bal = await this.fetchBalance(account);
			const pos = await this.fetchPositions(account);
			return {
				ok: true,
				message: `Aster live · ${(bal ?? 0).toFixed(2)} USDT · ${pos.length} open`
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Aster ping failed"
			};
		}
	}
};
var INFO_URL = "https://api.hyperliquid.xyz/info";
function normalizePk(raw) {
	const s = raw.trim();
	return s.startsWith("0x") ? s : `0x${s}`;
}
function triggerExecPx(trigger, closeBuy, szDec) {
	return formatPrice(trigger * (closeBuy ? 1.02 : .98), szDec);
}
function masterWalletOk(account) {
	const w = account.walletAddress?.trim() ?? "";
	return /^0x[0-9a-fA-F]{40}$/.test(w);
}
function masterAddress(account) {
	const w = account.walletAddress?.trim();
	if (w && /^0x[0-9a-fA-F]{40}$/.test(w)) return w.toLowerCase();
	return null;
}
async function info(body) {
	const res = await fetch(INFO_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Hyperliquid info ${res.status}`);
	return res.json();
}
var metaCache = null;
async function loadMeta() {
	const now = Date.now();
	if (metaCache && now - metaCache.at < 6e4) return metaCache;
	const [meta, mids] = await Promise.all([info({ type: "meta" }), info({ type: "allMids" })]);
	metaCache = {
		at: now,
		meta,
		mids
	};
	return metaCache;
}
function assetOf(meta, symbol) {
	const coin = coinOf(symbol);
	const idx = meta.universe.findIndex((u) => u.name.toUpperCase() === coin);
	if (idx < 0) return null;
	return {
		idx,
		asset: meta.universe[idx],
		coin
	};
}
function walletOf(account) {
	if (!account.privateKey) throw new Error("Hyperliquid private key missing");
	return privateKeyToAccount(normalizePk(account.privateKey));
}
function clients(account) {
	const transport = new HttpTransport();
	const wallet = walletOf(account);
	return { exchange: new ExchangeClient({
		transport,
		wallet
	}) };
}
function statusesOf(result) {
	const r = result;
	return Array.isArray(r.response?.data?.statuses) ? r.response.data.statuses : [];
}
function statusError(st) {
	if (st && typeof st === "object" && "error" in st) return String(st.error);
	return null;
}
function allOrderErrors(result) {
	const r = result;
	if (r.status && r.status !== "ok") return r.status;
	const errs = statusesOf(result).map(statusError).filter((e) => Boolean(e));
	return errs.length ? errs.join("; ") : null;
}
function statusOid(st) {
	if (!st || typeof st !== "object") return void 0;
	const rec = st;
	const hit = rec.filled ?? rec.resting;
	if (hit && typeof hit === "object" && hit.oid != null) return String(hit.oid);
}
function parseOrderId(result) {
	return statusOid(statusesOf(result)[0]);
}
function entryLive(result) {
	return Boolean(parseOrderId(result));
}
function protectionLanded(result, minLegs) {
	if (allOrderErrors(result)) return false;
	const st = statusesOf(result);
	if (st.length < minLegs) return false;
	return st.every((s) => !statusError(s));
}
async function listTriggers(account, coin) {
	const user = masterAddress(account);
	if (!user) return [];
	const opens = await info({
		type: "frontendOpenOrders",
		user
	});
	return (Array.isArray(opens) ? opens : []).filter((o) => o.coin?.toUpperCase() === coin && Boolean(o.isTrigger) && Number.isFinite(o.oid));
}
async function cancelOids(account, assetIdx, oids) {
	if (!oids.length) return;
	const { exchange } = clients(account);
	await exchange.cancel({ cancels: oids.map((o) => ({
		a: assetIdx,
		o
	})) });
}
async function coinPositionSize(account, coin) {
	const user = masterAddress(account);
	if (!user) return 0;
	const pos = (await info({
		type: "clearinghouseState",
		user
	})).assetPositions?.find((p) => p.position?.coin?.toUpperCase() === coin);
	return Math.abs(Number(pos?.position?.szi ?? 0));
}
function sleep$2(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
async function waitHlFlat(account, coin) {
	let last = null;
	for (let i = 0; i < 3; i++) {
		try {
			last = await coinPositionSize(account, coin);
			if (last === 0) return "flat";
		} catch {
			last = null;
		}
		if (i < 2) await sleep$2(300);
	}
	if (last == null) return "unknown";
	return last === 0 ? "flat" : "open";
}
/** Two successful zero reads. One zero can be API lag right after a fill. */
async function confirmHlAlreadyFlat(account, coin) {
	if (!masterAddress(account)) return "unknown";
	let zeros = 0;
	for (let i = 0; i < 3; i++) {
		try {
			if (await coinPositionSize(account, coin) === 0) {
				zeros += 1;
				if (zeros >= 2) return "flat";
			} else return "open";
		} catch {
			zeros = 0;
		}
		if (i < 2) await sleep$2(300);
	}
	return "unknown";
}
async function marketCloseHl(account, symbol) {
	if (!account.privateKey) return {
		ok: false,
		message: "Hyperliquid private key missing"
	};
	const user = masterAddress(account);
	if (!user) return {
		ok: false,
		message: "Hyperliquid address missing"
	};
	const { meta, mids } = await loadMeta();
	const hit = assetOf(meta, symbol);
	if (!hit) return {
		ok: false,
		message: "no market"
	};
	const pos = (await info({
		type: "clearinghouseState",
		user
	})).assetPositions?.find((p) => p.position?.coin?.toUpperCase() === hit.coin);
	const szi = Number(pos?.position?.szi ?? 0);
	if (!szi) return {
		ok: true,
		message: "flat"
	};
	const mid = Number(mids[hit.coin] ?? 0);
	const isBuy = szi < 0;
	const px = formatPrice((mid || Math.abs(szi)) * (isBuy ? 1.02 : .98), hit.asset.szDecimals);
	const sz = formatSize(Math.abs(szi), hit.asset.szDecimals);
	const { exchange } = clients(account);
	const result = await exchange.order({
		orders: [{
			a: hit.idx,
			b: isBuy,
			p: px,
			s: sz,
			r: true,
			t: { limit: { tif: "Ioc" } }
		}],
		grouping: "na"
	});
	const err = allOrderErrors(result);
	if (err) return {
		ok: false,
		message: err
	};
	return {
		ok: true,
		orderId: parseOrderId(result),
		message: "closed"
	};
}
/** Close first. Only cancel leftover triggers after the position is actually flat. */
async function closeAndDisarm(account, symbol) {
	const closed = await marketCloseHl(account, symbol);
	if (!closed.ok && closed.message !== "flat") return closed;
	const { meta } = await loadMeta();
	const hit = assetOf(meta, symbol);
	if (!hit) return {
		ok: false,
		message: "Hyperliquid close unconfirmed — SL/TP left in place"
	};
	if (closed.message === "flat") {
		const state = await confirmHlAlreadyFlat(account, hit.coin);
		if (state === "open") {
			const again = await marketCloseHl(account, symbol);
			if (!again.ok && again.message !== "flat") return again;
			if (again.message === "flat") return {
				ok: false,
				message: "Hyperliquid close unconfirmed — SL/TP left in place"
			};
			const after = await waitHlFlat(account, hit.coin);
			if (after !== "flat") return {
				ok: false,
				message: after === "unknown" ? "Hyperliquid close unconfirmed — SL/TP left in place" : "Hyperliquid close left a remainder — SL/TP left in place"
			};
			try {
				const leftover = await listTriggers(account, hit.coin);
				await cancelOids(account, hit.idx, leftover.map((o) => Number(o.oid)));
			} catch {}
			return {
				ok: true,
				orderId: again.orderId,
				message: "closed"
			};
		}
		if (state !== "flat") return {
			ok: false,
			message: "Hyperliquid close unconfirmed — SL/TP left in place"
		};
	} else {
		const state = await waitHlFlat(account, hit.coin);
		if (state !== "flat") return {
			ok: false,
			message: state === "unknown" ? "Hyperliquid close unconfirmed — SL/TP left in place" : "Hyperliquid close left a remainder — SL/TP left in place"
		};
	}
	try {
		const leftover = await listTriggers(account, hit.coin);
		await cancelOids(account, hit.idx, leftover.map((o) => Number(o.oid)));
	} catch {}
	return closed.message === "flat" ? closed : {
		ok: true,
		orderId: closed.orderId,
		message: "closed"
	};
}
function flattenMessage$1(closed, why, orderId) {
	if (closed.ok || closed.message === "flat") return {
		ok: false,
		message: `${why} — flattened, no unprotected position left`
	};
	return {
		ok: false,
		liveOpen: true,
		orderId,
		message: `${why} — flatten failed (${closed.message})`
	};
}
function pxClose$1(a, b) {
	if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
	const scale = Math.max(Math.abs(b), Math.abs(a), 1e-9);
	return Math.abs(a - b) / scale < .002;
}
var hyperliquidAdapter = {
	id: "hyperliquid",
	label: "Hyperliquid",
	kind: "dex",
	docs: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api",
	symbolOf: (base) => base,
	async listMarkets() {
		const json = await info({ type: "metaAndAssetCtxs" });
		const universe = json[0]?.universe ?? [];
		const ctxs = json[1] ?? [];
		const out = [];
		const seen = /* @__PURE__ */ new Set();
		for (let i = 0; i < universe.length; i++) {
			const u = universe[i];
			if (!u.name || u.isDelisted) continue;
			if (Number(ctxs[i]?.markPx ?? 0) <= 0) continue;
			const base = isTradeableBase(u.name);
			if (!base || seen.has(base)) continue;
			seen.add(base);
			out.push({
				base,
				symbol: `${base}USDT`,
				venueSymbol: nativeSymbol("hyperliquid", base),
				volume24hUsd: Number(ctxs[i]?.dayNtlVlm ?? 0) || 0,
				maxLeverage: capLeverage(Number(u.maxLeverage ?? 0) || 0)
			});
		}
		return out;
	},
	async fetchMaxLeverage(symbol) {
		try {
			const { meta } = await loadMeta();
			return capLeverage(assetOf(meta, symbol)?.asset.maxLeverage || defaultMaxLeverage(symbol));
		} catch {
			return defaultMaxLeverage(symbol);
		}
	},
	async fetchWallet(account) {
		const user = masterAddress(account);
		if (!user) return null;
		const state = await info({
			type: "clearinghouseState",
			user
		});
		const equity = Number(state.marginSummary?.accountValue ?? state.withdrawable ?? 0);
		const available = Number(state.withdrawable ?? state.marginSummary?.accountValue ?? 0);
		if (!Number.isFinite(available) && !Number.isFinite(equity)) return null;
		const a = Number.isFinite(available) ? Math.max(0, available) : 0;
		return {
			equity: Number.isFinite(equity) ? Math.max(0, equity) : a,
			available: a
		};
	},
	async fetchBalance(account) {
		return (this.fetchWallet ? await this.fetchWallet(account) : null)?.available ?? null;
	},
	async placeOrder(account, order) {
		try {
			if (!account.privateKey) return {
				ok: false,
				message: "Hyperliquid private key missing"
			};
			if (!masterWalletOk(account)) return {
				ok: false,
				message: "Master wallet 0x address required. Agent keys cannot be armed without it."
			};
			const { meta, mids } = await loadMeta();
			const hit = assetOf(meta, order.symbol);
			if (!hit) return {
				ok: false,
				message: `Hyperliquid has no market for ${order.symbol}`
			};
			const market = hit;
			const szDec = market.asset.szDecimals;
			const mid = Number(mids[hit.coin] ?? mids[hit.asset.name] ?? 0);
			if (!mid) return {
				ok: false,
				message: `No Hyperliquid mid for ${hit.coin}`
			};
			const isBuy = order.side === "long";
			const px = formatPrice(mid * (isBuy ? 1.015 : .985), szDec);
			const sz = formatSize(order.qty, szDec);
			if (Number(sz) * mid < 10) return {
				ok: false,
				message: `Hyperliquid min notional is $10 (got ${(Number(sz) * mid).toFixed(2)})`
			};
			const lev = capLeverage(Math.min(order.leverage, hit.asset.maxLeverage || order.leverage));
			const { exchange } = clients(account);
			try {
				await exchange.updateLeverage({
					asset: hit.idx,
					isCross: true,
					leverage: lev
				});
			} catch {}
			const slPx = formatPrice(order.sl, szDec);
			const tpPx = formatPrice(order.tp, szDec);
			const closeBuy = !isBuy;
			const slExec = triggerExecPx(order.sl, closeBuy, szDec);
			const tpExec = triggerExecPx(order.tp, closeBuy, szDec);
			const entry = {
				a: hit.idx,
				b: isBuy,
				p: px,
				s: sz,
				r: Boolean(order.reduceOnly),
				t: { limit: { tif: "Ioc" } }
			};
			const sl = {
				a: hit.idx,
				b: closeBuy,
				p: slExec,
				s: sz,
				r: true,
				t: { trigger: {
					isMarket: true,
					triggerPx: slPx,
					tpsl: "sl"
				} }
			};
			const tp = {
				a: hit.idx,
				b: closeBuy,
				p: tpExec,
				s: sz,
				r: true,
				t: { trigger: {
					isMarket: true,
					triggerPx: tpPx,
					tpsl: "tp"
				} }
			};
			async function place(params) {
				try {
					return await exchange.order(params);
				} catch (err) {
					return {
						status: "err",
						response: { data: { statuses: [{ error: err instanceof Error ? err.message : "order threw" }] } }
					};
				}
			}
			async function protectOrFlatten(entryResult, why) {
				let filled = entryLive(entryResult);
				if (!filled) try {
					filled = await coinPositionSize(account, market.coin) > 0;
				} catch {
					filled = false;
				}
				if (!filled) {
					try {
						await closeAndDisarm(account, order.symbol);
					} catch {}
					return {
						ok: false,
						message: why
					};
				}
				const protect = await place({
					orders: [sl, tp],
					grouping: "positionTpsl"
				});
				if (protectionLanded(protect, 2)) return {
					ok: true,
					orderId: parseOrderId(entryResult) ?? parseOrderId(protect),
					message: `Hyperliquid IOC ${order.side} ${market.coin} · SL/TP on venue`
				};
				const oid = parseOrderId(entryResult) ?? parseOrderId(protect);
				try {
					return flattenMessage$1(await closeAndDisarm(account, order.symbol), why, oid);
				} catch (err) {
					return {
						ok: false,
						liveOpen: true,
						orderId: oid,
						message: `${why} — flatten failed (${err instanceof Error ? err.message : "close threw"})`
					};
				}
			}
			const grouped = await place({
				orders: [
					entry,
					sl,
					tp
				],
				grouping: "normalTpsl"
			});
			if (protectionLanded(grouped, 3) && entryLive(grouped)) return {
				ok: true,
				orderId: parseOrderId(grouped),
				message: `Hyperliquid IOC ${order.side} ${hit.coin} · SL/TP on venue`
			};
			return await protectOrFlatten(grouped, allOrderErrors(grouped) || "Hyperliquid entry unconfirmed — not sending a second fill");
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Hyperliquid order failed"
			};
		}
	},
	async updateStop(account, order) {
		try {
			if (!account.privateKey) return {
				ok: false,
				message: "Hyperliquid private key missing"
			};
			const { meta } = await loadMeta();
			const hit = assetOf(meta, order.symbol);
			if (!hit) return {
				ok: false,
				message: `Hyperliquid has no market for ${order.symbol}`
			};
			if (!masterAddress(account)) return {
				ok: false,
				message: "Hyperliquid address missing"
			};
			const { exchange } = clients(account);
			const coin = hit.coin;
			const existing = await listTriggers(account, coin);
			const slPx = formatPrice(order.sl, hit.asset.szDecimals);
			const tpPx = formatPrice(order.tp, hit.asset.szDecimals);
			const sz = formatSize(order.qty, hit.asset.szDecimals);
			const closeBuy = order.side === "short";
			const slExec = triggerExecPx(order.sl, closeBuy, hit.asset.szDecimals);
			const tpExec = triggerExecPx(order.tp, closeBuy, hit.asset.szDecimals);
			const fresh = [{
				a: hit.idx,
				b: closeBuy,
				p: slExec,
				s: sz,
				r: true,
				t: { trigger: {
					isMarket: true,
					triggerPx: slPx,
					tpsl: "sl"
				} }
			}, {
				a: hit.idx,
				b: closeBuy,
				p: tpExec,
				s: sz,
				r: true,
				t: { trigger: {
					isMarket: true,
					triggerPx: tpPx,
					tpsl: "tp"
				} }
			}];
			async function placeFresh() {
				try {
					return await exchange.order({
						orders: fresh,
						grouping: "positionTpsl"
					});
				} catch (err) {
					return {
						status: "err",
						response: { data: { statuses: [{ error: err instanceof Error ? err.message : "order threw" }] } }
					};
				}
			}
			const first = await placeFresh();
			async function venueHasNewPair() {
				const opens = await listTriggers(account, coin);
				return {
					opens,
					hasSl: opens.some((o) => o.tpsl === "sl" && pxClose$1(Number(o.triggerPx), order.sl)),
					hasTp: opens.some((o) => o.tpsl === "tp" && pxClose$1(Number(o.triggerPx), order.tp))
				};
			}
			let check = await venueHasNewPair();
			if (!check.hasSl || !check.hasTp) {
				await placeFresh();
				check = await venueHasNewPair();
			}
			if (check.hasSl && check.hasTp) {
				const keep = new Set(check.opens.filter((o) => o.tpsl === "sl" && pxClose$1(Number(o.triggerPx), order.sl) || o.tpsl === "tp" && pxClose$1(Number(o.triggerPx), order.tp)).map((o) => String(o.oid)));
				const stale = existing.filter((o) => o.oid != null && !keep.has(String(o.oid)));
				if (stale.length) try {
					await cancelOids(account, hit.idx, stale.map((o) => Number(o.oid)));
				} catch {}
				return {
					ok: true,
					message: "Hyperliquid SL moved to BE · TP kept"
				};
			}
			return {
				ok: false,
				message: allOrderErrors(first) || "Hyperliquid BE stop did not confirm — original SL kept"
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Hyperliquid update stop failed"
			};
		}
	},
	async closePosition(account, symbol) {
		try {
			return await closeAndDisarm(account, symbol);
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "close failed"
			};
		}
	},
	async fetchPositions(account) {
		const user = masterAddress(account);
		if (!user) throw new Error("Hyperliquid address missing");
		return ((await info({
			type: "clearinghouseState",
			user
		})).assetPositions ?? []).filter((p) => Number(p.position?.szi) !== 0).map((p) => {
			const szi = Number(p.position.szi);
			return {
				symbol: p.position.coin,
				side: szi > 0 ? "long" : "short",
				qty: Math.abs(szi),
				entry: Number(p.position.entryPx ?? 0),
				leverage: Number(p.position.leverage?.value ?? 1),
				upl: Number(p.position.unrealizedPnl ?? 0)
			};
		});
	},
	async fetchProtection(account, input) {
		if (!masterAddress(account)) return {
			onVenue: false,
			hasSl: false,
			hasTp: false,
			unknown: true
		};
		const { meta } = await loadMeta();
		const hit = assetOf(meta, input.symbol);
		if (!hit) return {
			onVenue: false,
			hasSl: false,
			hasTp: false,
			unknown: true
		};
		let onVenue = false;
		try {
			onVenue = await coinPositionSize(account, hit.coin) > 0;
		} catch {
			return {
				onVenue: false,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
		}
		try {
			const opens = await listTriggers(account, hit.coin);
			const hasSl = opens.some((o) => o.tpsl === "sl");
			const hasTp = opens.some((o) => o.tpsl === "tp");
			return {
				onVenue,
				hasSl,
				hasTp,
				unknown: false
			};
		} catch {
			return {
				onVenue,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
		}
	},
	async testConnection(account) {
		try {
			if (!account.privateKey) return {
				ok: false,
				message: "Paste the agent (or main) private key."
			};
			try {
				walletOf(account);
			} catch {
				return {
					ok: false,
					message: "Private key is not a valid hex key."
				};
			}
			if (!masterWalletOk(account)) return {
				ok: false,
				message: "Master wallet 0x address required. Agent keys cannot be armed without it."
			};
			const user = masterAddress(account);
			if (!user) return {
				ok: false,
				message: "Could not derive address."
			};
			const bal = await this.fetchBalance(account);
			const pos = await this.fetchPositions(account);
			const agentNote = `master ${user.slice(0, 6)}…${user.slice(-4)}`;
			if (bal == null) return {
				ok: false,
				message: `Signed, but no clearinghouse state for ${agentNote}.`
			};
			return {
				ok: true,
				message: `Hyperliquid live · ${agentNote} · ${bal.toFixed(2)} USDC · ${pos.length} open`
			};
		} catch (err) {
			return {
				ok: false,
				message: err instanceof Error ? err.message : "Hyperliquid ping failed"
			};
		}
	}
};
function pushUnique(out, seen, rawSymbol, volume, maxLeverage) {
	const base = isTradeableBase(rawSymbol);
	if (!base || seen.has(base)) return;
	seen.add(base);
	out.push({
		base,
		symbol: `${base}USDT`,
		venueSymbol: nativeSymbol("ourbit", base),
		volume24hUsd: volume,
		maxLeverage: capLeverage(maxLeverage)
	});
}
function isLiveUsdtPerp(row) {
	const quote = String(row.quoteCoin ?? row.settleCoin ?? "").toUpperCase();
	if (quote && quote !== "USDT") return false;
	if (row.state != null && Number(row.state) !== 0) return false;
	if (row.futureType != null && Number(row.futureType) !== 1) return false;
	if (row.apiAllowed === false) return false;
	if (row.isHidden === true) return false;
	return Boolean(row.symbol);
}
/** USDT-M perps from OURBIT /api/v1/contract/detail. */
function listedFromOurbitContracts(contracts, volumes) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const c of contracts) {
		if (!isLiveUsdtPerp(c) || !c.symbol) continue;
		const vol = volumes?.get(c.symbol.toUpperCase()) ?? 0;
		pushUnique(out, seen, c.symbol, vol, Number(c.maxLeverage ?? 0));
	}
	return out;
}
/** Fallback book from the 24h contract ticker (`BTC_USDT`). */
function listedFromOurbitTickers(rows) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const t of rows) {
		const sym = (t.symbol ?? "").toUpperCase();
		if (!sym.endsWith("_USDT")) continue;
		pushUnique(out, seen, sym, Number(t.amount24 ?? 0) || 0, 0);
	}
	return out;
}
var BASE = "https://futures.ourbit.com";
var UA = "Mozilla/5.0";
var specCache = null;
function roundPrice(n, tick) {
	const s = tick > 0 ? tick : .1;
	return Number((Math.round(n / s) * s).toPrecision(12));
}
function sleep$1(ms) {
	return Promise.resolve().then(() => new Promise((r) => setTimeout(r, ms)));
}
function unwrap(json, path) {
	if (json && typeof json === "object") {
		const o = json;
		if (o.success === false || o.code != null && o.code !== 0 && o.code !== 200) throw new Error(o.message || o.msg || `OURBIT ${path} failed`);
		if ("data" in o) return o.data;
	}
	return json;
}
async function publicGet(path) {
	const res = await fetch(`${BASE}${path}`, {
		headers: {
			Accept: "application/json",
			"User-Agent": UA
		},
		signal: AbortSignal.timeout(2e4)
	});
	const text = await res.text();
	let json = text;
	try {
		json = JSON.parse(text);
	} catch {}
	if (!res.ok) {
		const msg = typeof json === "object" && json && "message" in json ? String(json.message) : text;
		throw new Error(msg || `OURBIT ${res.status}`);
	}
	return unwrap(json, path);
}
async function loadSpecs() {
	const now = Date.now();
	if (specCache && now - specCache.at < 6e5) return specCache.rows;
	const raw = await publicGet("/api/v1/contract/detail");
	const specs = (Array.isArray(raw) ? raw : []).filter((r) => r.symbol).map((r) => ({
		symbol: String(r.symbol),
		contractSize: Number(r.contractSize ?? 1) || 1,
		minVol: Number(r.minVol ?? 1) || 1,
		volUnit: Number(r.volUnit ?? 1) || 1,
		priceUnit: Number(r.priceUnit ?? 0) || 0,
		maxLeverage: capLeverage(Number(r.maxLeverage ?? 0) || 25)
	}));
	specCache = {
		at: now,
		rows: specs
	};
	return specs;
}
function specOf(rows, symbol) {
	const want = symbol.toUpperCase();
	return rows.find((r) => r.symbol.toUpperCase() === want) ?? null;
}
function coinsOf(spec, contracts) {
	if (!spec) return contracts;
	return contracts * spec.contractSize;
}
function contractsOf(spec, qtyCoins) {
	return roundToStep(qtyCoins / spec.contractSize, spec.volUnit, spec.minVol);
}
async function signed(account, method, path, params) {
	if (!account.apiKey || !account.apiSecret) throw new Error("OURBIT API key and secret required");
	const ts = Date.now();
	let paramStr = "";
	let url = `${BASE}${path}`;
	let body;
	if (method === "GET") {
		paramStr = ourbitQuery(params && !Array.isArray(params) ? params : {});
		if (paramStr) url += `?${paramStr}`;
	} else {
		body = params === void 0 ? "" : ourbitBody(params);
		paramStr = body;
	}
	const signature = ourbitSign(account.apiKey, account.apiSecret, ts, paramStr);
	const res = await fetch(url, {
		method,
		headers: {
			ApiKey: account.apiKey,
			"Request-Time": String(ts),
			Signature: signature,
			"Content-Type": "application/json",
			"Recv-Window": "20000",
			"User-Agent": UA
		},
		body: method === "POST" ? body || void 0 : void 0
	});
	const text = await res.text();
	let json = text;
	try {
		json = JSON.parse(text);
	} catch {}
	if (!res.ok) {
		const msg = typeof json === "object" && json && ("message" in json || "msg" in json) ? String(json.message ?? json.msg) : text;
		throw new Error(msg || `OURBIT ${res.status}`);
	}
	return unwrap(json, path);
}
function asRows(json) {
	if (Array.isArray(json)) return json;
	if (json && typeof json === "object") {
		const o = json;
		if (Array.isArray(o.data)) return o.data;
		if (Array.isArray(o.list)) return o.list;
	}
	return [];
}
function posLong(p) {
	return Number(p.positionType) !== 2;
}
function pxClose(a, b) {
	if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return Math.abs(a - b) < 1e-8;
	return Math.abs(a - b) / Math.abs(b) < .015;
}
async function readPositions(account, symbol) {
	return asRows(await signed(account, "GET", "/api/v1/private/position/open_positions", symbol ? { symbol } : void 0));
}
async function livePos(account, symbol) {
	try {
		return (await readPositions(account, symbol)).find((p) => Number(p.holdVol ?? 0) > 0) ?? null;
	} catch {
		return null;
	}
}
async function ourbitHoldVol(account, symbol) {
	try {
		const rows = await readPositions(account, symbol);
		const row = rows.find((p) => Number(p.holdVol ?? 0) > 0) ?? rows[0];
		if (!row) return 0;
		return Math.abs(Number(row.holdVol ?? 0)) || 0;
	} catch {
		return null;
	}
}
async function listStops(account, symbol) {
	const out = [];
	for (const path of ["/api/v1/private/stoporder/list/orders", "/api/v1/private/planorder/list/orders"]) try {
		const raw = await signed(account, "GET", path, {
			symbol,
			is_finished: 0,
			page_num: 1,
			page_size: 50
		});
		for (const row of asRows(raw)) if (row && typeof row === "object") out.push(row);
	} catch {}
	return out;
}
async function readProtection(account, symbol, sl, tp) {
	const pos = await livePos(account, symbol);
	if (pos == null && await ourbitHoldVol(account, symbol) == null) return {
		size: 0,
		hasSl: false,
		hasTp: false,
		sideLong: true,
		unknown: true,
		fill: 0
	};
	const size = Math.abs(Number(pos?.holdVol ?? 0));
	const sideLong = pos ? posLong(pos) : true;
	const fill = Number(pos?.holdAvgPrice ?? pos?.openAvgPrice ?? 0);
	let hasSl = pxClose(Number(pos?.stopLossPrice ?? 0), sl) || Number(pos?.stopLossPrice ?? 0) > 0;
	let hasTp = pxClose(Number(pos?.takeProfitPrice ?? 0), tp) || Number(pos?.takeProfitPrice ?? 0) > 0;
	if (!hasSl || !hasTp) {
		const opens = await listStops(account, symbol);
		for (const o of opens) {
			const blob = `${o.state ?? ""} ${o.triggerSide ?? ""} ${o.stopLossPrice ?? ""} ${o.takeProfitPrice ?? ""} ${o.triggerPrice ?? ""}`.toUpperCase();
			const px = Number(o.stopLossPrice ?? o.takeProfitPrice ?? o.triggerPrice ?? o.price ?? 0);
			if (blob.includes("LOSS") || pxClose(px, sl) || Number(o.stopLossPrice ?? 0) > 0) hasSl = true;
			if (blob.includes("PROFIT") || pxClose(px, tp) || Number(o.takeProfitPrice ?? 0) > 0) hasTp = true;
		}
	}
	return {
		size,
		hasSl,
		hasTp,
		sideLong,
		unknown: false,
		fill
	};
}
async function attachStops(account, spec, pos, sl, tp) {
	const symbol = String(pos.symbol ?? spec.symbol);
	const vol = Math.abs(Number(pos.holdVol ?? 0));
	const long = posLong(pos);
	const slPx = roundPrice(sl, spec.priceUnit);
	const tpPx = roundPrice(tp, spec.priceUnit);
	const tries = [
		() => signed(account, "POST", "/api/v1/private/position/change_stop_loss_take_profit", {
			positionId: pos.positionId,
			stopLossPrice: slPx,
			takeProfitPrice: tpPx,
			lossTrend: 2,
			profitTrend: 2
		}),
		() => signed(account, "POST", "/api/v1/private/stoporder/place", {
			symbol,
			vol,
			leverage: Number(pos.leverage ?? 1) || 1,
			side: long ? 1 : 3,
			openType: Number(pos.openType ?? 2) || 2,
			type: 5,
			stopLossPrice: slPx,
			takeProfitPrice: tpPx,
			lossTrend: 2,
			profitTrend: 2,
			positionId: pos.positionId
		}),
		() => signed(account, "POST", "/api/v1/private/stoporder/change_price", {
			orderId: pos.positionId,
			stopLossPrice: slPx,
			takeProfitPrice: tpPx
		})
	];
	for (const run of tries) try {
		await run();
		return {
			slErr: "",
			tpErr: ""
		};
	} catch {}
	const closeSide = ourbitCloseSide(long);
	let slErr = "";
	let tpErr = "";
	try {
		await signed(account, "POST", "/api/v1/private/planorder/place", {
			symbol,
			price: 0,
			vol,
			leverage: Number(pos.leverage ?? 1) || 1,
			side: closeSide,
			openType: Number(pos.openType ?? 2) || 2,
			type: 5,
			orderType: 5,
			triggerPrice: slPx,
			triggerType: long ? 2 : 1,
			executeCycle: 1,
			trend: 2,
			reduceOnly: true
		});
	} catch (err) {
		slErr = err instanceof Error ? err.message : "SL rejected";
	}
	try {
		await signed(account, "POST", "/api/v1/private/planorder/place", {
			symbol,
			price: 0,
			vol,
			leverage: Number(pos.leverage ?? 1) || 1,
			side: closeSide,
			openType: Number(pos.openType ?? 2) || 2,
			type: 5,
			orderType: 5,
			triggerPrice: tpPx,
			triggerType: long ? 1 : 2,
			executeCycle: 1,
			trend: 2,
			reduceOnly: true
		});
	} catch (err) {
		tpErr = err instanceof Error ? err.message : "TP rejected";
	}
	return {
		slErr,
		tpErr
	};
}
async function cancelProtect(account, symbol) {
	for (const path of ["/api/v1/private/stoporder/cancel_all", "/api/v1/private/planorder/cancel_all"]) try {
		await signed(account, "POST", path, { symbol });
	} catch {}
}
async function waitHold(account, symbol) {
	let last = null;
	for (let i = 0; i < 4; i++) {
		last = await ourbitHoldVol(account, symbol);
		if (last != null && last !== 0) return last;
		if (i < 3) await sleep$1(300);
	}
	return last;
}
async function waitFlat(account, symbol) {
	let last = null;
	for (let i = 0; i < 4; i++) {
		last = await ourbitHoldVol(account, symbol);
		if (last === 0) return "flat";
		if (i < 3) await sleep$1(300);
	}
	if (last == null) return "unknown";
	return last === 0 ? "flat" : "open";
}
async function confirmAlreadyFlat(account, symbol) {
	let zeros = 0;
	for (let i = 0; i < 3; i++) {
		const amt = await ourbitHoldVol(account, symbol);
		if (amt == null) zeros = 0;
		else if (!amt) {
			zeros += 1;
			if (zeros >= 2) return "flat";
		} else return "open";
		if (i < 2) await sleep$1(300);
	}
	return "unknown";
}
async function marketClose(account, symbol) {
	const pos = await livePos(account, symbol);
	const vol = pos ? Math.abs(Number(pos.holdVol ?? 0)) : await ourbitHoldVol(account, symbol);
	if (vol == null) return {
		ok: false,
		message: "OURBIT position read failed before close"
	};
	if (!vol) {
		const confirmed = await confirmAlreadyFlat(account, symbol);
		if (confirmed === "flat") return {
			ok: true,
			message: "flat"
		};
		if (confirmed !== "open") return {
			ok: false,
			message: "OURBIT close unconfirmed — SL/TP left in place"
		};
	}
	const row = pos ?? await livePos(account, symbol);
	if (!row || !(Number(row.holdVol ?? 0) > 0)) {
		if (await confirmAlreadyFlat(account, symbol) === "flat") return {
			ok: true,
			message: "flat"
		};
		return {
			ok: false,
			message: "OURBIT close unconfirmed — SL/TP left in place"
		};
	}
	const long = posLong(row);
	await signed(account, "POST", "/api/v1/private/order/submit", {
		symbol,
		vol: Math.abs(Number(row.holdVol)),
		side: ourbitCloseSide(long),
		type: 5,
		openType: Number(row.openType ?? 2) || 2,
		positionId: row.positionId,
		reduceOnly: true
	});
	const state = await waitFlat(account, symbol);
	if (state !== "flat") return {
		ok: false,
		message: state === "unknown" ? "OURBIT close unconfirmed — SL/TP left in place" : "OURBIT close left a remainder — SL/TP left in place"
	};
	await cancelProtect(account, symbol);
	return {
		ok: true,
		message: "closed"
	};
}
function flattenMessage(closed, why, orderId) {
	if (closed.ok || closed.message === "flat") return {
		ok: false,
		message: `${why} — flattened, no unprotected position left`
	};
	return {
		ok: false,
		liveOpen: true,
		orderId,
		message: `${why} — flatten failed (${closed.message})`
	};
}
async function flattenUnconfirmed(account, symbol, why, orderId) {
	try {
		return flattenMessage(await marketClose(account, symbol), why, orderId);
	} catch (err) {
		return {
			ok: false,
			liveOpen: true,
			orderId,
			message: `${why} — flatten failed (${err instanceof Error ? err.message : "close threw"})`
		};
	}
}
async function waitFill(account, symbol, orderId) {
	if (orderId) try {
		const o = await signed(account, "GET", `/api/v1/private/order/get/${orderId}`);
		const px = Number(o.dealAvgPrice ?? 0);
		const qty = Number(o.dealVol ?? 0);
		if (px > 0) return {
			px,
			qty
		};
	} catch {}
	let last = {
		px: 0,
		qty: 0
	};
	for (let i = 0; i < 6; i++) {
		const pos = await livePos(account, symbol);
		const qty = Math.abs(Number(pos?.holdVol ?? 0));
		const px = Number(pos?.holdAvgPrice ?? pos?.openAvgPrice ?? 0);
		last = {
			px,
			qty
		};
		if (qty > 0 && px > 0) return last;
		if (i < 5) await sleep$1(350);
	}
	return last;
}
var adapters = {
	hyperliquid: hyperliquidAdapter,
	lighter: lighterAdapter,
	aster: asterAdapter,
	ourbit: {
		id: "ourbit",
		label: "OURBIT",
		kind: "cex",
		docs: "https://www.ourbit.com/support/articles/17827791513175",
		symbolOf: (base) => nativeSymbol("ourbit", base),
		async listMarkets() {
			const [detail, ticker] = await Promise.all([publicGet("/api/v1/contract/detail").catch(() => null), publicGet("/api/v1/contract/ticker").catch(() => null)]);
			const vol = /* @__PURE__ */ new Map();
			const tickerRows = asRows(ticker);
			for (const t of tickerRows) if (t.symbol) vol.set(t.symbol.toUpperCase(), Number(t.amount24 ?? 0) || 0);
			let out = listedFromOurbitContracts(asRows(detail), vol);
			if (out.length < 8) out = listedFromOurbitTickers(tickerRows);
			return out;
		},
		async fetchMaxLeverage(symbol) {
			try {
				const rows = await loadSpecs();
				const spec = specOf(rows, symbol) ?? specOf(rows, nativeSymbol("ourbit", symbol));
				if (spec?.maxLeverage) return spec.maxLeverage;
			} catch {}
			return 25;
		},
		async fetchWallet(account) {
			const rows = asRows(await signed(account, "GET", "/api/v1/private/account/assets"));
			const usdt = rows.find((r) => String(r.currency ?? "").toUpperCase() === "USDT") ?? rows[0];
			if (!usdt) return null;
			const equity = Number(usdt.equity ?? usdt.cashBalance ?? usdt.availableBalance ?? 0);
			const available = Number(usdt.availableBalance ?? usdt.equity ?? usdt.cashBalance ?? 0);
			if (!Number.isFinite(available) && !Number.isFinite(equity)) return null;
			const a = Number.isFinite(available) ? Math.max(0, available) : 0;
			return {
				equity: Number.isFinite(equity) ? Math.max(0, equity) : a,
				available: a
			};
		},
		async fetchBalance(account) {
			return (this.fetchWallet ? await this.fetchWallet(account) : null)?.available ?? null;
		},
		async placeOrder(account, order) {
			if (!account.apiKey || !account.apiSecret) return {
				ok: false,
				message: "OURBIT API key and secret required"
			};
			let oid;
			try {
				const rows = await loadSpecs();
				const spec = specOf(rows, order.symbol) ?? specOf(rows, nativeSymbol("ourbit", order.symbol));
				if (!spec) return {
					ok: false,
					message: `OURBIT has no perp for ${order.symbol}`
				};
				const vol = contractsOf(spec, order.qty);
				if (!vol) return {
					ok: false,
					message: `OURBIT size below min (${spec.minVol} contracts · ${spec.contractSize} ${order.symbol.split("_")[0]}/ct)`
				};
				const lev = capLeverage(Math.min(order.leverage, spec.maxLeverage || order.leverage));
				const long = order.side === "long";
				try {
					await signed(account, "POST", "/api/v1/private/position/change_leverage", {
						symbol: spec.symbol,
						leverage: lev,
						openType: 2,
						positionType: long ? 1 : 2
					});
				} catch {}
				try {
					const data = await signed(account, "POST", "/api/v1/private/order/submit", {
						symbol: spec.symbol,
						vol,
						side: ourbitOpenSide(long),
						type: 5,
						openType: 2,
						leverage: lev,
						externalOid: `apex-${Date.now()}`
					});
					if (data && typeof data === "object" && data.orderId != null) oid = String(data.orderId);
					else if (data != null && (typeof data === "string" || typeof data === "number")) oid = String(data);
				} catch (err) {
					const amt = await waitHold(account, spec.symbol);
					if (amt === 0) return {
						ok: false,
						message: err instanceof Error ? err.message : "OURBIT order failed"
					};
					if (amt == null) return flattenUnconfirmed(account, spec.symbol, `OURBIT entry unconfirmed (${err instanceof Error ? err.message : "order failed"})`);
				}
				const live = await waitFill(account, spec.symbol, oid);
				const pos = await livePos(account, spec.symbol);
				if (!pos || !(Number(pos.holdVol) > 0)) {
					if (oid) return flattenUnconfirmed(account, spec.symbol, "OURBIT fill unconfirmed (position read failed)", oid);
					return {
						ok: false,
						message: "OURBIT market did not fill"
					};
				}
				const fillPx = live.px > 0 ? live.px : Number(pos.holdAvgPrice ?? pos.openAvgPrice ?? 0);
				const filledQty = coinsOf(spec, live.qty > 0 ? live.qty : Number(pos.holdVol ?? vol));
				const paperEntry = Number(order.entry ?? 0);
				const rebased = rebaseStopsFromFill({
					paperEntry: paperEntry || fillPx,
					fill: fillPx || paperEntry,
					sl: order.sl,
					tp: order.tp
				});
				const sl = roundPrice(rebased.sl, spec.priceUnit);
				const tp = roundPrice(rebased.tp, spec.priceUnit);
				const placed = await attachStops(account, spec, pos, sl, tp);
				if (placed.slErr || placed.tpErr) {
					const missing = [placed.slErr && `SL: ${placed.slErr}`, placed.tpErr && `TP: ${placed.tpErr}`].filter(Boolean).join(" · ");
					return flattenUnconfirmed(account, spec.symbol, `OURBIT filled but ${missing}`, oid);
				}
				const prot = await readProtection(account, spec.symbol, sl, tp);
				if (prot.unknown ? false : prot.size > 0 && !(prot.hasSl && prot.hasTp)) {
					const retry = await attachStops(account, spec, pos, sl, tp);
					if (retry.slErr || retry.tpErr) {
						const missing = [!prot.hasSl && "SL", !prot.hasTp && "TP"].filter(Boolean).join("+");
						return flattenUnconfirmed(account, spec.symbol, `OURBIT filled but ${missing} missing`, oid);
					}
				}
				return {
					ok: true,
					orderId: oid,
					fillPrice: fillPx || void 0,
					filledQty: filledQty || void 0,
					sl,
					tp,
					message: `OURBIT market ${order.side} ${vol} ct · SL/TP on venue`
				};
			} catch (err) {
				if (oid) return flattenUnconfirmed(account, order.symbol, `OURBIT entry unconfirmed (${err instanceof Error ? err.message : "order failed"})`, oid);
				return {
					ok: false,
					message: err instanceof Error ? err.message : "OURBIT order failed"
				};
			}
		},
		async updateStop(account, order) {
			if (!account.apiKey || !account.apiSecret) return {
				ok: false,
				message: "OURBIT API key and secret required"
			};
			try {
				const rows = await loadSpecs();
				const spec = specOf(rows, order.symbol) ?? specOf(rows, nativeSymbol("ourbit", order.symbol));
				if (!spec) return {
					ok: false,
					message: `OURBIT has no perp for ${order.symbol}`
				};
				const pos = await livePos(account, spec.symbol);
				if (!pos) return {
					ok: false,
					message: "OURBIT position gone before stop move"
				};
				const sl = roundPrice(order.sl, spec.priceUnit);
				const tp = roundPrice(order.tp, spec.priceUnit);
				await cancelProtect(account, spec.symbol);
				const placed = await attachStops(account, spec, pos, sl, tp);
				if (placed.slErr) return {
					ok: false,
					message: placed.slErr
				};
				return {
					ok: true,
					message: placed.tpErr ? "OURBIT SL moved to BE · TP kept" : "OURBIT SL/TP moved onto live fill"
				};
			} catch (err) {
				return {
					ok: false,
					message: err instanceof Error ? err.message : "OURBIT update stop failed"
				};
			}
		},
		async closePosition(account, symbol) {
			try {
				return await marketClose(account, symbol);
			} catch (err) {
				return {
					ok: false,
					message: err instanceof Error ? err.message : "close failed"
				};
			}
		},
		async fetchPositions(account) {
			const specs = await loadSpecs().catch(() => []);
			return (await readPositions(account)).filter((r) => Number(r.holdVol ?? 0) !== 0).map((r) => {
				const spec = specOf(specs, String(r.symbol ?? ""));
				const contracts = Math.abs(Number(r.holdVol ?? 0));
				return {
					symbol: String(r.symbol ?? ""),
					side: posLong(r) ? "long" : "short",
					qty: coinsOf(spec, contracts),
					entry: Number(r.holdAvgPrice ?? r.openAvgPrice ?? 0),
					leverage: Number(r.leverage ?? 1),
					upl: Number(r.unrealized ?? r.closeProfit ?? r.realised ?? 0)
				};
			});
		},
		async fetchTrades(account, opts) {
			const specs = await loadSpecs().catch(() => []);
			const spec = specOf(specs, opts.symbol) ?? specOf(specs, nativeSymbol("ourbit", opts.symbol));
			return asRows(await signed(account, "GET", "/api/v1/private/order/list/order_deals", {
				symbol: spec?.symbol ?? opts.symbol,
				start_time: opts.startTime,
				page_num: 1,
				page_size: 100
			})).map((r) => {
				const contracts = Number(r.dealVol ?? r.vol ?? 0);
				return {
					time: ourbitBarTimeMs(Number(r.timestamp ?? r.createTime ?? 0)),
					side: ourbitTradeSide(r.side),
					price: Number(r.dealPrice ?? r.price ?? 0),
					qty: coinsOf(spec, contracts),
					realizedPnl: Number(r.profit ?? 0),
					commission: Number(r.fee ?? r.takerFee ?? 0),
					orderId: r.orderId != null ? String(r.orderId) : void 0
				};
			});
		},
		async fetchProtection(account, input) {
			if (!account.apiKey || !account.apiSecret) return {
				onVenue: false,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
			const prot = await readProtection(account, input.symbol, input.sl, input.tp);
			if (prot.unknown) return {
				onVenue: false,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
			return {
				onVenue: prot.size > 0,
				hasSl: prot.hasSl,
				hasTp: prot.hasTp,
				unknown: false
			};
		},
		async testConnection(account) {
			try {
				if (!account.apiKey || !account.apiSecret) return {
					ok: false,
					message: "OURBIT API key and secret required."
				};
				const bal = await this.fetchBalance(account);
				const pos = await this.fetchPositions(account);
				return {
					ok: true,
					message: `OURBIT live · ${(bal ?? 0).toFixed(2)} USDT · ${pos.length} open`
				};
			} catch (err) {
				return {
					ok: false,
					message: err instanceof Error ? err.message : "OURBIT ping failed"
				};
			}
		}
	}
};
function getAdapter(venue) {
	if (venue === "paper") return null;
	return adapters[venue];
}
async function resolveMaxLeverage(venue, symbol, account) {
	if (venue === "paper") return publicMaxLeverage(symbol);
	try {
		const n = await adapters[venue].fetchMaxLeverage(symbol, account);
		if (n > 0) return capLeverage(n);
	} catch {}
	return venueMaxLeverage(venue, symbol);
}
function venueSymbol(venue, binanceSymbol) {
	const base = coinOf(binanceSymbol);
	if (venue === "paper") return binanceSymbol;
	return adapters[venue].symbolOf(base);
}
function sameCoin(a, b) {
	return coinOf(a) === coinOf(b);
}
function klineWindow(tf, limit, now = Date.now()) {
	const ms = TF_MS[tf];
	const count = Math.max(1, Math.min(5e3, Math.round(limit) || 1));
	return {
		start: now - ms * count,
		end: now,
		count,
		ms
	};
}
function barFromBinanceRow(k) {
	if (!k || k.length < 6) return null;
	const time = Number(k[0]);
	const open = Number(k[1]);
	const high = Number(k[2]);
	const low = Number(k[3]);
	const close = Number(k[4]);
	const volume = Number(k[5]);
	if (![
		time,
		open,
		high,
		low,
		close
	].every(Number.isFinite)) return null;
	return {
		time,
		open,
		high,
		low,
		close,
		volume: Number.isFinite(volume) ? volume : 0
	};
}
function barFromHlCandle(row) {
	const time = Number(row.t);
	const open = Number(row.o);
	const high = Number(row.h);
	const low = Number(row.l);
	const close = Number(row.c);
	const volume = Number(row.v);
	if (![
		time,
		open,
		high,
		low,
		close
	].every(Number.isFinite)) return null;
	return {
		time,
		open,
		high,
		low,
		close,
		volume: Number.isFinite(volume) ? volume : 0
	};
}
function barFromLighterCandle(row) {
	return barFromHlCandle(row);
}
function sortBars(bars, limit) {
	const uniq = /* @__PURE__ */ new Map();
	for (const b of bars) if (b.time > 0) uniq.set(b.time, b);
	return [...uniq.values()].sort((a, b) => a.time - b.time).slice(-limit);
}
function barsFromOurbitKline(data, limit) {
	if (!data?.time?.length) return [];
	const bars = [];
	for (let i = 0; i < data.time.length; i++) {
		let time = Number(data.time[i]);
		if (Number.isFinite(time) && time > 0 && time < 0xe8d4a51000) time *= 1e3;
		const open = Number(data.open?.[i]);
		const high = Number(data.high?.[i]);
		const low = Number(data.low?.[i]);
		const close = Number(data.close?.[i]);
		const volume = Number(data.vol?.[i]);
		if (![
			time,
			open,
			high,
			low,
			close
		].every(Number.isFinite)) continue;
		bars.push({
			time,
			open,
			high,
			low,
			close,
			volume: Number.isFinite(volume) ? volume : 0
		});
	}
	return sortBars(bars, limit);
}
var LIGHTER_TF = {
	"5m": "5m",
	"15m": "15m",
	"1h": "1h",
	"4h": "4h",
	"1d": "1d",
	"1w": "1w"
};
var listedCache = /* @__PURE__ */ new Map();
var LISTED_TTL_MS = 9e5;
async function getJson(url, init) {
	let lastErr = null;
	for (let i = 0; i < 3; i++) {
		const res = await fetch(url, {
			...init,
			headers: {
				Accept: "application/json",
				...init?.headers ?? {}
			},
			signal: init?.signal ?? AbortSignal.timeout(12e3)
		});
		if (res.status === 429 || res.status === 418) {
			lastErr = /* @__PURE__ */ new Error(`market ${res.status}`);
			await new Promise((r) => setTimeout(r, 350 * (i + 1)));
			continue;
		}
		if (!res.ok) throw new Error(`market ${res.status}`);
		return res.json();
	}
	throw lastErr ?? /* @__PURE__ */ new Error("market 429");
}
async function postJson(url, body) {
	return getJson(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json"
		},
		body: JSON.stringify(body)
	});
}
async function fetchPaperListed() {
	const adapter = getAdapter("aster");
	if (!adapter) throw new Error("aster listed markets empty");
	return adapter.listMarkets();
}
async function listedFromVenue(venue) {
	if (venue === "paper") return fetchPaperListed();
	const adapter = getAdapter(venue);
	if (!adapter) return fetchPaperListed();
	return adapter.listMarkets();
}
/** Public listed perps on that venue. Throws if the venue book cannot be read. */
async function fetchListedMarkets(venue, force = false) {
	const hit = listedCache.get(venue);
	if (!force && hit && Date.now() - hit.at < LISTED_TTL_MS && hit.value.length) return hit.value;
	const cleaned = (await listedFromVenue(venue)).filter((r) => r.base);
	if (cleaned.length < 8) throw new Error(`${venue} listed markets empty`);
	listedCache.set(venue, {
		at: Date.now(),
		value: cleaned
	});
	return cleaned;
}
function clearListedCache(venue) {
	if (venue) listedCache.delete(venue);
	else listedCache.clear();
}
async function fetchAsterKlines(symbol, tf, limit) {
	return sortBars((await getJson(`https://fapi.asterdex.com/fapi/v1/klines?${new URLSearchParams({
		symbol: nativeSymbol("aster", symbol),
		interval: tf,
		limit: String(Math.min(1500, limit))
	})}`) ?? []).map(barFromBinanceRow).filter((b) => Boolean(b)), limit);
}
async function fetchOurbitKlines(symbol, tf, limit) {
	const { start, end, count } = klineWindow(tf, Math.min(2e3, limit));
	const q = new URLSearchParams({
		interval: ourbitKlineInterval(tf),
		start: String(Math.floor(start / 1e3)),
		end: String(Math.floor(end / 1e3))
	});
	return barsFromOurbitKline((await getJson(`https://futures.ourbit.com/api/v1/contract/kline/${nativeSymbol("ourbit", symbol)}?${q}`, { headers: { "User-Agent": "Mozilla/5.0" } })).data, count);
}
async function fetchHyperliquidKlines(symbol, tf, limit) {
	const { start, end } = klineWindow(tf, Math.min(5e3, limit));
	const rows = await postJson("https://api.hyperliquid.xyz/info", {
		type: "candleSnapshot",
		req: {
			coin: nativeSymbol("hyperliquid", symbol),
			interval: tf,
			startTime: start,
			endTime: end
		}
	});
	return sortBars((Array.isArray(rows) ? rows : []).map(barFromHlCandle).filter((b) => Boolean(b)), limit);
}
async function fetchLighterKlines(symbol, tf, limit) {
	const resolutions = tf === "1w" ? [
		"1w",
		"7d",
		"1d"
	] : [LIGHTER_TF[tf]];
	const markets = await fetchLighterMarkets();
	const base = coinOf(symbol);
	const row = markets.find((m) => m.coin === base);
	if (!row) return [];
	for (const resolution of resolutions) {
		if (!resolution) continue;
		try {
			const { start, end, count } = klineWindow(tf, Math.min(500, limit));
			const bars = sortBars(((await getJson(`https://mainnet.zklighter.elliot.ai/api/v1/candles?${new URLSearchParams({
				market_id: String(row.marketIndex),
				resolution,
				start_timestamp: String(start),
				end_timestamp: String(end),
				count_back: String(count)
			})}`)).c ?? []).map(barFromLighterCandle).filter((b) => Boolean(b)), limit);
			if (bars.length) return bars;
		} catch {}
	}
	return [];
}
async function fetchVenueKlines(venue, symbol, tf, limit = 360) {
	if (venue === "hyperliquid") return fetchHyperliquidKlines(symbol, tf, limit);
	if (venue === "lighter") return fetchLighterKlines(symbol, tf, limit);
	if (venue === "aster") return fetchAsterKlines(symbol, tf, limit);
	if (venue === "ourbit") return fetchOurbitKlines(symbol, tf, limit);
	return fetchKlines(symbol, tf, limit);
}
async function fetchVenueLastPrice(venue, symbol) {
	const base = coinOf(symbol);
	if (venue === "hyperliquid") {
		const mids = await postJson("https://api.hyperliquid.xyz/info", { type: "allMids" });
		const n = Number(mids[base] ?? mids[nativeSymbol("hyperliquid", symbol)] ?? NaN);
		if (Number.isFinite(n)) return n;
	} else if (venue === "lighter") {
		const row = (await fetchLighterMarkets()).find((m) => m.coin === base);
		if (row && row.lastPrice > 0) return row.lastPrice;
	} else if (venue === "aster") {
		const t = await getJson(`https://fapi.asterdex.com/fapi/v1/ticker/price?symbol=${nativeSymbol("aster", symbol)}`);
		const n = Number(t.price);
		if (Number.isFinite(n)) return n;
	} else if (venue === "ourbit") {
		const t = await getJson(`https://futures.ourbit.com/api/v1/contract/ticker?symbol=${nativeSymbol("ourbit", symbol)}`, { headers: { "User-Agent": "Mozilla/5.0" } });
		const row = Array.isArray(t.data) ? t.data.find((r) => r.symbol?.toUpperCase() === nativeSymbol("ourbit", symbol)) ?? t.data[0] : t.data;
		const n = Number(row?.lastPrice);
		if (Number.isFinite(n)) return n;
	} else return fetchLastPrice(symbol);
	const bars = await fetchVenueKlines(venue, symbol, "5m", 2);
	return bars[bars.length - 1]?.close ?? NaN;
}
var FALLBACK = [
	{
		symbol: "BTCUSDT",
		base: "BTC",
		name: "Bitcoin",
		marketCapUsd: 17e11,
		volume24hUsd: 4e10,
		maxLeverage: 125,
		venueSymbol: "BTCUSDT"
	},
	{
		symbol: "ETHUSDT",
		base: "ETH",
		name: "Ethereum",
		marketCapUsd: 42e10,
		volume24hUsd: 2e10,
		maxLeverage: 100,
		venueSymbol: "ETHUSDT"
	},
	{
		symbol: "BNBUSDT",
		base: "BNB",
		name: "BNB",
		marketCapUsd: 11e10,
		volume24hUsd: 2e9,
		maxLeverage: 75,
		venueSymbol: "BNBUSDT"
	},
	{
		symbol: "SOLUSDT",
		base: "SOL",
		name: "Solana",
		marketCapUsd: 9e10,
		volume24hUsd: 4e9,
		maxLeverage: 75,
		venueSymbol: "SOLUSDT"
	},
	{
		symbol: "XRPUSDT",
		base: "XRP",
		name: "XRP",
		marketCapUsd: 14e10,
		volume24hUsd: 3e9,
		maxLeverage: 75,
		venueSymbol: "XRPUSDT"
	},
	{
		symbol: "DOGEUSDT",
		base: "DOGE",
		name: "Dogecoin",
		marketCapUsd: 35e9,
		volume24hUsd: 2e9,
		maxLeverage: 75,
		venueSymbol: "DOGEUSDT"
	},
	{
		symbol: "ADAUSDT",
		base: "ADA",
		name: "Cardano",
		marketCapUsd: 25e9,
		volume24hUsd: 8e8,
		maxLeverage: 75,
		venueSymbol: "ADAUSDT"
	},
	{
		symbol: "TRXUSDT",
		base: "TRX",
		name: "TRON",
		marketCapUsd: 24e9,
		volume24hUsd: 7e8,
		maxLeverage: 50,
		venueSymbol: "TRXUSDT"
	},
	{
		symbol: "AVAXUSDT",
		base: "AVAX",
		name: "Avalanche",
		marketCapUsd: 12e9,
		volume24hUsd: 5e8,
		maxLeverage: 50,
		venueSymbol: "AVAXUSDT"
	},
	{
		symbol: "LINKUSDT",
		base: "LINK",
		name: "Chainlink",
		marketCapUsd: 13e9,
		volume24hUsd: 6e8,
		maxLeverage: 50,
		venueSymbol: "LINKUSDT"
	}
];
var SKIP = /* @__PURE__ */ new Set([
	"usdt",
	"usdc",
	"dai",
	"fdusd",
	"usde",
	"usds",
	"busd",
	"tusd",
	"pyusd",
	"wbtc",
	"steth",
	"wsteth",
	"weeth",
	"cbbtc",
	"weth"
]);
function toAssets(rows, minMcap) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const r of rows) {
		const base = r.symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
		if (!base || base.length > 12) continue;
		if (SKIP.has(base.toLowerCase())) continue;
		if (seen.has(base)) continue;
		if (minMcap > 0 && (!r.marketCap || r.marketCap < minMcap)) continue;
		seen.add(base);
		const symbol = `${base}USDT`;
		out.push({
			symbol,
			base,
			name: r.name,
			marketCapUsd: r.marketCap,
			volume24hUsd: r.volume ?? 0,
			maxLeverage: defaultMaxLeverage(symbol),
			venueSymbol: symbol
		});
	}
	return out;
}
async function fromCoinGecko(minMcap) {
	const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false", {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(4e3)
	});
	if (!res.ok) throw new Error("coingecko");
	const rows = await res.json();
	if (!Array.isArray(rows)) throw new Error("coingecko shape");
	return toAssets(rows.map((r) => ({
		symbol: r.symbol,
		name: r.name,
		marketCap: r.market_cap,
		volume: r.total_volume ?? 0
	})), minMcap);
}
async function fromCoinPaprika(minMcap) {
	const res = await fetch("https://api.coinpaprika.com/v1/tickers?quotes=USD", {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(12e3)
	});
	if (!res.ok) throw new Error("coinpaprika");
	const rows = await res.json();
	if (!Array.isArray(rows)) throw new Error("coinpaprika shape");
	return toAssets([...rows].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999)).slice(0, 250).map((r) => ({
		symbol: r.symbol,
		name: r.name,
		marketCap: Number(r.quotes?.USD?.market_cap ?? 0),
		volume: Number(r.quotes?.USD?.volume_24h ?? 0)
	})), minMcap);
}
/** Names + market caps only — never the tradeable set. The venue book is the source of truth. */
async function fetchUniverse(minMcap) {
	for (const src of [fromCoinGecko, fromCoinPaprika]) try {
		const out = await src(minMcap);
		if (out.length >= 8) return out;
	} catch {}
	return FALLBACK.filter((a) => minMcap <= 0 || a.marketCapUsd >= minMcap);
}
async function metaByBase() {
	const map = /* @__PURE__ */ new Map();
	try {
		const assets = await fetchUniverse(0);
		for (const a of assets) map.set(a.base, {
			name: a.name,
			marketCapUsd: a.marketCapUsd,
			volume24hUsd: a.volume24hUsd
		});
	} catch {
		for (const a of FALLBACK) map.set(a.base, {
			name: a.name,
			marketCapUsd: a.marketCapUsd,
			volume24hUsd: a.volume24hUsd
		});
	}
	return map;
}
/** Every listed perp on the connected venue. Paper = Aster perps. Cap filter is applied by the caller. */
async function fetchVenueUniverse(venue, force = false) {
	const listed = await fetchListedMarkets(venue, force);
	const meta = await metaByBase().catch(() => /* @__PURE__ */ new Map());
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of listed) {
		const base = coinOf(row.base) || row.base;
		if (!base || seen.has(base)) continue;
		seen.add(base);
		const m = meta.get(base);
		out.push({
			symbol: row.symbol,
			base,
			name: m?.name ?? base,
			marketCapUsd: m?.marketCapUsd ?? 0,
			volume24hUsd: row.volume24hUsd || m?.volume24hUsd || 0,
			maxLeverage: row.maxLeverage > 0 ? row.maxLeverage : 0,
			venueSymbol: row.venueSymbol || row.symbol
		});
	}
	out.sort((a, b) => b.marketCapUsd - a.marketCapUsd || a.base.localeCompare(b.base));
	return out;
}
/** 0 = no floor (trade every listed perp). Unknown caps are kept only when no coin has cap data. */
function filterByMinCap(assets, minMcap, capOf) {
	const floor = Number(minMcap);
	if (!Number.isFinite(floor) || floor <= 0) return assets;
	if (!assets.filter((a) => capOf(a) > 0).length) return assets;
	return assets.filter((a) => capOf(a) >= floor);
}
function minCapUsd(raw) {
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return 0;
	return n;
}
var cache = /* @__PURE__ */ new Map();
/** Cache is keyed by venue + bar-open so a Hyperliquid close never reuses a Binance candle. */
async function fetchKlinesCached(symbol, tf, limit = 360, venue = "paper") {
	const ms = TF_MS[tf];
	const key = `${venue}:${symbol}:${tf}:${limit}:${Math.floor(Date.now() / ms)}`;
	const hit = cache.get(key);
	if (hit) return hit.bars;
	const bars = await fetchVenueKlines(venue, symbol, tf, limit);
	if (bars.length) cache.set(key, {
		at: Date.now(),
		bars
	});
	if (cache.size > 4e3) {
		const first = cache.keys().next().value;
		if (first) cache.delete(first);
	}
	return bars;
}
/** Wilder RMA — matches Pine `ta.rma` / `ta.atr` smoothing. */
function rma(src, length) {
	const out = new Array(src.length).fill(NaN);
	if (length <= 0 || src.length === 0) return out;
	let sum = 0;
	let seeded = false;
	let prev = 0;
	for (let i = 0; i < src.length; i++) {
		const v = src[i];
		if (!Number.isFinite(v)) continue;
		if (!seeded) {
			sum += v;
			if (i + 1 === length) {
				prev = sum / length;
				out[i] = prev;
				seeded = true;
			}
			continue;
		}
		prev = (prev * (length - 1) + v) / length;
		out[i] = prev;
	}
	return out;
}
function ema(src, length) {
	const out = new Array(src.length).fill(NaN);
	if (length <= 0) return out;
	const k = 2 / (length + 1);
	let prev = NaN;
	let sum = 0;
	for (let i = 0; i < src.length; i++) {
		const v = src[i];
		if (!Number.isFinite(v)) continue;
		if (!Number.isFinite(prev)) {
			sum += v;
			if (i + 1 >= length) {
				prev = sum / length;
				out[i] = prev;
			}
			continue;
		}
		prev = v * k + prev * (1 - k);
		out[i] = prev;
	}
	return out;
}
function sma(src, length) {
	const out = new Array(src.length).fill(NaN);
	let sum = 0;
	for (let i = 0; i < src.length; i++) {
		const v = src[i];
		sum += Number.isFinite(v) ? v : 0;
		if (i >= length) {
			const old = src[i - length];
			sum -= Number.isFinite(old) ? old : 0;
		}
		if (i >= length - 1) out[i] = sum / length;
	}
	return out;
}
function trueRange(high, low, close) {
	const tr = new Array(high.length).fill(NaN);
	for (let i = 0; i < high.length; i++) {
		if (i === 0) {
			tr[i] = high[i] - low[i];
			continue;
		}
		const hl = high[i] - low[i];
		const hc = Math.abs(high[i] - close[i - 1]);
		const lc = Math.abs(low[i] - close[i - 1]);
		tr[i] = Math.max(hl, hc, lc);
	}
	return tr;
}
function atr(high, low, close, length) {
	return rma(trueRange(high, low, close), length);
}
/** Weighted custom ATR from the Pine scripts. */
function customAtr(high, low, close) {
	const a5 = atr(high, low, close, 5);
	const a10 = atr(high, low, close, 10);
	const a21 = atr(high, low, close, 21);
	const a66 = atr(high, low, close, 66);
	const a132 = atr(high, low, close, 132);
	const a264 = atr(high, low, close, 264);
	const out = new Array(high.length).fill(NaN);
	for (let i = 0; i < high.length; i++) {
		const v = (a5[i] * 1 + a10[i] * 1 + a21[i] * 2 + a66[i] * 3 + a132[i] * 5 + a264[i] * 8) / 20;
		out[i] = v;
	}
	return out;
}
/** Pine `ta.dmi(len, adxLen)` → [pdi, mdi, adx] */
function dmi(high, low, close, len = 14, adxLen = 14) {
	const n = high.length;
	const plusDM = new Array(n).fill(0);
	const minusDM = new Array(n).fill(0);
	for (let i = 1; i < n; i++) {
		const up = high[i] - high[i - 1];
		const down = low[i - 1] - low[i];
		plusDM[i] = up > down && up > 0 ? up : 0;
		minusDM[i] = down > up && down > 0 ? down : 0;
	}
	const tr = rma(trueRange(high, low, close), len);
	const pdm = rma(plusDM, len);
	const mdm = rma(minusDM, len);
	const pdi = new Array(n).fill(NaN);
	const mdi = new Array(n).fill(NaN);
	const dx = new Array(n).fill(NaN);
	for (let i = 0; i < n; i++) {
		const t = tr[i];
		if (!Number.isFinite(t) || t === 0) continue;
		pdi[i] = 100 * pdm[i] / t;
		mdi[i] = 100 * mdm[i] / t;
		const den = pdi[i] + mdi[i];
		if (den === 0) dx[i] = 0;
		else dx[i] = 100 * Math.abs(pdi[i] - mdi[i]) / den;
	}
	return {
		pdi,
		mdi,
		adx: rma(dx, adxLen)
	};
}
function resample(bars, tfMs) {
	const out = [];
	let cur = null;
	let bucket = -1;
	for (const b of bars) {
		const k = Math.floor(b.time / tfMs) * tfMs;
		if (k !== bucket) {
			if (cur) out.push(cur);
			bucket = k;
			cur = {
				time: k,
				open: b.open,
				high: b.high,
				low: b.low,
				close: b.close,
				volume: b.volume
			};
		} else if (cur) {
			cur.high = Math.max(cur.high, b.high);
			cur.low = Math.min(cur.low, b.low);
			cur.close = b.close;
			cur.volume += b.volume;
		}
	}
	if (cur) out.push(cur);
	return out;
}
/**
* Pine `request.security(..., lookahead_off)`: the HTF bar is only visible
* on the LTF bar whose close is at or after that HTF close.
* `ltfCloseTime` = LTF open + LTF duration. `htfMs` = HTF duration.
*/
function htfAt(times, values, ltfCloseTime, htfMs) {
	if (!times.length || !Number.isFinite(htfMs) || htfMs <= 0) return NaN;
	let lo = 0;
	let hi = times.length - 1;
	let idx = -1;
	while (lo <= hi) {
		const mid = lo + hi >> 1;
		if (times[mid] + htfMs <= ltfCloseTime + 1) {
			idx = mid;
			lo = mid + 1;
		} else hi = mid - 1;
	}
	return idx >= 0 ? values[idx] : NaN;
}
var EPS$4 = 1e-10;
function cType$3(rng, catr) {
	const r = rng / Math.max(catr, EPS$4);
	if (r < .8) return 0;
	if (r <= 1.2) return 1;
	if (r <= 2.5) return 2;
	return 3;
}
function lastThird$3(bearish, close, high, low) {
	const third = Math.max(high - low, EPS$4) / 3;
	return bearish ? close <= low + third : close >= high - third;
}
/**
* Pine: `for i = fromOff to toOff` with default step +1.
* If origin offset > cover offset the loop does not run — match TradingView.
*/
function threeMasters$3(fromOff, toOff, wantHigh, i, bars, catr) {
	let run = 0;
	let lastExt = wantHigh ? -0x56bc75e2d63100000 : 0x56bc75e2d63100000;
	for (let off = fromOff; off <= toOff; off++) {
		const idx = i - off;
		if (idx < 0) continue;
		const bar = bars[idx];
		const rng = Math.max(bar.high - bar.low, EPS$4);
		const body = Math.abs(bar.close - bar.open);
		const upSh = bar.high - Math.max(bar.close, bar.open);
		const dnSh = Math.min(bar.close, bar.open) - bar.low;
		const masterish = cType$3(rng, catr[idx]) === 1 && (body / rng >= .8 || Math.max(upSh, dnSh) / rng >= .8);
		const dirOk = wantHigh ? bar.close > bar.open : bar.close < bar.open;
		if (masterish && dirOk) {
			const ext = wantHigh ? bar.high : bar.low;
			if (wantHigh) {
				if (ext > lastExt) {
					run += 1;
					lastExt = ext;
				} else {
					run = 1;
					lastExt = Math.max(lastExt, ext);
				}
			} else if (ext < lastExt) {
				run += 1;
				lastExt = ext;
			} else {
				run = 1;
				lastExt = Math.min(lastExt, ext);
			}
			if (run >= 3) return true;
		} else run = 0;
	}
	return false;
}
function originLowOff$3(eOff, look, i, bars) {
	let mn = bars[i - eOff].low;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].low;
		if (v < mn) {
			mn = v;
			idx = off;
		}
	}
	return idx;
}
function originHighOff$3(eOff, look, i, bars) {
	let mx = bars[i - eOff].high;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].high;
		if (v > mx) {
			mx = v;
			idx = off;
		}
	}
	return idx;
}
function moveOkUp$3(eOff, i, bars, catr, p) {
	const orig = originLowOff$3(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	const o = i - orig;
	return bars[e].high - bars[o].low >= p.minLegAtr * catr[e] || threeMasters$3(orig, eOff, true, i, bars, catr);
}
function moveOkDn$3(eOff, i, bars, catr, p) {
	const orig = originHighOff$3(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	return bars[i - orig].high - bars[e].low >= p.minLegAtr * catr[e] || threeMasters$3(orig, eOff, false, i, bars, catr);
}
function coverHighAt$3(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.high;
	const inner = Math.min(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS$4);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType$3(rngE, catr[e]) === 1 && bar.close > bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType$3(rngE, catr[e]) >= 2;
	const line = master ? bar.low : longish ? bar.high - catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkUp$3(eOff, i, bars, catr, p)) {
		if (cur.close < line && (!p.needThird || lastThird$3(true, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function coverLowAt$3(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.low;
	const inner = Math.max(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS$4);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType$3(rngE, catr[e]) === 1 && bar.close < bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType$3(rngE, catr[e]) >= 2;
	const line = master ? bar.high : longish ? bar.low + catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkDn$3(eOff, i, bars, catr, p)) {
		if (cur.close > line && (!p.needThird || lastThird$3(false, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function lowestSince$3(i, len, bars) {
	let mn = bars[i].low;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].low);
	}
	return mn;
}
function highestSince$3(i, len, bars) {
	let mx = bars[i].high;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].high);
	}
	return mx;
}
function highestCloseSince$3(i, len, bars) {
	let mx = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].close);
	}
	return mx;
}
function lowestCloseSince$3(i, len, bars) {
	let mn = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].close);
	}
	return mn;
}
function roomR$3(dir, extreme, slDist, resPx, supPx) {
	if (slDist <= 0) return 0;
	if (dir === 1) {
		let best = 0x56bc75e2d63100000;
		for (const px of resPx) if (px > extreme && px < best) best = px;
		if (best < 0x56bc75e2d63100000) return (best - extreme) / slDist;
		return 99;
	}
	let best = -0x56bc75e2d63100000;
	for (const px of supPx) if (px < extreme && px > best) best = px;
	if (best > -0x56bc75e2d63100000) return (extreme - best) / slDist;
	return 99;
}
/**
* APEX 1R / 1.5R / 2R — second-test reversals. Size floor. First-touch skipped.
* Direct port of the three published Pine scripts; only the auto-gate Profile differs.
*/
function runReversalEngine(bars, series, profile, clock) {
	const n = bars.length;
	const signals = [];
	const { catr, ema21, ema84, ema200, pdi, mdi, volSma, htfTimes, htfClose, htfEma, htf2Times, htf2Close, htf2Ema } = series;
	const resPx = [];
	const resAtr = [];
	const resBar = [];
	const supPx = [];
	const supAtr = [];
	const supBar = [];
	let armFtc = NaN;
	let armSl = NaN;
	let armDir = 0;
	let armAge = 0;
	let armCover = 0;
	let lastFill = -9999;
	let lastBias = "FLAT";
	let lastArmed = null;
	for (let i = 2; i < n; i++) {
		const bar = bars[i];
		const a = catr[i];
		const atrOk = Number.isFinite(a) && a > 0;
		let newHighPivot = false;
		let newLowPivot = false;
		let highExt = NaN;
		let highIn = NaN;
		let lowExt = NaN;
		let lowIn = NaN;
		let highOff = 1;
		let lowOff = 1;
		if (atrOk) {
			const cH1 = coverHighAt$3(1, i, bars, catr, profile);
			const cH2 = coverHighAt$3(2, i, bars, catr, profile);
			const cL1 = coverLowAt$3(1, i, bars, catr, profile);
			const cL2 = coverLowAt$3(2, i, bars, catr, profile);
			newHighPivot = cH1.ok || profile.coverMax >= 2 && cH2.ok && !cH1.ok;
			newLowPivot = cL1.ok || profile.coverMax >= 2 && cL2.ok && !cL1.ok;
			highExt = cH1.ok ? cH1.extreme : cH2.extreme;
			highIn = cH1.ok ? cH1.inner : cH2.inner;
			lowExt = cL1.ok ? cL1.extreme : cL2.extreme;
			lowIn = cL1.ok ? cL1.inner : cL2.inner;
			highOff = cH1.ok ? 1 : 2;
			lowOff = cL1.ok ? 1 : 2;
			if (newHighPivot && newLowPivot) {
				if (highExt - highIn >= lowIn - lowExt) newLowPivot = false;
				else newHighPivot = false;
			}
		}
		let isReversalHigh = false;
		let isReversalLow = false;
		if (newHighPivot) {
			let highMatches = 0;
			let firstAway = 0;
			let firstBroken = true;
			let firstA = 0;
			let got = false;
			for (let k = resPx.length - 1; k >= 0; k--) {
				const px = resPx[k];
				const pa = resAtr[k];
				const b = resBar[k];
				const band = profile.bandAtr * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(highExt - px) <= band && age >= 4) {
					highMatches += 1;
					if (!got) {
						const look = Math.min(300, age);
						firstAway = px - lowestSince$3(i, look, bars);
						firstBroken = highestCloseSince$3(i, look, bars) > px + .2 * pa;
						firstA = pa;
						got = true;
					}
				}
			}
			if (got && firstAway >= profile.minAwayAtr * firstA && !firstBroken && highMatches >= profile.minTests) isReversalHigh = true;
			resPx.push(highExt);
			resAtr.push(a);
			resBar.push(i);
			if (resPx.length > 40) {
				resPx.shift();
				resAtr.shift();
				resBar.shift();
			}
		}
		if (newLowPivot) {
			let lowMatches = 0;
			let firstAway = 0;
			let firstBroken = true;
			let firstA = 0;
			let got = false;
			for (let k = supPx.length - 1; k >= 0; k--) {
				const px = supPx[k];
				const pa = supAtr[k];
				const b = supBar[k];
				const band = profile.bandAtr * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(lowExt - px) <= band && age >= 4) {
					lowMatches += 1;
					if (!got) {
						const look = Math.min(300, age);
						firstAway = highestSince$3(i, look, bars) - px;
						firstBroken = lowestCloseSince$3(i, look, bars) < px - .2 * pa;
						firstA = pa;
						got = true;
					}
				}
			}
			if (got && firstAway >= profile.minAwayAtr * firstA && !firstBroken && lowMatches >= profile.minTests) isReversalLow = true;
			supPx.push(lowExt);
			supAtr.push(a);
			supBar.push(i);
			if (supPx.length > 40) {
				supPx.shift();
				supAtr.shift();
				supBar.shift();
			}
		}
		const ltfClose = bar.time + clock.barMs;
		const htfC = htfAt(htfTimes, htfClose, ltfClose, clock.htfMs);
		const htfE = htfAt(htfTimes, htfEma, ltfClose, clock.htfMs);
		const htf2C = htfAt(htf2Times, htf2Close, ltfClose, clock.htf2Ms);
		const htf2E = htfAt(htf2Times, htf2Ema, ltfClose, clock.htf2Ms);
		const htfLongOk = !profile.useHtf || !Number.isFinite(htfE) || htfC >= htfE * .997;
		const htfShortOk = !profile.useHtf || !Number.isFinite(htfE) || htfC <= htfE * 1.003;
		const htf2LongOk = !profile.useHtf2 || !Number.isFinite(htf2E) || htf2C >= htf2E;
		const htf2ShortOk = !profile.useHtf2 || !Number.isFinite(htf2E) || htf2C <= htf2E;
		if (atrOk) {
			const arm = (dir, extreme, inner) => {
				const slBuf = profile.slAtrMult * a;
				let sl = dir === 1 ? extreme - slBuf : extreme + slBuf;
				let ftc = (extreme + inner) * .5;
				ftc = dir === 1 ? Math.max(ftc, extreme + .2 * a) : Math.min(ftc, extreme - .2 * a);
				let slDist = Math.abs(ftc - sl);
				const minDist = ftc * profile.minStopPct * .01;
				let sizeOk = true;
				if (slDist < minDist) {
					if (profile.widenStop) {
						slDist = minDist;
						sl = dir === 1 ? ftc - slDist : ftc + slDist;
					} else sizeOk = false;
				}
				const rm = roomR$3(dir, extreme, slDist, resPx, supPx);
				return {
					ok: sizeOk && rm >= profile.minRoomR && i - lastFill >= profile.cooldownBars,
					ftc,
					sl
				};
			};
			if (isReversalHigh && htfShortOk && htf2ShortOk) {
				const r = arm(-1, highExt, highIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = -1;
					armAge = 0;
					armCover = highOff;
				}
			}
			if (isReversalLow && htfLongOk && htf2LongOk) {
				const r = arm(1, lowExt, lowIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = 1;
					armAge = 0;
					armCover = lowOff;
				}
			}
		}
		const rng = Math.max(bar.high - bar.low, EPS$4);
		const br = Math.abs(bar.close - bar.open) / rng;
		const e21 = ema21[i];
		const e84 = ema84[i];
		const e200 = ema200[i];
		const regimeLong = !profile.useEma84 || !Number.isFinite(e84) || bar.close >= e84;
		const regimeShort = !profile.useEma84 || !Number.isFinite(e84) || bar.close <= e84;
		const stackUp = !profile.emaStack || e21 > e84 && bar.close > e84 && bar.close > e200;
		const stackDown = !profile.emaStack || e21 < e84 && bar.close < e84 && bar.close < e200;
		const diLong = !profile.requireDI || Number.isFinite(pdi[i]) && Number.isFinite(mdi[i]) && pdi[i] > mdi[i];
		const diShort = !profile.requireDI || Number.isFinite(pdi[i]) && Number.isFinite(mdi[i]) && mdi[i] > pdi[i];
		const bodyOk = br >= profile.minBr;
		const coverOk = !profile.requireCover1 || armCover === 1;
		const vs = volSma[i];
		const volOk = profile.minVol <= 0 || !Number.isFinite(vs) || vs <= 0 || bar.volume >= profile.minVol * vs;
		if (Number.isFinite(armFtc)) {
			armAge += 1;
			const invalidated = armDir === 1 ? bar.low <= armSl : bar.high >= armSl;
			const tagged = armDir === 1 ? bar.low <= armFtc : bar.high >= armFtc;
			if (invalidated) {
				armFtc = NaN;
				armDir = 0;
			} else if (tagged) {
				const confL = !profile.confirmCl || bar.close > armFtc;
				const confS = !profile.confirmCl || bar.close < armFtc;
				let filled = false;
				if (i >= 266) {
					if (armDir === 1 && confL && bodyOk && coverOk && volOk && regimeLong && stackUp && diLong && profile.sides !== "Short") {
						const slDist = Math.abs(armFtc - armSl);
						signals.push({
							barIndex: i,
							barTime: bar.time,
							indicator: profile.name,
							side: "long",
							entry: armFtc,
							sl: armSl,
							tp: armFtc + profile.rr * slDist,
							rr: profile.rr,
							atr: a,
							reason: `APEX ${profile.rr}R second-test support · FTC tag`
						});
						filled = true;
					}
					if (armDir === -1 && confS && bodyOk && coverOk && volOk && regimeShort && stackDown && diShort && profile.sides !== "Long") {
						const slDist = Math.abs(armFtc - armSl);
						signals.push({
							barIndex: i,
							barTime: bar.time,
							indicator: profile.name,
							side: "short",
							entry: armFtc,
							sl: armSl,
							tp: armFtc - profile.rr * slDist,
							rr: profile.rr,
							atr: a,
							reason: `APEX ${profile.rr}R second-test resistance · FTC tag`
						});
						filled = true;
					}
				}
				if (filled) lastFill = i;
				armFtc = NaN;
				armDir = 0;
			} else if (armAge >= profile.ftcWait) {
				armFtc = NaN;
				armDir = 0;
			}
		}
		lastBias = Number.isFinite(e21) && Number.isFinite(e84) && e21 > e84 && (!profile.useHtf || htfC > htfE) ? "LONG" : Number.isFinite(e21) && Number.isFinite(e84) && e21 < e84 && (!profile.useHtf || htfC < htfE) ? "SHORT" : "FLAT";
		lastArmed = Number.isFinite(armFtc) ? armDir === 1 ? "LONG" : "SHORT" : null;
	}
	const last = bars[n - 1];
	return {
		signals,
		lastAtr: n ? catr[n - 1] : NaN,
		lastClose: last ? last.close : NaN,
		lastBias,
		armed: lastArmed
	};
}
var EPS$3 = 1e-10;
var LOG14 = Math.log10(14);
function is5(tf) {
	return tf === "5m";
}
function is15(tf) {
	return tf === "15m";
}
function is1h(tf) {
	return tf === "1h";
}
/** 5m Aegis/Vesper/Orion lock the 15m box with these params (Pine request.security). */
var HTF_LOCK_5M = {
	boxLen: 16,
	minCompress: 3,
	minAge: 1,
	unlockBars: 10,
	adxMax: 30,
	squeeze: 1.05,
	chopMin: 38,
	emaSepMax: 1.8,
	minRangeAtr: .9,
	maxRangeAtr: 5.5,
	breakAtr: .1,
	adxKill: 32,
	useSqueeze: true
};
function aegisLock(tf) {
	if (is5(tf)) return { ...HTF_LOCK_5M };
	return {
		boxLen: is15(tf) ? 20 : is1h(tf) ? 16 : 14,
		minCompress: 3,
		minAge: 1,
		unlockBars: 12,
		adxMax: 32,
		squeeze: 1.1,
		chopMin: 36,
		emaSepMax: 2.2,
		minRangeAtr: .8,
		maxRangeAtr: 6,
		breakAtr: .1,
		adxKill: 32,
		useSqueeze: true
	};
}
function aegisFillGates(tf, rr) {
	let fillCloseLoc = .62;
	let maxSlFrac = .32;
	let fillMinBody = 0;
	let fillRequirePoke = false;
	let fillChopMin = 0;
	let minBoxPct = 0;
	if (is5(tf)) {
		if (rr >= 1.9) {
			fillCloseLoc = .74;
			maxSlFrac = .16;
			fillMinBody = .28;
			fillChopMin = 50;
		} else if (rr >= 1.4) {
			fillCloseLoc = .74;
			maxSlFrac = .16;
			fillMinBody = .24;
			fillChopMin = 46;
		} else {
			fillCloseLoc = .76;
			maxSlFrac = .2;
			fillRequirePoke = true;
		}
	} else if (is15(tf)) {
		if (rr >= 1.9) {
			fillCloseLoc = .8;
			maxSlFrac = .16;
			fillMinBody = .18;
		} else if (rr >= 1.4) {
			fillCloseLoc = .8;
			maxSlFrac = .32;
			fillMinBody = .16;
			minBoxPct = .018;
		} else {
			fillCloseLoc = .62;
			maxSlFrac = .24;
			fillMinBody = .16;
			fillRequirePoke = true;
		}
	} else if (is1h(tf)) {
		if (rr >= 1.9) {
			fillCloseLoc = .74;
			maxSlFrac = .32;
			fillMinBody = .16;
		} else if (rr >= 1.4) {
			fillCloseLoc = .74;
			maxSlFrac = .32;
		} else {
			fillCloseLoc = .62;
			maxSlFrac = .28;
		}
	} else {
		fillCloseLoc = .62;
		maxSlFrac = .32;
	}
	return {
		fillCloseLoc,
		maxSlFrac,
		fillMinBody,
		fillRequirePoke,
		fillChopMin,
		minBoxPct
	};
}
/**
* HALCYON Aegis (1.0R) / Vesper (1.5R) / Orion (2.0R) — same lock + FTC spring.
* Quality is the fill. 5m fades a locked 15-minute box, lookahead_off.
*/
function aegisProfile(name, tf, rr) {
	const lock = aegisLock(tf);
	const fill = aegisFillGates(tf, rr);
	return {
		name,
		rr,
		sides: "Both",
		useHtfLock: is5(tf),
		qualityFill: true,
		boxLen: lock.boxLen,
		minCompress: lock.minCompress,
		minAge: lock.minAge,
		unlockBars: lock.unlockBars,
		adxMax: lock.adxMax,
		squeeze: lock.squeeze,
		chopMin: lock.chopMin,
		emaSepMax: lock.emaSepMax,
		minRangeAtr: lock.minRangeAtr,
		maxRangeAtr: lock.maxRangeAtr,
		ftcWait: is5(tf) ? 18 : 10,
		cooldownBars: 2,
		slAtrMult: .14,
		minStopPct: is5(tf) ? .003 : .0032,
		minTpPct: is5(tf) ? .003 : .005,
		bufferFrac: .03,
		maxTpBoxFrac: .7,
		maxSlFrac: fill.maxSlFrac,
		edgePct: .2,
		awayPct: .28,
		entryMaxPct: .32,
		maxPokeAtr: .55,
		breakAtr: .1,
		adxKill: 32,
		volMax: is5(tf) ? 3 : 9,
		useSqueeze: true,
		requireInside: true,
		fillCloseLoc: fill.fillCloseLoc,
		fillMinBody: fill.fillMinBody,
		fillRequirePoke: fill.fillRequirePoke,
		fillChopMin: fill.fillChopMin,
		minBoxPct: fill.minBoxPct
	};
}
/**
* Original HALCYON Coil (رنج.txt) — native box per TF, 2.2R must fit.
* Auto profile: 5m / 15m / 1H / 4H. No HTF fade.
*/
function originalCoilProfile(tf) {
	let boxLen = 16;
	let minCompress = 4;
	let adxMax = 26;
	let fillCloseLoc = .62;
	let volMax = 9;
	if (tf === "5m") {
		boxLen = 24;
		minCompress = 6;
		adxMax = 20;
		fillCloseLoc = .78;
		volMax = 1.6;
	} else if (tf === "15m") {
		boxLen = 20;
		minCompress = 5;
		adxMax = 26;
		fillCloseLoc = .62;
		volMax = 1.8;
	} else if (tf === "1h") {
		boxLen = 16;
		minCompress = 4;
		adxMax = 26;
		fillCloseLoc = .62;
		volMax = 9;
	} else {
		boxLen = 16;
		minCompress = 4;
		adxMax = 26;
		fillCloseLoc = .62;
		volMax = 9;
	}
	return {
		name: "HALC",
		rr: 2.2,
		sides: "Both",
		useHtfLock: false,
		qualityFill: false,
		boxLen,
		minCompress,
		minAge: 2,
		unlockBars: 8,
		adxMax,
		squeeze: .95,
		chopMin: 42,
		emaSepMax: 1.5,
		minRangeAtr: 1.1,
		maxRangeAtr: 4.4,
		ftcWait: 6,
		cooldownBars: 3,
		slAtrMult: .14,
		minStopPct: .0032,
		minTpPct: 0,
		bufferFrac: .03,
		maxTpBoxFrac: 1,
		maxSlFrac: .38,
		edgePct: .2,
		awayPct: .28,
		entryMaxPct: .32,
		maxPokeAtr: .55,
		breakAtr: .1,
		adxKill: 32,
		volMax,
		useSqueeze: true,
		requireInside: false,
		fillCloseLoc,
		fillMinBody: 0,
		fillRequirePoke: false,
		fillChopMin: 0,
		minBoxPct: 0
	};
}
function coilProfile(name, tf) {
	if (name === "HAEG") return aegisProfile(name, tf, 1);
	if (name === "HVES") return aegisProfile(name, tf, 1.5);
	if (name === "HORI") return aegisProfile(name, tf, 2);
	return originalCoilProfile(tf);
}
function indicators(bars) {
	const high = bars.map((b) => b.high);
	const low = bars.map((b) => b.low);
	const close = bars.map((b) => b.close);
	const vol = bars.map((b) => b.volume);
	const catr = customAtr(high, low, close);
	const atr14 = atr(high, low, close, 14);
	const atr100 = atr(high, low, close, 100);
	const atrRatio = atr14.map((a, i) => a / Math.max(atr100[i], 1e-12));
	const ema21 = ema(close, 21);
	const ema84 = ema(close, 84);
	const { adx } = dmi(high, low, close, 14, 14);
	const tr = trueRange(high, low, close);
	const chop = new Array(bars.length).fill(NaN);
	let trSum = 0;
	for (let i = 0; i < bars.length; i++) {
		trSum += Number.isFinite(tr[i]) ? tr[i] : 0;
		if (i >= 14) trSum -= Number.isFinite(tr[i - 14]) ? tr[i - 14] : 0;
		if (i < 13) continue;
		let hh = -Infinity;
		let ll = Infinity;
		for (let k = 0; k < 14; k++) {
			const b = bars[i - k];
			if (b.high > hh) hh = b.high;
			if (b.low < ll) ll = b.low;
		}
		const den = Math.max(hh - ll, 1e-10);
		chop[i] = 100 * Math.log10(Math.max(trSum, 1e-10) / den) / LOG14;
	}
	return {
		catr,
		atrRatio,
		ema21,
		ema84,
		adx,
		chop,
		volSma: sma(vol, 20)
	};
}
function prevWindow(src, i, len, wantHigh) {
	let best = wantHigh ? -Infinity : Infinity;
	let age = 0;
	let found = false;
	for (let k = 1; k <= len; k++) {
		const idx = i - k;
		if (idx < 0) return {
			val: NaN,
			age: NaN
		};
		const v = src[idx];
		if (!found || (wantHigh ? v > best : v < best)) {
			best = v;
			age = k - 1;
			found = true;
		}
	}
	return {
		val: found ? best : NaN,
		age: found ? age : NaN
	};
}
function lockParamsOf(p) {
	return {
		boxLen: p.boxLen,
		minCompress: p.minCompress,
		minAge: p.minAge,
		unlockBars: p.unlockBars,
		adxMax: p.adxMax,
		squeeze: p.squeeze,
		chopMin: p.chopMin,
		emaSepMax: p.emaSepMax,
		minRangeAtr: p.minRangeAtr,
		maxRangeAtr: p.maxRangeAtr,
		breakAtr: p.breakAtr,
		adxKill: p.adxKill,
		useSqueeze: p.useSqueeze
	};
}
/** Pine f_lock_at — var state lives on the series it is called on. */
function lockCoil(bars, ind, p) {
	const n = bars.length;
	const locked = new Array(n).fill(false);
	const lockHi = new Array(n).fill(NaN);
	const lockLo = new Array(n).fill(NaN);
	const high = bars.map((b) => b.high);
	const low = bars.map((b) => b.low);
	let compressRun = 0;
	let unlockRun = 0;
	let isLocked = false;
	let hi = NaN;
	let lo = NaN;
	for (let i = 0; i < n; i++) {
		const boxH = prevWindow(high, i, p.boxLen, true);
		const boxL = prevWindow(low, i, p.boxLen, false);
		const catr = ind.catr[i];
		const adx = ind.adx[i];
		const atrRatio = ind.atrRatio[i];
		const e21 = ind.ema21[i];
		const e84 = ind.ema84[i];
		const chop = ind.chop[i];
		const ht = boxH.val - boxL.val;
		let compressing = false;
		if (Number.isFinite(catr) && catr > 0 && Number.isFinite(ht) && ht > 0) {
			const ha = ht / catr;
			const adxOk = !Number.isFinite(adx) || adx <= p.adxMax;
			const sqOk = !p.useSqueeze || !Number.isFinite(atrRatio) || atrRatio <= p.squeeze;
			const chopOk = !Number.isFinite(chop) || chop >= p.chopMin;
			const emaOk = !Number.isFinite(e21) || !Number.isFinite(e84) || Math.abs(e21 - e84) <= p.emaSepMax * catr;
			const ageOk = Number.isFinite(boxH.age) && Number.isFinite(boxL.age) && boxH.age >= p.minAge && boxL.age >= p.minAge;
			const widthOk = ha >= p.minRangeAtr && ha <= p.maxRangeAtr;
			compressing = adxOk && sqOk && chopOk && emaOk && ageOk && widthOk;
		}
		compressRun = compressing ? compressRun + 1 : 0;
		unlockRun = compressing ? 0 : unlockRun + 1;
		if (!isLocked) {
			if (compressRun >= p.minCompress && Number.isFinite(catr) && catr > 0 && Number.isFinite(boxH.val)) {
				isLocked = true;
				hi = boxH.val;
				lo = boxL.val;
			}
		}
		const height = hi - lo;
		const bar = bars[i];
		const broke = isLocked && Number.isFinite(catr) && (bar.close > hi + p.breakAtr * catr || bar.close < lo - p.breakAtr * catr);
		const adxDead = isLocked && Number.isFinite(adx) && adx >= p.adxKill;
		if (isLocked && (broke || adxDead || unlockRun >= p.unlockBars || !Number.isFinite(height) || height <= 0)) {
			isLocked = false;
			hi = NaN;
			lo = NaN;
		}
		locked[i] = isLocked;
		lockHi[i] = hi;
		lockLo[i] = lo;
	}
	return {
		locked,
		lockHi,
		lockLo
	};
}
function mapHtfLock(ltf, ltfMs, htf, htfMs, locked, hi, lo) {
	const times = htf.map((b) => b.time);
	const lockN = locked.map((v) => v ? 1 : 0);
	const outL = new Array(ltf.length).fill(false);
	const outH = new Array(ltf.length).fill(NaN);
	const outLo = new Array(ltf.length).fill(NaN);
	for (let i = 0; i < ltf.length; i++) {
		const closeTime = ltf[i].time + ltfMs;
		outL[i] = htfAt(times, lockN, closeTime, htfMs) > .5;
		outH[i] = htfAt(times, hi, closeTime, htfMs);
		outLo[i] = htfAt(times, lo, closeTime, htfMs);
	}
	return {
		locked: outL,
		lockHi: outH,
		lockLo: outLo
	};
}
function reasonOf(name, rr, side) {
	return `HALCYON ${name === "HAEG" ? "Aegis" : name === "HVES" ? "Vesper" : name === "HORI" ? "Orion" : "Coil"} ${rr}R coil ${side === "long" ? "support" : "resistance"} · FTC tag`;
}
function fillCoil(bars, ind, locked, lockHi, lockLo, p) {
	const n = bars.length;
	const signals = [];
	let prevLocked = false;
	let loTouches = 0;
	let hiTouches = 0;
	let leftLo = false;
	let leftHi = false;
	let lastFill = -9999;
	let armFtc = NaN;
	let armSl = NaN;
	let armDir = 0;
	let armAge = 0;
	let lastArmed = null;
	for (let i = 0; i < n; i++) {
		const bar = bars[i];
		const coilOn = locked[i] === true && Number.isFinite(lockHi[i]) && Number.isFinite(lockLo[i]);
		const justLocked = coilOn && !prevLocked;
		prevLocked = coilOn;
		if (justLocked) {
			loTouches = 1;
			hiTouches = 1;
			const ht0 = lockHi[i] - lockLo[i];
			leftLo = bar.close >= lockLo[i] + p.awayPct * ht0;
			leftHi = bar.close <= lockHi[i] - p.awayPct * ht0;
			armFtc = NaN;
			armDir = 0;
		}
		if (!coilOn) {
			armFtc = NaN;
			armDir = 0;
			loTouches = 0;
			hiTouches = 0;
			leftLo = false;
			leftHi = false;
			continue;
		}
		const height = lockHi[i] - lockLo[i];
		const rng = Math.max(bar.high - bar.low, EPS$3);
		const closeLocL = (bar.close - bar.low) / rng;
		const closeLocS = (bar.high - bar.close) / rng;
		const body = Math.abs(bar.close - bar.open) / rng;
		const vs = ind.volSma[i];
		const volOk = p.volMax >= 8.5 || !Number.isFinite(vs) || vs <= 0 || bar.volume <= p.volMax * vs;
		const catr = ind.catr[i];
		const chop = ind.chop[i];
		if (!justLocked && Number.isFinite(armFtc) && armDir !== 0) {
			armAge += 1;
			const tagged = armDir === 1 ? bar.low <= armFtc : bar.high >= armFtc;
			const conf = armDir === 1 ? bar.close > armFtc : bar.close < armFtc;
			const locOk = (armDir === 1 ? closeLocL : closeLocS) >= p.fillCloseLoc;
			const invalidated = armDir === 1 ? bar.close < armSl : bar.close > armSl;
			const inside = p.requireInside ? bar.close >= lockLo[i] && bar.close <= lockHi[i] : true;
			const fillSlOk = p.qualityFill ? armDir === 1 ? bar.low > armSl : bar.high < armSl : true;
			const fillPoke = armDir === 1 ? bar.low < lockLo[i] : bar.high > lockHi[i];
			const fillBodyOk = !Number.isFinite(body) || body >= p.fillMinBody;
			const fillPokeOk = !p.fillRequirePoke || fillPoke;
			const fillChopOk = !Number.isFinite(chop) || chop >= p.fillChopMin;
			const sideBlocked = p.sides === (armDir === 1 ? "Short" : "Long");
			if (armAge > p.ftcWait) {
				armFtc = NaN;
				armDir = 0;
			} else if (tagged) {
				if (conf && locOk && inside && fillSlOk && fillBodyOk && fillPokeOk && fillChopOk && !sideBlocked && i >= 266) {
					const risk = Math.abs(armFtc - armSl);
					const tp = armDir === 1 ? armFtc + p.rr * risk : armFtc - p.rr * risk;
					const fit = armDir === 1 ? tp <= lockHi[i] - p.bufferFrac * height : tp >= lockLo[i] + p.bufferFrac * height;
					const near = armDir === 1 ? armFtc - lockLo[i] <= p.entryMaxPct * height : lockHi[i] - armFtc <= p.entryMaxPct * height;
					const tpPct = Math.abs(tp - armFtc) / armFtc;
					const tpBox = Math.abs(tp - armFtc) / height;
					const tpPctOk = !p.qualityFill || tpPct + 1e-12 >= p.minTpPct;
					const tpBoxOk = !p.qualityFill || tpBox <= p.maxTpBoxFrac + 1e-12;
					if (fit && near && risk > 0 && tpPctOk && tpBoxOk && i - lastFill >= p.cooldownBars) {
						const side = armDir === 1 ? "long" : "short";
						signals.push({
							barIndex: i,
							barTime: bar.time,
							indicator: p.name,
							side,
							entry: armFtc,
							sl: armSl,
							tp,
							rr: p.rr,
							atr: catr,
							reason: reasonOf(p.name, p.rr, side)
						});
						lastFill = i;
						if (armDir === 1) leftLo = false;
						else leftHi = false;
					}
				}
				armFtc = NaN;
				armDir = 0;
			} else if (invalidated) {
				armFtc = NaN;
				armDir = 0;
			}
		}
		if (!justLocked && !Number.isFinite(armFtc) && i - lastFill >= p.cooldownBars && Number.isFinite(catr) && catr > 0 && height > 0) {
			const nearLo = bar.low <= lockLo[i] + p.edgePct * height;
			const nearHi = bar.high >= lockHi[i] - p.edgePct * height;
			const pokeLo = bar.low < lockLo[i];
			const pokeHi = bar.high > lockHi[i];
			const pokeOkLo = pokeLo ? lockLo[i] - bar.low <= p.maxPokeAtr * catr : true;
			const pokeOkHi = pokeHi ? bar.high - lockHi[i] <= p.maxPokeAtr * catr : true;
			if (nearLo) loTouches += 1;
			else if (bar.close >= lockLo[i] + p.awayPct * height) leftLo = true;
			if (nearHi) hiTouches += 1;
			else if (bar.close <= lockHi[i] - p.awayPct * height) leftHi = true;
			let goL = leftLo && nearLo && pokeOkLo && volOk && loTouches >= 2 && bar.close >= lockLo[i] && bar.close - lockLo[i] <= p.entryMaxPct * height && closeLocL >= .45;
			let goS = leftHi && nearHi && pokeOkHi && volOk && hiTouches >= 2 && bar.close <= lockHi[i] && lockHi[i] - bar.close <= p.entryMaxPct * height && closeLocS >= .45;
			if (goL && goS) {
				if (bar.close - lockLo[i] <= lockHi[i] - bar.close) goS = false;
				else goL = false;
			}
			const armSide = goL ? 1 : goS ? -1 : 0;
			if (armSide !== 0 && p.sides !== (armSide === 1 ? "Short" : "Long")) {
				const ftc = armSide === 1 ? Math.min(bar.low, lockLo[i]) : Math.max(bar.high, lockHi[i]);
				const minSl = p.minStopPct * ftc;
				let slDist = Math.max(p.slAtrMult * catr, minSl);
				if (p.qualityFill && p.minTpPct > 0) slDist = Math.max(slDist, p.minTpPct * ftc / p.rr);
				const room = armSide === 1 ? lockHi[i] - p.bufferFrac * height - ftc : ftc - (lockLo[i] + p.bufferFrac * height);
				if (room > 0) {
					const maxForRr = room / p.rr;
					if (slDist > maxForRr) slDist = maxForRr;
					const slOk = slDist >= minSl && slDist <= p.maxSlFrac * height;
					const tpDist = p.rr * slDist;
					const tpOk = !p.qualityFill || tpDist / ftc + 1e-12 >= p.minTpPct;
					const tpBoxOk = !p.qualityFill || tpDist / height <= p.maxTpBoxFrac + 1e-12;
					const boxPctOk = !p.qualityFill || height / ftc >= p.minBoxPct;
					if (slOk && tpOk && tpBoxOk && boxPctOk) {
						armFtc = ftc;
						armSl = armSide === 1 ? ftc - slDist : ftc + slDist;
						armDir = armSide;
						armAge = 0;
						lastArmed = armSide === 1 ? "LONG" : "SHORT";
					}
				}
			}
		}
	}
	const last = bars[n - 1];
	return {
		signals,
		lastAtr: ind.catr[n - 1] ?? NaN,
		lastClose: last?.close ?? NaN,
		lastBias: locked[n - 1] ? lastArmed ?? "FLAT" : "FLAT",
		armed: Number.isFinite(armFtc) ? armDir === 1 ? "LONG" : armDir === -1 ? "SHORT" : null : null
	};
}
function runCoilEngine(bars, tf, name, htfBars) {
	const p = coilProfile(name, tf);
	if (!bars.length) return {
		signals: [],
		lastAtr: NaN,
		lastClose: NaN,
		lastBias: "FLAT",
		armed: null
	};
	const native = indicators(bars);
	let locked;
	let lockHi;
	let lockLo;
	if (p.useHtfLock) {
		const htfMs = TF_MS["15m"];
		const htf = htfBars && htfBars.length > 10 ? htfBars : resample(bars, htfMs);
		const raw = lockCoil(htf, indicators(htf), HTF_LOCK_5M);
		const mapped = mapHtfLock(bars, TF_MS[tf], htf, htfMs, raw.locked, raw.lockHi, raw.lockLo);
		locked = mapped.locked;
		lockHi = mapped.lockHi;
		lockLo = mapped.lockLo;
	} else {
		const raw = lockCoil(bars, native, lockParamsOf(p));
		locked = raw.locked;
		lockHi = raw.lockHi;
		lockLo = raw.lockLo;
	}
	return fillCoil(bars, native, locked, lockHi, lockLo, p);
}
var EPS$2 = 1e-10;
var BAND_ATR = .7;
var MIN_AWAY_ATR = 1;
var FTC_MIN_ATR = .2;
var TREX1 = {
	name: "TREX1",
	rr: 1,
	beAtR: .35,
	legLookback: 40,
	minLegAtr: 2,
	coverMax: 2,
	needThird: true,
	useLongbar: true,
	slAtrMult: .35,
	ftcWait: 12,
	minRoomR: 1.2,
	minStopPct: .5,
	minTpPct: .5,
	useHtfEma: true,
	cooldownBars: 2
};
var TREX12 = {
	name: "TREX12",
	rr: 1.2,
	beAtR: .32,
	legLookback: 40,
	minLegAtr: 2.4,
	coverMax: 2,
	needThird: true,
	useLongbar: true,
	slAtrMult: .35,
	ftcWait: 12,
	minRoomR: 1.5,
	minStopPct: .5,
	minTpPct: .5,
	useHtfEma: true,
	cooldownBars: 3
};
function trexProfile(name) {
	return name === "TREX12" ? { ...TREX12 } : { ...TREX1 };
}
function trexBeAtR(name) {
	if (name === "TREX1") return TREX1.beAtR;
	if (name === "TREX12") return TREX12.beAtR;
	return null;
}
function cType$2(rng, catr) {
	const r = rng / Math.max(catr, EPS$2);
	if (r < .8) return 0;
	if (r <= 1.2) return 1;
	if (r <= 2.5) return 2;
	return 3;
}
function lastThird$2(bearish, close, high, low) {
	const third = Math.max(high - low, EPS$2) / 3;
	return bearish ? close <= low + third : close >= high - third;
}
function threeMasters$2(fromOff, toOff, wantHigh, i, bars, catr) {
	let run = 0;
	let lastExt = wantHigh ? -0x56bc75e2d63100000 : 0x56bc75e2d63100000;
	for (let off = fromOff; off <= toOff; off++) {
		const idx = i - off;
		if (idx < 0) continue;
		const bar = bars[idx];
		const rng = Math.max(bar.high - bar.low, EPS$2);
		const body = Math.abs(bar.close - bar.open);
		const upSh = bar.high - Math.max(bar.close, bar.open);
		const dnSh = Math.min(bar.close, bar.open) - bar.low;
		const masterish = cType$2(rng, catr[idx]) === 1 && (body / rng >= .8 || Math.max(upSh, dnSh) / rng >= .8);
		const dirOk = wantHigh ? bar.close > bar.open : bar.close < bar.open;
		if (masterish && dirOk) {
			const ext = wantHigh ? bar.high : bar.low;
			if (wantHigh) {
				if (ext > lastExt) {
					run += 1;
					lastExt = ext;
				} else {
					run = 1;
					lastExt = Math.max(lastExt, ext);
				}
			} else if (ext < lastExt) {
				run += 1;
				lastExt = ext;
			} else {
				run = 1;
				lastExt = Math.min(lastExt, ext);
			}
			if (run >= 3) return true;
		} else run = 0;
	}
	return false;
}
function originLowOff$2(eOff, look, i, bars) {
	let mn = bars[i - eOff].low;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].low;
		if (v < mn) {
			mn = v;
			idx = off;
		}
	}
	return idx;
}
function originHighOff$2(eOff, look, i, bars) {
	let mx = bars[i - eOff].high;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].high;
		if (v > mx) {
			mx = v;
			idx = off;
		}
	}
	return idx;
}
function moveOkUp$2(eOff, i, bars, catr, p) {
	const orig = originLowOff$2(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	const o = i - orig;
	return bars[e].high - bars[o].low >= p.minLegAtr * catr[e] || threeMasters$2(orig, eOff, true, i, bars, catr);
}
function moveOkDn$2(eOff, i, bars, catr, p) {
	const orig = originHighOff$2(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	return bars[i - orig].high - bars[e].low >= p.minLegAtr * catr[e] || threeMasters$2(orig, eOff, false, i, bars, catr);
}
function coverHighAt$2(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.high;
	const inner = Math.min(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS$2);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType$2(rngE, catr[e]) === 1 && bar.close > bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType$2(rngE, catr[e]) >= 2;
	const line = master ? bar.low : longish ? bar.high - catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkUp$2(eOff, i, bars, catr, p)) {
		if (cur.close < line && (!p.needThird || lastThird$2(true, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function coverLowAt$2(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.low;
	const inner = Math.max(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS$2);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType$2(rngE, catr[e]) === 1 && bar.close < bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType$2(rngE, catr[e]) >= 2;
	const line = master ? bar.high : longish ? bar.low + catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkDn$2(eOff, i, bars, catr, p)) {
		if (cur.close > line && (!p.needThird || lastThird$2(false, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function lowestSince$2(i, len, bars) {
	let mn = bars[i].low;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].low);
	}
	return mn;
}
function highestSince$2(i, len, bars) {
	let mx = bars[i].high;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].high);
	}
	return mx;
}
function highestCloseSince$2(i, len, bars) {
	let mx = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].close);
	}
	return mx;
}
function lowestCloseSince$2(i, len, bars) {
	let mn = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].close);
	}
	return mn;
}
function roomR$2(dir, extreme, slDist, resPx, supPx) {
	if (slDist <= 0) return 0;
	if (dir === 1) {
		let best = 0x56bc75e2d63100000;
		for (const px of resPx) if (px > extreme && px < best) best = px;
		if (best < 0x56bc75e2d63100000) return (best - extreme) / slDist;
		return 99;
	}
	let best = -0x56bc75e2d63100000;
	for (const px of supPx) if (px < extreme && px > best) best = px;
	if (best > -0x56bc75e2d63100000) return (extreme - best) / slDist;
	return 99;
}
/**
* TREX Entries Lab — second-test live pivot → RTP into FTC.
* First-touch settlement is skipped. HTF EMA50 alignment.
* Direct port of the two published 15m Pine scripts; only R / BE / room differ.
*/
function runTrexEngine(bars, tf, name, htfBars) {
	const p = trexProfile(name);
	const n = bars.length;
	const signals = [];
	const catr = customAtr(bars.map((b) => b.high), bars.map((b) => b.low), bars.map((b) => b.close));
	const htfTf = HTF_OF[tf];
	const htfMs = TF_MS[htfTf];
	const barMs = TF_MS[tf];
	const htf = htfBars && htfBars.length > 10 ? htfBars : resample(bars, htfMs);
	const htfTimes = htf.map((b) => b.time);
	const htfClose = htf.map((b) => b.close);
	const htfEma50 = ema(htfClose, 50);
	const resPx = [];
	const resAtr = [];
	const resBar = [];
	const supPx = [];
	const supAtr = [];
	const supBar = [];
	let armFtc = NaN;
	let armSl = NaN;
	let armDir = 0;
	let armAge = 0;
	let lastFill = -9999;
	let lastBias = "FLAT";
	let lastArmed = null;
	for (let i = 2; i < n; i++) {
		const bar = bars[i];
		const a = catr[i];
		const atrOk = Number.isFinite(a) && a > 0;
		let newHighPivot = false;
		let newLowPivot = false;
		let highExt = NaN;
		let highIn = NaN;
		let lowExt = NaN;
		let lowIn = NaN;
		if (atrOk) {
			const cH1 = coverHighAt$2(1, i, bars, catr, p);
			const cH2 = coverHighAt$2(2, i, bars, catr, p);
			const cL1 = coverLowAt$2(1, i, bars, catr, p);
			const cL2 = coverLowAt$2(2, i, bars, catr, p);
			newHighPivot = cH1.ok || p.coverMax >= 2 && cH2.ok && !cH1.ok;
			newLowPivot = cL1.ok || p.coverMax >= 2 && cL2.ok && !cL1.ok;
			highExt = cH1.ok ? cH1.extreme : cH2.extreme;
			highIn = cH1.ok ? cH1.inner : cH2.inner;
			lowExt = cL1.ok ? cL1.extreme : cL2.extreme;
			lowIn = cL1.ok ? cL1.inner : cL2.inner;
			if (newHighPivot && newLowPivot) {
				if (highExt - highIn >= lowIn - lowExt) newLowPivot = false;
				else newHighPivot = false;
			}
		}
		let isReversalHigh = false;
		let isReversalLow = false;
		if (newHighPivot) {
			for (let k = resPx.length - 1; k >= 0; k--) {
				const px = resPx[k];
				const pa = resAtr[k];
				const b = resBar[k];
				const band = BAND_ATR * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(highExt - px) <= band && age >= 4) {
					const look = Math.min(300, age);
					const away = px - lowestSince$2(i, look, bars);
					const broken = highestCloseSince$2(i, look, bars) > px + .2 * pa;
					if (away >= MIN_AWAY_ATR * pa && !broken) isReversalHigh = true;
					break;
				}
			}
			resPx.push(highExt);
			resAtr.push(a);
			resBar.push(i);
			if (resPx.length > 40) {
				resPx.shift();
				resAtr.shift();
				resBar.shift();
			}
		}
		if (newLowPivot) {
			for (let k = supPx.length - 1; k >= 0; k--) {
				const px = supPx[k];
				const pa = supAtr[k];
				const b = supBar[k];
				const band = BAND_ATR * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(lowExt - px) <= band && age >= 4) {
					const look = Math.min(300, age);
					const away = highestSince$2(i, look, bars) - px;
					const broken = lowestCloseSince$2(i, look, bars) < px - .2 * pa;
					if (away >= MIN_AWAY_ATR * pa && !broken) isReversalLow = true;
					break;
				}
			}
			supPx.push(lowExt);
			supAtr.push(a);
			supBar.push(i);
			if (supPx.length > 40) {
				supPx.shift();
				supAtr.shift();
				supBar.shift();
			}
		}
		const ltfClose = bar.time + barMs;
		const htfC = htfAt(htfTimes, htfClose, ltfClose, htfMs);
		const htfE = htfAt(htfTimes, htfEma50, ltfClose, htfMs);
		const htfLongOk = !p.useHtfEma || !Number.isFinite(htfE) || htfC >= htfE * .997;
		const htfShortOk = !p.useHtfEma || !Number.isFinite(htfE) || htfC <= htfE * 1.003;
		if (atrOk) {
			const arm = (dir, extreme, inner) => {
				const slBuf = p.slAtrMult * a;
				const sl = dir === 1 ? extreme - slBuf : extreme + slBuf;
				let ftc = (extreme + inner) * .5;
				ftc = dir === 1 ? Math.max(ftc, extreme + FTC_MIN_ATR * a) : Math.min(ftc, extreme - FTC_MIN_ATR * a);
				const slDist = Math.abs(ftc - sl);
				const rm = roomR$2(dir, extreme, slDist, resPx, supPx);
				const stopPctNow = slDist / Math.max(ftc, EPS$2) * 100;
				const tpPctNow = slDist * p.rr / Math.max(ftc, EPS$2) * 100;
				return {
					ok: rm >= p.minRoomR && i - lastFill >= p.cooldownBars && stopPctNow >= p.minStopPct && tpPctNow >= p.minTpPct,
					ftc,
					sl
				};
			};
			if (isReversalHigh && htfShortOk) {
				const r = arm(-1, highExt, highIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = -1;
					armAge = 0;
				}
			}
			if (isReversalLow && htfLongOk) {
				const r = arm(1, lowExt, lowIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = 1;
					armAge = 0;
				}
			}
		}
		if (Number.isFinite(armFtc)) {
			armAge += 1;
			const invalidated = armDir === 1 ? bar.low <= armSl : bar.high >= armSl;
			const tagged = armDir === 1 ? bar.low <= armFtc : bar.high >= armFtc;
			if (invalidated) {
				armFtc = NaN;
				armDir = 0;
			} else if (tagged) {
				if (i >= 266) {
					const slDist = Math.abs(armFtc - armSl);
					if (armDir === 1) signals.push({
						barIndex: i,
						barTime: bar.time,
						indicator: p.name,
						side: "long",
						entry: armFtc,
						sl: armSl,
						tp: armFtc + p.rr * slDist,
						rr: p.rr,
						atr: a,
						beAtR: p.beAtR,
						reason: `TREX ${p.rr}R second-test support · FTC tag · BE@${p.beAtR}R`
					});
					else if (armDir === -1) signals.push({
						barIndex: i,
						barTime: bar.time,
						indicator: p.name,
						side: "short",
						entry: armFtc,
						sl: armSl,
						tp: armFtc - p.rr * slDist,
						rr: p.rr,
						atr: a,
						beAtR: p.beAtR,
						reason: `TREX ${p.rr}R second-test resistance · FTC tag · BE@${p.beAtR}R`
					});
				}
				lastFill = i;
				armFtc = NaN;
				armDir = 0;
			} else if (armAge >= p.ftcWait) {
				armFtc = NaN;
				armDir = 0;
			}
		}
		lastBias = Number.isFinite(htfC) && Number.isFinite(htfE) ? htfC > htfE ? "LONG" : htfC < htfE ? "SHORT" : "FLAT" : "FLAT";
		lastArmed = Number.isFinite(armFtc) ? armDir === 1 ? "LONG" : "SHORT" : null;
	}
	const last = bars[n - 1];
	return {
		signals,
		lastAtr: n ? catr[n - 1] : NaN,
		lastClose: last ? last.close : NaN,
		lastBias,
		armed: lastArmed
	};
}
var EPS$1 = 1e-10;
/** Default `mode = "APEX"` inputs. Do not mix with APEX1/1.5/2 lab gates. */
var KETEX_PROFILE = {
	name: "KETEX",
	rr: 2.2,
	useHtf: true,
	useEma84: true,
	confirmCl: true,
	sides: "Both",
	legLookback: 40,
	minLegAtr: 2.6,
	coverMax: 2,
	needThird: true,
	useLongbar: true,
	slAtrMult: .35,
	ftcWait: 8,
	minRoomR: 2.2,
	cooldownBars: 5,
	bandAtr: .7,
	minAwayAtr: 1
};
function ketexProfile() {
	return { ...KETEX_PROFILE };
}
function cType$1(rng, catr) {
	const r = rng / Math.max(catr, EPS$1);
	if (r < .8) return 0;
	if (r <= 1.2) return 1;
	if (r <= 2.5) return 2;
	return 3;
}
function lastThird$1(bearish, close, high, low) {
	const third = Math.max(high - low, EPS$1) / 3;
	return bearish ? close <= low + third : close >= high - third;
}
function threeMasters$1(fromOff, toOff, wantHigh, i, bars, catr) {
	let run = 0;
	let lastExt = wantHigh ? -0x56bc75e2d63100000 : 0x56bc75e2d63100000;
	for (let off = fromOff; off <= toOff; off++) {
		const idx = i - off;
		if (idx < 0) continue;
		const bar = bars[idx];
		const rng = Math.max(bar.high - bar.low, EPS$1);
		const body = Math.abs(bar.close - bar.open);
		const upSh = bar.high - Math.max(bar.close, bar.open);
		const dnSh = Math.min(bar.close, bar.open) - bar.low;
		const masterish = cType$1(rng, catr[idx]) === 1 && (body / rng >= .8 || Math.max(upSh, dnSh) / rng >= .8);
		const dirOk = wantHigh ? bar.close > bar.open : bar.close < bar.open;
		if (masterish && dirOk) {
			const ext = wantHigh ? bar.high : bar.low;
			if (wantHigh) {
				if (ext > lastExt) {
					run += 1;
					lastExt = ext;
				} else {
					run = 1;
					lastExt = Math.max(lastExt, ext);
				}
			} else if (ext < lastExt) {
				run += 1;
				lastExt = ext;
			} else {
				run = 1;
				lastExt = Math.min(lastExt, ext);
			}
			if (run >= 3) return true;
		} else run = 0;
	}
	return false;
}
function originLowOff$1(eOff, look, i, bars) {
	let mn = bars[i - eOff].low;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].low;
		if (v < mn) {
			mn = v;
			idx = off;
		}
	}
	return idx;
}
function originHighOff$1(eOff, look, i, bars) {
	let mx = bars[i - eOff].high;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].high;
		if (v > mx) {
			mx = v;
			idx = off;
		}
	}
	return idx;
}
function moveOkUp$1(eOff, i, bars, catr, p) {
	const orig = originLowOff$1(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	const o = i - orig;
	return bars[e].high - bars[o].low >= p.minLegAtr * catr[e] || threeMasters$1(orig, eOff, true, i, bars, catr);
}
function moveOkDn$1(eOff, i, bars, catr, p) {
	const orig = originHighOff$1(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	return bars[i - orig].high - bars[e].low >= p.minLegAtr * catr[e] || threeMasters$1(orig, eOff, false, i, bars, catr);
}
function coverHighAt$1(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.high;
	const inner = Math.min(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS$1);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType$1(rngE, catr[e]) === 1 && bar.close > bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType$1(rngE, catr[e]) >= 2;
	const line = master ? bar.low : longish ? bar.high - catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkUp$1(eOff, i, bars, catr, p)) {
		if (cur.close < line && (!p.needThird || lastThird$1(true, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function coverLowAt$1(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.low;
	const inner = Math.max(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS$1);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType$1(rngE, catr[e]) === 1 && bar.close < bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType$1(rngE, catr[e]) >= 2;
	const line = master ? bar.high : longish ? bar.low + catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkDn$1(eOff, i, bars, catr, p)) {
		if (cur.close > line && (!p.needThird || lastThird$1(false, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function lowestSince$1(i, len, bars) {
	let mn = bars[i].low;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].low);
	}
	return mn;
}
function highestSince$1(i, len, bars) {
	let mx = bars[i].high;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].high);
	}
	return mx;
}
function highestCloseSince$1(i, len, bars) {
	let mx = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].close);
	}
	return mx;
}
function lowestCloseSince$1(i, len, bars) {
	let mn = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].close);
	}
	return mn;
}
function roomR$1(dir, extreme, slDist, resPx, supPx) {
	if (slDist <= 0) return 0;
	if (dir === 1) {
		let best = 0x56bc75e2d63100000;
		for (const px of resPx) if (px > extreme && px < best) best = px;
		if (best < 0x56bc75e2d63100000) return (best - extreme) / slDist;
		return 99;
	}
	let best = -0x56bc75e2d63100000;
	for (const px of supPx) if (px < extreme && px > best) best = px;
	if (best > -0x56bc75e2d63100000) return (extreme - best) / slDist;
	return 99;
}
/**
* KETEX — APEX entries (ketex.txt).
* TREX second-test structure + NEXUS quality (HTF EMA21, EMA84 regime, confirm close).
* First-touch skipped. No break-even. Own family — does not mix with APEX / HALCYON / TREX.
*/
function runKetexEngine(bars, tf, htfBars) {
	const p = ketexProfile();
	const n = bars.length;
	const signals = [];
	const high = bars.map((b) => b.high);
	const low = bars.map((b) => b.low);
	const close = bars.map((b) => b.close);
	const catr = customAtr(high, low, close);
	const ema21 = ema(close, 21);
	const ema84 = ema(close, 84);
	const htfTf = HTF_OF[tf];
	const htfMs = TF_MS[htfTf];
	const barMs = TF_MS[tf];
	const htf = htfBars && htfBars.length > 10 ? htfBars : resample(bars, htfMs);
	const htfTimes = htf.map((b) => b.time);
	const htfClose = htf.map((b) => b.close);
	const htfEma = ema(htfClose, 21);
	const resPx = [];
	const resAtr = [];
	const resBar = [];
	const supPx = [];
	const supAtr = [];
	const supBar = [];
	let armFtc = NaN;
	let armSl = NaN;
	let armDir = 0;
	let armAge = 0;
	let lastFill = -9999;
	let lastBias = "FLAT";
	let lastArmed = null;
	for (let i = 2; i < n; i++) {
		const bar = bars[i];
		const a = catr[i];
		const atrOk = Number.isFinite(a) && a > 0;
		let newHighPivot = false;
		let newLowPivot = false;
		let highExt = NaN;
		let highIn = NaN;
		let lowExt = NaN;
		let lowIn = NaN;
		if (atrOk) {
			const cH1 = coverHighAt$1(1, i, bars, catr, p);
			const cH2 = coverHighAt$1(2, i, bars, catr, p);
			const cL1 = coverLowAt$1(1, i, bars, catr, p);
			const cL2 = coverLowAt$1(2, i, bars, catr, p);
			newHighPivot = cH1.ok || p.coverMax >= 2 && cH2.ok && !cH1.ok;
			newLowPivot = cL1.ok || p.coverMax >= 2 && cL2.ok && !cL1.ok;
			highExt = cH1.ok ? cH1.extreme : cH2.extreme;
			highIn = cH1.ok ? cH1.inner : cH2.inner;
			lowExt = cL1.ok ? cL1.extreme : cL2.extreme;
			lowIn = cL1.ok ? cL1.inner : cL2.inner;
			if (newHighPivot && newLowPivot) {
				if (highExt - highIn >= lowIn - lowExt) newLowPivot = false;
				else newHighPivot = false;
			}
		}
		let isReversalHigh = false;
		let isReversalLow = false;
		if (newHighPivot) {
			for (let k = resPx.length - 1; k >= 0; k--) {
				const px = resPx[k];
				const pa = resAtr[k];
				const b = resBar[k];
				const band = p.bandAtr * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(highExt - px) <= band && age >= 4) {
					const look = Math.min(300, age);
					const away = px - lowestSince$1(i, look, bars);
					const broken = highestCloseSince$1(i, look, bars) > px + .2 * pa;
					if (away >= p.minAwayAtr * pa && !broken) isReversalHigh = true;
					break;
				}
			}
			resPx.push(highExt);
			resAtr.push(a);
			resBar.push(i);
			if (resPx.length > 40) {
				resPx.shift();
				resAtr.shift();
				resBar.shift();
			}
		}
		if (newLowPivot) {
			for (let k = supPx.length - 1; k >= 0; k--) {
				const px = supPx[k];
				const pa = supAtr[k];
				const b = supBar[k];
				const band = p.bandAtr * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(lowExt - px) <= band && age >= 4) {
					const look = Math.min(300, age);
					const away = highestSince$1(i, look, bars) - px;
					const broken = lowestCloseSince$1(i, look, bars) < px - .2 * pa;
					if (away >= p.minAwayAtr * pa && !broken) isReversalLow = true;
					break;
				}
			}
			supPx.push(lowExt);
			supAtr.push(a);
			supBar.push(i);
			if (supPx.length > 40) {
				supPx.shift();
				supAtr.shift();
				supBar.shift();
			}
		}
		const ltfClose = bar.time + barMs;
		const htfC = htfAt(htfTimes, htfClose, ltfClose, htfMs);
		const htfE = htfAt(htfTimes, htfEma, ltfClose, htfMs);
		const htfLongOk = !p.useHtf || !Number.isFinite(htfE) || htfC >= htfE * .997;
		const htfShortOk = !p.useHtf || !Number.isFinite(htfE) || htfC <= htfE * 1.003;
		if (atrOk) {
			const arm = (dir, extreme, inner) => {
				const slBuf = p.slAtrMult * a;
				const sl = dir === 1 ? extreme - slBuf : extreme + slBuf;
				let ftc = (extreme + inner) * .5;
				ftc = dir === 1 ? Math.max(ftc, extreme + .2 * a) : Math.min(ftc, extreme - .2 * a);
				return {
					ok: roomR$1(dir, extreme, Math.abs(ftc - sl), resPx, supPx) >= p.minRoomR && i - lastFill >= p.cooldownBars,
					ftc,
					sl
				};
			};
			if (isReversalHigh && htfShortOk) {
				const r = arm(-1, highExt, highIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = -1;
					armAge = 0;
				}
			}
			if (isReversalLow && htfLongOk) {
				const r = arm(1, lowExt, lowIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = 1;
					armAge = 0;
				}
			}
		}
		const e21 = ema21[i];
		const e84 = ema84[i];
		const regimeLong = !p.useEma84 || !Number.isFinite(e84) || bar.close >= e84;
		const regimeShort = !p.useEma84 || !Number.isFinite(e84) || bar.close <= e84;
		if (Number.isFinite(armFtc)) {
			armAge += 1;
			const invalidated = armDir === 1 ? bar.low <= armSl : bar.high >= armSl;
			const tagged = armDir === 1 ? bar.low <= armFtc : bar.high >= armFtc;
			if (invalidated) {
				armFtc = NaN;
				armDir = 0;
			} else if (tagged) {
				const confL = !p.confirmCl || bar.close > armFtc;
				const confS = !p.confirmCl || bar.close < armFtc;
				let filled = false;
				if (i >= 266) {
					if (armDir === 1 && confL && regimeLong && p.sides !== "Short") {
						const slDist = Math.abs(armFtc - armSl);
						signals.push({
							barIndex: i,
							barTime: bar.time,
							indicator: p.name,
							side: "long",
							entry: armFtc,
							sl: armSl,
							tp: armFtc + p.rr * slDist,
							rr: p.rr,
							atr: a,
							reason: "KETEX 2.2R second-test support · NEXUS close · FTC tag"
						});
						filled = true;
					}
					if (armDir === -1 && confS && regimeShort && p.sides !== "Long") {
						const slDist = Math.abs(armFtc - armSl);
						signals.push({
							barIndex: i,
							barTime: bar.time,
							indicator: p.name,
							side: "short",
							entry: armFtc,
							sl: armSl,
							tp: armFtc - p.rr * slDist,
							rr: p.rr,
							atr: a,
							reason: "KETEX 2.2R second-test resistance · NEXUS close · FTC tag"
						});
						filled = true;
					}
				}
				if (filled) lastFill = i;
				armFtc = NaN;
				armDir = 0;
			} else if (armAge >= p.ftcWait) {
				armFtc = NaN;
				armDir = 0;
			}
		}
		lastBias = Number.isFinite(e21) && Number.isFinite(e84) && e21 > e84 && (!p.useHtf || htfC > htfE) ? "LONG" : Number.isFinite(e21) && Number.isFinite(e84) && e21 < e84 && (!p.useHtf || htfC < htfE) ? "SHORT" : "FLAT";
		lastArmed = Number.isFinite(armFtc) ? armDir === 1 ? "LONG" : "SHORT" : null;
	}
	const last = bars[n - 1];
	return {
		signals,
		lastAtr: n ? catr[n - 1] : NaN,
		lastClose: last ? last.close : NaN,
		lastBias,
		armed: lastArmed
	};
}
var EPS = 1e-10;
var SHETEX_PROFILE = {
	name: "SHETEX",
	rr: 1.8,
	legLookback: 40,
	minLegAtr: 2.6,
	coverMax: 2,
	needThird: true,
	useLongbar: true,
	slAtrMult: .35,
	ftcWait: 8,
	minRoomR: 1.6,
	useHtfEma: true,
	cooldownBars: 5,
	bandAtr: .7,
	minAwayAtr: 1
};
function shetexProfile() {
	return { ...SHETEX_PROFILE };
}
function cType(rng, catr) {
	const r = rng / Math.max(catr, EPS);
	if (r < .8) return 0;
	if (r <= 1.2) return 1;
	if (r <= 2.5) return 2;
	return 3;
}
function lastThird(bearish, close, high, low) {
	const third = Math.max(high - low, EPS) / 3;
	return bearish ? close <= low + third : close >= high - third;
}
function threeMasters(fromOff, toOff, wantHigh, i, bars, catr) {
	let run = 0;
	let lastExt = wantHigh ? -0x56bc75e2d63100000 : 0x56bc75e2d63100000;
	for (let off = fromOff; off <= toOff; off++) {
		const idx = i - off;
		if (idx < 0) continue;
		const bar = bars[idx];
		const rng = Math.max(bar.high - bar.low, EPS);
		const body = Math.abs(bar.close - bar.open);
		const upSh = bar.high - Math.max(bar.close, bar.open);
		const dnSh = Math.min(bar.close, bar.open) - bar.low;
		const masterish = cType(rng, catr[idx]) === 1 && (body / rng >= .8 || Math.max(upSh, dnSh) / rng >= .8);
		const dirOk = wantHigh ? bar.close > bar.open : bar.close < bar.open;
		if (masterish && dirOk) {
			const ext = wantHigh ? bar.high : bar.low;
			if (wantHigh) {
				if (ext > lastExt) {
					run += 1;
					lastExt = ext;
				} else {
					run = 1;
					lastExt = Math.max(lastExt, ext);
				}
			} else if (ext < lastExt) {
				run += 1;
				lastExt = ext;
			} else {
				run = 1;
				lastExt = Math.min(lastExt, ext);
			}
			if (run >= 3) return true;
		} else run = 0;
	}
	return false;
}
function originLowOff(eOff, look, i, bars) {
	let mn = bars[i - eOff].low;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].low;
		if (v < mn) {
			mn = v;
			idx = off;
		}
	}
	return idx;
}
function originHighOff(eOff, look, i, bars) {
	let mx = bars[i - eOff].high;
	let idx = eOff;
	const maxOff = Math.min(eOff + look, i);
	for (let off = eOff; off <= maxOff; off++) {
		const v = bars[i - off].high;
		if (v > mx) {
			mx = v;
			idx = off;
		}
	}
	return idx;
}
function moveOkUp(eOff, i, bars, catr, p) {
	const orig = originLowOff(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	const o = i - orig;
	return bars[e].high - bars[o].low >= p.minLegAtr * catr[e] || threeMasters(orig, eOff, true, i, bars, catr);
}
function moveOkDn(eOff, i, bars, catr, p) {
	const orig = originHighOff(eOff, p.legLookback, i, bars);
	const e = i - eOff;
	return bars[i - orig].high - bars[e].low >= p.minLegAtr * catr[e] || threeMasters(orig, eOff, false, i, bars, catr);
}
function coverHighAt(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.high;
	const inner = Math.min(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType(rngE, catr[e]) === 1 && bar.close > bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType(rngE, catr[e]) >= 2;
	const line = master ? bar.low : longish ? bar.high - catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkUp(eOff, i, bars, catr, p)) {
		if (cur.close < line && (!p.needThird || lastThird(true, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function coverLowAt(eOff, i, bars, catr, p) {
	const e = i - eOff;
	const cur = bars[i];
	const bar = bars[e];
	const extreme = bar.low;
	const inner = Math.max(bar.open, bar.close);
	const rngE = Math.max(bar.high - bar.low, EPS);
	const bodyR = Math.abs(bar.close - bar.open) / rngE;
	const upSh = (bar.high - Math.max(bar.close, bar.open)) / rngE;
	const dnSh = (Math.min(bar.close, bar.open) - bar.low) / rngE;
	const master = cType(rngE, catr[e]) === 1 && bar.close < bar.open && (bodyR >= .8 || upSh >= .8 || dnSh >= .8);
	const longish = p.useLongbar && cType(rngE, catr[e]) >= 2;
	const line = master ? bar.high : longish ? bar.low + catr[e] : NaN;
	let ok = false;
	if (Number.isFinite(line) && (master || longish) && moveOkDn(eOff, i, bars, catr, p)) {
		if (cur.close > line && (!p.needThird || lastThird(false, cur.close, cur.high, cur.low))) ok = true;
	}
	return {
		ok,
		extreme,
		inner
	};
}
function lowestSince(i, len, bars) {
	let mn = bars[i].low;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].low);
	}
	return mn;
}
function highestSince(i, len, bars) {
	let mx = bars[i].high;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].high);
	}
	return mx;
}
function highestCloseSince(i, len, bars) {
	let mx = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mx = Math.max(mx, bars[idx].close);
	}
	return mx;
}
function lowestCloseSince(i, len, bars) {
	let mn = bars[i].close;
	const n = Math.max(0, len);
	for (let k = 0; k <= n; k++) {
		const idx = i - k;
		if (idx < 0) break;
		mn = Math.min(mn, bars[idx].close);
	}
	return mn;
}
function roomR(dir, extreme, slDist, resPx, supPx) {
	if (slDist <= 0) return 0;
	if (dir === 1) {
		let best = 0x56bc75e2d63100000;
		for (const px of resPx) if (px > extreme && px < best) best = px;
		if (best < 0x56bc75e2d63100000) return (best - extreme) / slDist;
		return 99;
	}
	let best = -0x56bc75e2d63100000;
	for (const px of supPx) if (px < extreme && px > best) best = px;
	if (best > -0x56bc75e2d63100000) return (extreme - best) / slDist;
	return 99;
}
/**
* SHETEX — TREX Entries (shetex.txt).
* Second-test live pivot → RTP into FTC. First-touch skipped.
* HTF EMA50. Target 1.8R. No break-even, no stop/target floors.
* Own family — does not mix with TREX1 / TREX12 / KETEX / APEX / HALCYON.
*/
function runShetexEngine(bars, tf, htfBars) {
	const p = shetexProfile();
	const n = bars.length;
	const signals = [];
	const catr = customAtr(bars.map((b) => b.high), bars.map((b) => b.low), bars.map((b) => b.close));
	const htfTf = HTF_OF[tf];
	const htfMs = TF_MS[htfTf];
	const barMs = TF_MS[tf];
	const htf = htfBars && htfBars.length > 10 ? htfBars : resample(bars, htfMs);
	const htfTimes = htf.map((b) => b.time);
	const htfClose = htf.map((b) => b.close);
	const htfEma50 = ema(htfClose, 50);
	const resPx = [];
	const resAtr = [];
	const resBar = [];
	const supPx = [];
	const supAtr = [];
	const supBar = [];
	let armFtc = NaN;
	let armSl = NaN;
	let armDir = 0;
	let armAge = 0;
	let lastFill = -9999;
	let lastBias = "FLAT";
	let lastArmed = null;
	let htfC = NaN;
	let htfE = NaN;
	for (let i = 2; i < n; i++) {
		const bar = bars[i];
		const a = catr[i];
		const atrOk = Number.isFinite(a) && a > 0;
		let newHighPivot = false;
		let newLowPivot = false;
		let highExt = NaN;
		let highIn = NaN;
		let lowExt = NaN;
		let lowIn = NaN;
		if (atrOk) {
			const cH1 = coverHighAt(1, i, bars, catr, p);
			const cH2 = coverHighAt(2, i, bars, catr, p);
			const cL1 = coverLowAt(1, i, bars, catr, p);
			const cL2 = coverLowAt(2, i, bars, catr, p);
			newHighPivot = cH1.ok || p.coverMax >= 2 && cH2.ok && !cH1.ok;
			newLowPivot = cL1.ok || p.coverMax >= 2 && cL2.ok && !cL1.ok;
			highExt = cH1.ok ? cH1.extreme : cH2.extreme;
			highIn = cH1.ok ? cH1.inner : cH2.inner;
			lowExt = cL1.ok ? cL1.extreme : cL2.extreme;
			lowIn = cL1.ok ? cL1.inner : cL2.inner;
			if (newHighPivot && newLowPivot) {
				if (highExt - highIn >= lowIn - lowExt) newLowPivot = false;
				else newHighPivot = false;
			}
		}
		let isReversalHigh = false;
		let isReversalLow = false;
		if (newHighPivot) {
			for (let k = resPx.length - 1; k >= 0; k--) {
				const px = resPx[k];
				const pa = resAtr[k];
				const b = resBar[k];
				const band = p.bandAtr * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(highExt - px) <= band && age >= 4) {
					const look = Math.min(300, age);
					const away = px - lowestSince(i, look, bars);
					const broken = highestCloseSince(i, look, bars) > px + .2 * pa;
					if (away >= p.minAwayAtr * pa && !broken) isReversalHigh = true;
					break;
				}
			}
			resPx.push(highExt);
			resAtr.push(a);
			resBar.push(i);
			if (resPx.length > 40) {
				resPx.shift();
				resAtr.shift();
				resBar.shift();
			}
		}
		if (newLowPivot) {
			for (let k = supPx.length - 1; k >= 0; k--) {
				const px = supPx[k];
				const pa = supAtr[k];
				const b = supBar[k];
				const band = p.bandAtr * Math.max(a, pa);
				const age = i - b;
				if (Math.abs(lowExt - px) <= band && age >= 4) {
					const look = Math.min(300, age);
					const away = highestSince(i, look, bars) - px;
					const broken = lowestCloseSince(i, look, bars) < px - .2 * pa;
					if (away >= p.minAwayAtr * pa && !broken) isReversalLow = true;
					break;
				}
			}
			supPx.push(lowExt);
			supAtr.push(a);
			supBar.push(i);
			if (supPx.length > 40) {
				supPx.shift();
				supAtr.shift();
				supBar.shift();
			}
		}
		const ltfClose = bar.time + barMs;
		htfC = htfAt(htfTimes, htfClose, ltfClose, htfMs);
		htfE = htfAt(htfTimes, htfEma50, ltfClose, htfMs);
		const htfLongOk = !p.useHtfEma || !Number.isFinite(htfE) || htfC >= htfE * .997;
		const htfShortOk = !p.useHtfEma || !Number.isFinite(htfE) || htfC <= htfE * 1.003;
		if (atrOk) {
			const arm = (dir, extreme, inner) => {
				const slBuf = p.slAtrMult * a;
				const sl = dir === 1 ? extreme - slBuf : extreme + slBuf;
				let ftc = (extreme + inner) * .5;
				ftc = dir === 1 ? Math.max(ftc, extreme + .2 * a) : Math.min(ftc, extreme - .2 * a);
				return {
					ok: roomR(dir, extreme, Math.abs(ftc - sl), resPx, supPx) >= p.minRoomR && i - lastFill >= p.cooldownBars,
					ftc,
					sl
				};
			};
			if (isReversalHigh && htfShortOk) {
				const r = arm(-1, highExt, highIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = -1;
					armAge = 0;
				}
			}
			if (isReversalLow && htfLongOk) {
				const r = arm(1, lowExt, lowIn);
				if (r.ok) {
					armFtc = r.ftc;
					armSl = r.sl;
					armDir = 1;
					armAge = 0;
				}
			}
		}
		if (Number.isFinite(armFtc)) {
			armAge += 1;
			const invalidated = armDir === 1 ? bar.low <= armSl : bar.high >= armSl;
			const tagged = armDir === 1 ? bar.low <= armFtc : bar.high >= armFtc;
			if (invalidated) {
				armFtc = NaN;
				armDir = 0;
			} else if (tagged) {
				if (i >= 266) {
					const slDist = Math.abs(armFtc - armSl);
					if (armDir === 1) signals.push({
						barIndex: i,
						barTime: bar.time,
						indicator: p.name,
						side: "long",
						entry: armFtc,
						sl: armSl,
						tp: armFtc + p.rr * slDist,
						rr: p.rr,
						atr: a,
						reason: "SHETEX 1.8R second-test support · FTC tag"
					});
					else if (armDir === -1) signals.push({
						barIndex: i,
						barTime: bar.time,
						indicator: p.name,
						side: "short",
						entry: armFtc,
						sl: armSl,
						tp: armFtc - p.rr * slDist,
						rr: p.rr,
						atr: a,
						reason: "SHETEX 1.8R second-test resistance · FTC tag"
					});
				}
				lastFill = i;
				armFtc = NaN;
				armDir = 0;
			} else if (armAge >= p.ftcWait) {
				armFtc = NaN;
				armDir = 0;
			}
		}
		lastBias = Number.isFinite(htfC) && Number.isFinite(htfE) ? htfC > htfE ? "LONG" : htfC < htfE ? "SHORT" : "FLAT" : "FLAT";
		lastArmed = Number.isFinite(armFtc) ? armDir === 1 ? "LONG" : "SHORT" : null;
	}
	const last = bars[n - 1];
	return {
		signals,
		lastAtr: n ? catr[n - 1] : NaN,
		lastClose: last ? last.close : NaN,
		lastBias,
		armed: lastArmed
	};
}
function prepareSeries(bars, tf, htfBars, htf2Bars) {
	const high = bars.map((b) => b.high);
	const low = bars.map((b) => b.low);
	const close = bars.map((b) => b.close);
	const vol = bars.map((b) => b.volume);
	const catr = customAtr(high, low, close);
	const ema21 = ema(close, 21);
	const ema84 = ema(close, 84);
	const ema200 = ema(close, 200);
	const { pdi, mdi } = dmi(high, low, close, 14, 14);
	const volSma = sma(vol, 20);
	const htfTf = HTF_OF[tf];
	const htf2Tf = HTF2_OF[tf];
	const htfMs = TF_MS[htfTf];
	const htf2Ms = TF_MS[htf2Tf];
	const htf = htfBars && htfBars.length > 10 ? htfBars : resample(bars, htfMs);
	const htf2 = htf2Bars && htf2Bars.length > 10 ? htf2Bars : resample(bars, htf2Ms);
	const htfTimes = htf.map((b) => b.time);
	const htfClose = htf.map((b) => b.close);
	const htfEma = ema(htfClose, 21);
	const htf2Times = htf2.map((b) => b.time);
	const htf2Close = htf2.map((b) => b.close);
	return {
		catr,
		ema21,
		ema84,
		ema200,
		pdi,
		mdi,
		volSma,
		htfTimes,
		htfClose,
		htfEma,
		htf2Times,
		htf2Close,
		htf2Ema: ema(htf2Close, 21),
		htfMs,
		htf2Ms
	};
}
function runIndicator(bars, tf, name, htfBars, htf2Bars) {
	if (isApexName(name)) {
		const p = apexProfile(name, tf);
		const s = prepareSeries(bars, tf, htfBars, htf2Bars);
		return runReversalEngine(bars, s, p, {
			barMs: TF_MS[tf],
			htfMs: s.htfMs,
			htf2Ms: s.htf2Ms
		});
	}
	if (isTrexName(name)) return runTrexEngine(bars, tf, name, htfBars);
	if (isKetexName(name)) return runKetexEngine(bars, tf, htfBars);
	if (isShetexName(name)) return runShetexEngine(bars, tf, htfBars);
	return runCoilEngine(bars, tf, name, htfBars);
}
/** Drop the still-forming candle. Never slice blindly — at exact close the last row is already closed. */
function onlyClosedBars(bars, tf, now = Date.now()) {
	const ms = TF_MS[tf];
	return bars.filter((b) => Number.isFinite(b.time) && b.time + ms <= now + 2e3);
}
function keepFamily(arr) {
	const longs = arr.filter((s) => s.side === "long");
	const shorts = arr.filter((s) => s.side === "short");
	if (longs.length && shorts.length) return [];
	return arr;
}
function scanBarClosed(bars, tf, htfBars, lastN = 1, htf2Bars, names) {
	const list = names === void 0 ? SCAN_RULE[tf] : names;
	if (!bars.length || !list.length) return [];
	const n = Math.max(1, Math.min(8, lastN));
	const want = new Set(bars.slice(-n).map((b) => b.time));
	const found = [];
	for (const name of list) {
		const res = runIndicator(bars, tf, name, htfBars, htf2Bars);
		for (const sig of res.signals) {
			if (!want.has(sig.barTime)) continue;
			found.push(sig);
		}
	}
	const byBar = /* @__PURE__ */ new Map();
	for (const s of found) {
		const arr = byBar.get(s.barTime) ?? [];
		arr.push(s);
		byBar.set(s.barTime, arr);
	}
	const clean = [];
	for (const arr of byBar.values()) {
		clean.push(...keepFamily(arr.filter((s) => isApexName(s.indicator))));
		clean.push(...keepFamily(arr.filter((s) => isHalcyonName(s.indicator))));
		clean.push(...keepFamily(arr.filter((s) => isTrexName(s.indicator))));
		clean.push(...keepFamily(arr.filter((s) => isKetexName(s.indicator))));
		clean.push(...keepFamily(arr.filter((s) => isShetexName(s.indicator))));
	}
	return clean;
}
var _0002_desk_default = "-- Apex Desk — single-operator trading journal (unowned rows; personal deployed instance)\ncreate table if not exists desk_settings (\n  id integer primary key default 1,\n  mode text not null default 'paper',\n  venue text not null default 'lighter',\n  risk_pct double precision not null default 1.0,\n  max_positions integer not null default 4,\n  min_market_cap_usd double precision not null default 800000000,\n  equity_usd double precision not null default 10000,\n  starting_equity_usd double precision not null default 10000,\n  live_enabled integer not null default 0,\n  bot_enabled integer not null default 1,\n  paper_24h integer not null default 1,\n  tick_token text not null default 'change-me',\n  scan_cursor integer not null default 0,\n  last_tick_at timestamptz,\n  lighter_api_key text,\n  lighter_api_private_key text,\n  lighter_account_index integer,\n  aster_api_key text,\n  aster_api_secret text,\n  toobit_api_key text,\n  toobit_api_secret text,\n  updated_at timestamptz not null default now()\n);\n\ninsert into desk_settings (id) values (1) on conflict (id) do nothing;\n\ncreate table if not exists universe_assets (\n  symbol text primary key,\n  base text not null,\n  name text not null,\n  market_cap_usd double precision not null,\n  volume_24h_usd double precision not null default 0,\n  max_leverage integer not null default 25,\n  listed_lighter integer not null default 1,\n  listed_aster integer not null default 1,\n  listed_toobit integer not null default 1,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists signals (\n  id serial primary key,\n  ts timestamptz not null default now(),\n  bar_time bigint not null default 0,\n  symbol text not null,\n  timeframe text not null,\n  indicator text not null,\n  side text not null,\n  entry double precision not null,\n  sl double precision not null,\n  tp double precision not null,\n  rr double precision not null,\n  atr double precision,\n  reason text,\n  taken integer not null default 0,\n  skip_reason text\n);\ncreate index if not exists signals_ts_idx on signals (ts desc);\ncreate index if not exists signals_sym_idx on signals (symbol, timeframe);\n\ncreate table if not exists positions (\n  id serial primary key,\n  mode text not null,\n  venue text not null,\n  symbol text not null,\n  timeframe text not null,\n  indicator text not null,\n  side text not null,\n  entry double precision not null,\n  sl double precision not null,\n  tp double precision not null,\n  qty double precision not null,\n  leverage integer not null,\n  notional_usd double precision not null,\n  risk_usd double precision not null,\n  opened_at timestamptz not null default now(),\n  closed_at timestamptz,\n  exit_px double precision,\n  exit_reason text,\n  pnl_usd double precision,\n  pnl_r double precision,\n  fees_usd double precision not null default 0,\n  status text not null default 'open',\n  exchange_order_id text\n);\ncreate index if not exists positions_status_idx on positions (status, opened_at desc);\n\ncreate table if not exists equity_snapshots (\n  id serial primary key,\n  ts timestamptz not null default now(),\n  equity_usd double precision not null,\n  open_count integer not null default 0,\n  mode text not null\n);\ncreate index if not exists equity_ts_idx on equity_snapshots (ts desc);\n\ncreate table if not exists scan_log (\n  id serial primary key,\n  ts timestamptz not null default now(),\n  scanned integer not null,\n  signals integer not null,\n  opened integer not null,\n  closed integer not null,\n  duration_ms integer not null,\n  note text\n);\n\ncreate table if not exists backtests (\n  id serial primary key,\n  created_at timestamptz not null default now(),\n  symbol text not null,\n  timeframe text not null,\n  indicator text not null,\n  bars integer not null,\n  trades integer not null,\n  wins integer not null,\n  losses integer not null,\n  win_rate double precision not null,\n  profit_factor double precision not null,\n  expect_r double precision not null,\n  net_r double precision not null,\n  max_dd_r double precision not null,\n  result_json text not null\n);\n";
var _0003_cron_default = "-- Durable cron metadata. Token is never rotated by this migration.\nalter table desk_settings add column if not exists last_tick_source text;\nalter table scan_log add column if not exists source text not null default 'manual';\ncreate index if not exists scan_log_source_idx on scan_log (source, ts desc);\n";
var _0004_lock_default = "-- Operator PIN lock. Mutations and secrets require an unlocked session cookie.\nalter table desk_settings add column if not exists operator_pin_hash text;\nalter table desk_settings add column if not exists operator_pin_salt text;\nalter table desk_settings add column if not exists operator_session text;\n";
var _0005_venues_default = "-- Hyperliquid agent wallet + Lighter API key index\nalter table desk_settings add column if not exists hyperliquid_private_key text;\nalter table desk_settings add column if not exists hyperliquid_wallet_address text;\nalter table desk_settings add column if not exists lighter_api_key_index integer;\n";
var _0006_sizing_default = "-- Capital % of equity used as margin per trade, and coins scanned per cron tick.\nalter table desk_settings add column if not exists capital_pct double precision not null default 10;\nalter table desk_settings add column if not exists scan_batch integer not null default 40;\n";
var _0007_scan_all_default = "-- 0 = scan the whole universe each tick. Existing 40-coin batches bump to all.\nalter table desk_settings alter column scan_batch set default 0;\nupdate desk_settings set scan_batch = 0 where scan_batch <= 40;\n";
var _0008_signal_dedupe_default = "create unique index if not exists signals_dedupe_idx\n  on signals (symbol, timeframe, indicator, bar_time);\n";
var _0009_positions_size_default = "-- Neon tables created from an earlier SQL paste have `size NOT NULL` while the\n-- app writes `qty`. Keep both in sync and give `size` a default so inserts never\n-- die on a null constraint.\nalter table positions add column if not exists qty double precision;\nalter table positions add column if not exists size double precision;\nalter table positions add column if not exists mode text;\nalter table positions add column if not exists venue text;\nalter table positions add column if not exists notional_usd double precision;\nalter table positions add column if not exists risk_usd double precision;\nalter table positions add column if not exists fees_usd double precision;\nalter table positions add column if not exists exit_px double precision;\nalter table positions add column if not exists exit_reason text;\nalter table positions add column if not exists pnl_usd double precision;\nalter table positions add column if not exists pnl_r double precision;\nalter table positions add column if not exists status text;\nalter table positions add column if not exists exchange_order_id text;\nalter table positions add column if not exists opened_at timestamptz;\nalter table positions add column if not exists closed_at timestamptz;\nalter table positions add column if not exists leverage double precision;\n\nupdate positions set qty = size where qty is null and size is not null;\nupdate positions set size = qty where size is null and qty is not null;\nupdate positions set qty = 0 where qty is null;\nupdate positions set size = 0 where size is null;\nupdate positions set mode = coalesce(mode, 'paper');\nupdate positions set venue = coalesce(venue, 'paper');\nupdate positions set status = coalesce(status, 'open');\nupdate positions set fees_usd = coalesce(fees_usd, 0);\nupdate positions set notional_usd = coalesce(notional_usd, 0);\nupdate positions set risk_usd = coalesce(risk_usd, 0);\nupdate positions set leverage = coalesce(leverage, 1);\nupdate positions set opened_at = coalesce(opened_at, now());\n\nalter table positions alter column qty set default 0;\nalter table positions alter column size set default 0;\nalter table positions alter column fees_usd set default 0;\nalter table positions alter column notional_usd set default 0;\nalter table positions alter column risk_usd set default 0;\nalter table positions alter column leverage set default 1;\nalter table positions alter column mode set default 'paper';\nalter table positions alter column venue set default 'paper';\nalter table positions alter column status set default 'open';\nalter table positions alter column opened_at set default now();\n";
var _0010_position_dedupe_default = "-- One fill per signal candle. Re-opening the same bar after SL was the\n-- GRASS/BNB clone bug. Also restore paper equity after dropping clones.\nalter table positions add column if not exists bar_time bigint;\nalter table desk_settings add column if not exists tick_lock_at timestamptz;\n\ndelete from positions a\nusing positions b\nwhere a.id > b.id\n  and a.bar_time is not null\n  and b.bar_time is not null\n  and a.bar_time <> 0\n  and a.bar_time = b.bar_time\n  and a.symbol = b.symbol\n  and a.timeframe = b.timeframe\n  and a.indicator = b.indicator;\n\ndelete from positions a\nusing positions b\nwhere a.id > b.id\n  and a.symbol = b.symbol\n  and a.timeframe = b.timeframe\n  and a.indicator = b.indicator\n  and a.side = b.side\n  and round(a.entry::numeric, 8) = round(b.entry::numeric, 8);\n\ncreate unique index if not exists positions_dedupe_idx\n  on positions (symbol, timeframe, indicator, bar_time)\n  where bar_time is not null and bar_time <> 0;\n\nupdate desk_settings\nset equity_usd = starting_equity_usd + coalesce((\n  select sum(coalesce(pnl_usd, 0)) from positions where status = 'closed'\n), 0),\n    updated_at = now()\nwhere id = 1;\n";
var _0011_signals_dedupe_default = "-- Two crons (Cloudflare + cron-job.org) can overlap. One row per candle signal.\ndelete from signals a\nusing signals b\nwhere a.id > b.id\n  and a.symbol = b.symbol\n  and a.timeframe = b.timeframe\n  and a.indicator = b.indicator\n  and a.bar_time = b.bar_time;\n\ncreate unique index if not exists signals_dedupe_idx\n  on signals (symbol, timeframe, indicator, bar_time);\n";
var _0012_min_cap_setting_default = "-- Min market cap is a desk setting. 0 = every listed perp on the venue.\nalter table desk_settings alter column min_market_cap_usd set default 0;\nupdate desk_settings set min_market_cap_usd = 0 where min_market_cap_usd is null or min_market_cap_usd >= 800000000;\n";
var _0013_journal_default = "-- Extra blotter fields: original stop, MAE/MFE, hold, signal context.\nalter table positions add column if not exists orig_sl double precision;\nalter table positions add column if not exists mae_r double precision;\nalter table positions add column if not exists mfe_r double precision;\nalter table positions add column if not exists bars_held integer;\nalter table positions add column if not exists hold_ms bigint;\nalter table positions add column if not exists signal_reason text;\nalter table positions add column if not exists atr_at_entry double precision;\nalter table positions add column if not exists be_moved integer not null default 0;\nalter table positions add column if not exists equity_at_open double precision;\nalter table positions add column if not exists rr_planned double precision;\nalter table positions add column if not exists margin_usd double precision;\n\nupdate positions\nset orig_sl = sl\nwhere orig_sl is null and sl is not null;\n\nupdate positions\nset rr_planned = abs(tp - entry) / nullif(abs(entry - coalesce(orig_sl, sl)), 0)\nwhere rr_planned is null\n  and entry is not null\n  and tp is not null;\n\nupdate positions\nset margin_usd = notional_usd / nullif(leverage, 0)\nwhere margin_usd is null\n  and notional_usd is not null\n  and leverage is not null\n  and leverage <> 0;\n";
var _0014_journal_notes_default = "-- Operator notes per fill, and a one-shot demo blotter flag.\nalter table positions add column if not exists notes text;\nalter table desk_settings add column if not exists journal_seeded integer not null default 0;\n";
var _0015_scan_done_default = "-- Per-TF \"this closed bar is fully swept\" so a 1-minute cron can finish\n-- the universe across several ticks without re-taking an old candle.\nalter table desk_settings add column if not exists scan_epoch_ms bigint not null default 0;\nalter table desk_settings add column if not exists scan_done_5m bigint not null default 0;\nalter table desk_settings add column if not exists scan_done_15m bigint not null default 0;\nalter table desk_settings add column if not exists scan_done_1h bigint not null default 0;\nalter table desk_settings add column if not exists scan_done_4h bigint not null default 0;\n";
var _0016_universe_venue_default = "-- Tag the stored book with the venue it was loaded from, plus the native pair name.\nalter table desk_settings add column if not exists universe_venue text;\nalter table universe_assets add column if not exists venue_symbol text;\n";
var _0017_max_leverage_default = "-- User cap on leverage. Bot still never exceeds that coin's venue max.\nalter table desk_settings add column if not exists max_leverage integer not null default 200;\n";
var _0018_tick_hardening_default = "-- Per-TF scan cursors so a 15m/1h/4h close can finish the universe\n-- across several 1-minute pings without a 5m close resetting the pointer.\nalter table desk_settings add column if not exists scan_cursors text not null default '{}';\n-- Live fills that the desk failed to row + flatten. Next tick retries.\nalter table desk_settings add column if not exists orphan_fills text not null default '[]';\n-- Lock holder id so a killed Vercel invoke expires in ~20s, not 70s.\nalter table desk_settings add column if not exists tick_lock_id text;\n";
var _0019_engine_gates_default = "-- Per-engine × timeframe mute switches. Empty JSON = every engine stays on.\nalter table desk_settings add column if not exists engine_gates text not null default '{}';\n";
var _0020_ourbit_default = "-- Replace Toobit with OURBIT. Keep old toobit_* columns so existing Neon rows stay intact.\nalter table desk_settings add column if not exists ourbit_api_key text;\nalter table desk_settings add column if not exists ourbit_api_secret text;\n\nupdate desk_settings set venue = 'ourbit' where venue = 'toobit';\nupdate desk_settings set universe_venue = 'ourbit' where universe_venue = 'toobit';\n";
var _0021_stack_leverage_default = "-- If N concurrent opens already sit above this cap, new fills use this cap.\nalter table desk_settings add column if not exists stack_lev_count integer not null default 2;\nalter table desk_settings add column if not exists stack_lev_cap integer not null default 75;\n";
var _0022_lev_size_tiers_default = "-- Per-leverage capital % buckets. Default 3% of equity as margin;\n-- 5x coins 15%, 10x coins 12%, 25x coins 6%. All editable in settings.\nalter table desk_settings add column if not exists lev_size_tiers text not null\n  default '[{\"leverage\":5,\"capitalPct\":15},{\"leverage\":10,\"capitalPct\":12},{\"leverage\":25,\"capitalPct\":6}]';\n\nalter table desk_settings alter column capital_pct set default 3;\nalter table desk_settings alter column venue set default 'aster';\n\n-- Fresh desks still sit on the old 10% default from 0006. Move them to 3%.\nupdate desk_settings\n  set capital_pct = 3\n  where id = 1 and capital_pct = 10;\n\n-- Original default venue was Lighter. This desk is meant to run on Aster.\nupdate desk_settings\n  set venue = 'aster'\n  where id = 1 and venue = 'lighter';\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
function getDbSource() {
	return dbSource;
}
function isServerlessRuntime() {
	return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
}
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
/** Vite inlines these; Node without the transform falls back to migrations/. */
async function loadMigrationFiles() {
	let files = {};
	try {
		files = /* #__PURE__ */ Object.assign({
			"/migrations/0002_desk.sql": _0002_desk_default,
			"/migrations/0003_cron.sql": _0003_cron_default,
			"/migrations/0004_lock.sql": _0004_lock_default,
			"/migrations/0005_venues.sql": _0005_venues_default,
			"/migrations/0006_sizing.sql": _0006_sizing_default,
			"/migrations/0007_scan_all.sql": _0007_scan_all_default,
			"/migrations/0008_signal_dedupe.sql": _0008_signal_dedupe_default,
			"/migrations/0009_positions_size.sql": _0009_positions_size_default,
			"/migrations/0010_position_dedupe.sql": _0010_position_dedupe_default,
			"/migrations/0011_signals_dedupe.sql": _0011_signals_dedupe_default,
			"/migrations/0012_min_cap_setting.sql": _0012_min_cap_setting_default,
			"/migrations/0013_journal.sql": _0013_journal_default,
			"/migrations/0014_journal_notes.sql": _0014_journal_notes_default,
			"/migrations/0015_scan_done.sql": _0015_scan_done_default,
			"/migrations/0016_universe_venue.sql": _0016_universe_venue_default,
			"/migrations/0017_max_leverage.sql": _0017_max_leverage_default,
			"/migrations/0018_tick_hardening.sql": _0018_tick_hardening_default,
			"/migrations/0019_engine_gates.sql": _0019_engine_gates_default,
			"/migrations/0020_ourbit.sql": _0020_ourbit_default,
			"/migrations/0021_stack_leverage.sql": _0021_stack_leverage_default,
			"/migrations/0022_lev_size_tiers.sql": _0022_lev_size_tiers_default
		});
	} catch {
		files = {};
	}
	if (files && Object.keys(files).length > 0) return files;
	try {
		const { readdir, readFile } = await import("node:fs/promises");
		const { join } = await import("node:path");
		const dir = join(process.cwd(), "migrations");
		const names = await readdir(dir);
		const out = {};
		for (const name of names) {
			if (!name.endsWith(".sql")) continue;
			out[`/migrations/${name}`] = await readFile(join(dir, name), "utf8");
		}
		return out;
	} catch {
		return {};
	}
}
async function applyNeonMigrations(pool) {
	const files = await loadMigrationFiles();
	const client = await pool.connect();
	try {
		await client.query("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
		const applied = (await client.query("SELECT name FROM _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(files), applied)) {
			const sqlText = files[path];
			if (!sqlText) continue;
			try {
				await client.query("BEGIN");
				await client.query(sqlText);
				await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
				await client.query("COMMIT");
			} catch (err) {
				try {
					await client.query("ROLLBACK");
				} catch {}
				throw err;
			}
		}
	} finally {
		client.release();
	}
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		const migrate = (globalRef.__neonMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(() => applyNeonMigrations(pool));
		globalRef.__neonMigrateChain__ = migrate;
		await migrate;
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = await loadMigrationFiles();
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* Opens the backend and applies pending `migrations/*.sql` (PGLite and Neon).
* Idempotent — concurrent callers share one promise.
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] bootstrap failed:", err);
	throw err;
});
/** Paper blotter for first preview — mixed APEX / HALCYON / TREX / KETEX fills. */
var DEMO_JOURNAL = [
	{
		symbol: "BTCUSDT",
		timeframe: "15m",
		indicator: "APEX1",
		side: "long",
		entry: 108420,
		sl: 107812,
		tp: 109028,
		qty: .092,
		leverage: 25,
		notional: 9975,
		risk: 56,
		fees: 8,
		rr: 1,
		atr: 214,
		reason: "APEX 1R FTC long · 15m · stop floor held",
		notes: "ورود تمیز بعد از تگ دوم. MAE کم ماند.",
		openedOffsetH: 320,
		holdH: 4.5,
		status: "closed",
		exit: 109028,
		exitReason: "tp",
		pnl: 48,
		pnlR: 1,
		maeR: .22,
		mfeR: 1.08,
		barsHeld: 18
	},
	{
		symbol: "ETHUSDT",
		timeframe: "1h",
		indicator: "HALC",
		side: "short",
		entry: 4318,
		sl: 4366,
		tp: 4212,
		qty: 2.3,
		leverage: 20,
		notional: 9931,
		risk: 110,
		fees: 8,
		rr: 2.2,
		atr: 28,
		reason: "HALCYON coil short · 1h box locked · 2.2R inside range",
		openedOffsetH: 290,
		holdH: 11,
		status: "closed",
		exit: 4212,
		exitReason: "tp",
		pnl: 228,
		pnlR: 2.18,
		maeR: .41,
		mfeR: 2.21,
		barsHeld: 11
	},
	{
		symbol: "SOLUSDT",
		timeframe: "5m",
		indicator: "TREX1",
		side: "long",
		entry: 178.42,
		sl: 176.91,
		tp: 179.93,
		qty: 55,
		leverage: 20,
		notional: 9813,
		risk: 83,
		fees: 8,
		rr: 1,
		atr: .62,
		reason: "TREX 1.0R FTC long · BE armed at +0.35R",
		notes: "استاپ به ورود رفت؛ از تارگت جا ماند.",
		openedOffsetH: 250,
		holdH: 1.2,
		status: "closed",
		exit: 178.44,
		exitReason: "be",
		pnl: -6,
		pnlR: .01,
		maeR: .18,
		mfeR: .52,
		barsHeld: 14,
		beMoved: true
	},
	{
		symbol: "BTCUSDT",
		timeframe: "4h",
		indicator: "APEX2",
		side: "short",
		entry: 111240,
		sl: 112180,
		tp: 109360,
		qty: .088,
		leverage: 20,
		notional: 9789,
		risk: 83,
		fees: 8,
		rr: 2,
		atr: 640,
		reason: "APEX 2R short only · 4h · relative volume ok",
		openedOffsetH: 230,
		holdH: 16,
		status: "closed",
		exit: 112180,
		exitReason: "sl",
		pnl: -91,
		pnlR: -1,
		maeR: 1.04,
		mfeR: .33,
		barsHeld: 4
	},
	{
		symbol: "AVAXUSDT",
		timeframe: "15m",
		indicator: "HAEG",
		side: "long",
		entry: 36.82,
		sl: 36.41,
		tp: 37.43,
		qty: 270,
		leverage: 25,
		notional: 9941,
		risk: 111,
		fees: 8,
		rr: 1.5,
		atr: .18,
		reason: "Aegis coil long · 15m compression · fill after second test",
		openedOffsetH: 200,
		holdH: 3.1,
		status: "closed",
		exit: 37.43,
		exitReason: "tp",
		pnl: 157,
		pnlR: 1.49,
		maeR: .27,
		mfeR: 1.52,
		barsHeld: 12
	},
	{
		symbol: "DOGEUSDT",
		timeframe: "15m",
		indicator: "APEX15",
		side: "short",
		entry: .2142,
		sl: .2168,
		tp: .2103,
		qty: 46e3,
		leverage: 25,
		notional: 9853,
		risk: 120,
		fees: 8,
		rr: 1.5,
		atr: .0011,
		reason: "APEX 1.5R short · stop floor widened",
		openedOffsetH: 176,
		holdH: 2.4,
		status: "closed",
		exit: .2168,
		exitReason: "sl",
		pnl: -128,
		pnlR: -1,
		maeR: .96,
		mfeR: .21,
		barsHeld: 9
	},
	{
		symbol: "LINKUSDT",
		timeframe: "1h",
		indicator: "HVES",
		side: "long",
		entry: 22.14,
		sl: 21.78,
		tp: 22.68,
		qty: 440,
		leverage: 20,
		notional: 9742,
		risk: 158,
		fees: 8,
		rr: 1.5,
		atr: .19,
		reason: "Vesper coil long · 1h · FTC spring",
		openedOffsetH: 150,
		holdH: 7,
		status: "closed",
		exit: 22.68,
		exitReason: "tp",
		pnl: 229,
		pnlR: 1.5,
		maeR: .19,
		mfeR: 1.62,
		barsHeld: 7
	},
	{
		symbol: "BTCUSDT",
		timeframe: "15m",
		indicator: "TREX12",
		side: "short",
		entry: 109880,
		sl: 110410,
		tp: 109244,
		qty: .09,
		leverage: 25,
		notional: 9889,
		risk: 48,
		fees: 8,
		rr: 1.2,
		atr: 198,
		reason: "TREX 1.2R FTC short · BE@0.32R",
		openedOffsetH: 128,
		holdH: 2.8,
		status: "closed",
		exit: 109876,
		exitReason: "be",
		pnl: -9,
		pnlR: .01,
		maeR: .24,
		mfeR: .44,
		barsHeld: 11,
		beMoved: true
	},
	{
		symbol: "ETHUSDT",
		timeframe: "5m",
		indicator: "APEX1",
		side: "short",
		entry: 4288,
		sl: 4316,
		tp: 4260,
		qty: 2.28,
		leverage: 25,
		notional: 9777,
		risk: 64,
		fees: 8,
		rr: 1,
		atr: 9.4,
		reason: "APEX 1R 5m shorts only",
		openedOffsetH: 110,
		holdH: .7,
		status: "closed",
		exit: 4260,
		exitReason: "tp",
		pnl: 56,
		pnlR: 1,
		maeR: .36,
		mfeR: 1.06,
		barsHeld: 8
	},
	{
		symbol: "SOLUSDT",
		timeframe: "1h",
		indicator: "HORI",
		side: "long",
		entry: 181.2,
		sl: 178.9,
		tp: 185.8,
		qty: 54,
		leverage: 20,
		notional: 9785,
		risk: 124,
		fees: 8,
		rr: 2,
		atr: 1.1,
		reason: "Orion coil long · 2R target fit inside locked box",
		openedOffsetH: 96,
		holdH: 9,
		status: "closed",
		exit: 178.9,
		exitReason: "sl",
		pnl: -132,
		pnlR: -1,
		maeR: 1.05,
		mfeR: .48,
		barsHeld: 9
	},
	{
		symbol: "BNBUSDT",
		timeframe: "15m",
		indicator: "APEX1",
		side: "long",
		entry: 612.4,
		sl: 608.1,
		tp: 616.7,
		qty: 16.1,
		leverage: 20,
		notional: 9860,
		risk: 69,
		fees: 8,
		rr: 1,
		atr: 1.8,
		reason: "APEX 1R FTC long · 15m",
		openedOffsetH: 78,
		holdH: 2.1,
		status: "closed",
		exit: 616.7,
		exitReason: "tp",
		pnl: 61,
		pnlR: 1,
		maeR: .14,
		mfeR: 1.05,
		barsHeld: 8
	},
	{
		symbol: "BTCUSDT",
		timeframe: "1h",
		indicator: "HALC",
		side: "short",
		entry: 110640,
		sl: 111390,
		tp: 108990,
		qty: .089,
		leverage: 20,
		notional: 9847,
		risk: 67,
		fees: 8,
		rr: 2.2,
		atr: 410,
		reason: "HALCYON native box short · 1h · 2.2R inside range",
		openedOffsetH: 62,
		holdH: 8,
		status: "closed",
		exit: 108990,
		exitReason: "tp",
		pnl: 139,
		pnlR: 2.2,
		maeR: .38,
		mfeR: 2.25,
		barsHeld: 8
	},
	{
		symbol: "OPUSDT",
		timeframe: "15m",
		indicator: "TREX1",
		side: "long",
		entry: 1.842,
		sl: 1.821,
		tp: 1.863,
		qty: 5300,
		leverage: 20,
		notional: 9763,
		risk: 111,
		fees: 8,
		rr: 1,
		atr: .008,
		reason: "TREX 1.0R FTC long · 15m",
		openedOffsetH: 46,
		holdH: 1.6,
		status: "closed",
		exit: 1.821,
		exitReason: "sl",
		pnl: -119,
		pnlR: -1,
		maeR: .88,
		mfeR: .29,
		barsHeld: 6
	},
	{
		symbol: "ETHUSDT",
		timeframe: "4h",
		indicator: "APEX15",
		side: "long",
		entry: 4220,
		sl: 4148,
		tp: 4328,
		qty: 2.32,
		leverage: 15,
		notional: 9790,
		risk: 167,
		fees: 8,
		rr: 1.5,
		atr: 42,
		reason: "APEX 1.5R long · 4h widen to stop floor",
		openedOffsetH: 34,
		holdH: 14,
		status: "closed",
		exit: 4328,
		exitReason: "tp",
		pnl: 242,
		pnlR: 1.5,
		maeR: .21,
		mfeR: 1.55,
		barsHeld: 4
	},
	{
		symbol: "SUIUSDT",
		timeframe: "15m",
		indicator: "HAEG",
		side: "short",
		entry: 3.412,
		sl: 3.448,
		tp: 3.358,
		qty: 2880,
		leverage: 25,
		notional: 9827,
		risk: 104,
		fees: 8,
		rr: 1.5,
		atr: .016,
		reason: "Aegis coil short · 15m locked box",
		openedOffsetH: 22,
		holdH: 2.2,
		status: "closed",
		exit: 3.358,
		exitReason: "tp",
		pnl: 147,
		pnlR: 1.5,
		maeR: .31,
		mfeR: 1.11,
		barsHeld: 9
	},
	{
		symbol: "BTCUSDT",
		timeframe: "15m",
		indicator: "APEX1",
		side: "short",
		entry: 109210,
		sl: 109760,
		tp: 108660,
		qty: .09,
		leverage: 25,
		notional: 9829,
		risk: 50,
		fees: 8,
		rr: 1,
		atr: 188,
		reason: "APEX 1R FTC short · 15m",
		openedOffsetH: 10,
		holdH: 1.4,
		status: "closed",
		exit: 109760,
		exitReason: "sl",
		pnl: -57,
		pnlR: -1,
		maeR: 1,
		mfeR: .12,
		barsHeld: 5
	},
	{
		symbol: "ETHUSDT",
		timeframe: "15m",
		indicator: "TREX1",
		side: "long",
		entry: 4296,
		sl: 4264,
		tp: 4328,
		qty: 2.3,
		leverage: 20,
		notional: 9881,
		risk: 74,
		fees: 4,
		rr: 1,
		atr: 11,
		reason: "TREX 1.0R FTC long · 15m · open, BE not armed yet",
		notes: "پوزیشن باز نمونه — هنوز به +0.35R نرسیده.",
		openedOffsetH: 1.5,
		holdH: 0,
		status: "open"
	},
	{
		symbol: "BTCUSDT",
		timeframe: "1h",
		indicator: "KETEX",
		side: "long",
		entry: 108880,
		sl: 107940,
		tp: 110948,
		qty: .09,
		leverage: 20,
		notional: 9799,
		risk: 85,
		fees: 8,
		rr: 2.2,
		atr: 410,
		reason: "KETEX 2.2R second-test support · NEXUS close · FTC tag",
		notes: "رژیم EMA84 و کلوز بالای FTC. استاپ ثابت، بدون BE.",
		openedOffsetH: 48,
		holdH: 7,
		status: "closed",
		exit: 110948,
		exitReason: "tp",
		pnl: 178,
		pnlR: 2.18,
		maeR: .28,
		mfeR: 2.21,
		barsHeld: 7
	},
	{
		symbol: "SOLUSDT",
		timeframe: "15m",
		indicator: "KETEX",
		side: "short",
		entry: 181.6,
		sl: 183.4,
		tp: 177.64,
		qty: 54,
		leverage: 20,
		notional: 9806,
		risk: 97,
		fees: 8,
		rr: 2.2,
		atr: .71,
		reason: "KETEX 2.2R second-test resistance · NEXUS close · FTC tag",
		notes: "HTF کوتاه بود؛ کلوز زیر FTC تأیید شد. استاپ خورد.",
		openedOffsetH: 16,
		holdH: 2.1,
		status: "closed",
		exit: 183.4,
		exitReason: "sl",
		pnl: -105,
		pnlR: -1,
		maeR: 1.02,
		mfeR: .44,
		barsHeld: 8
	},
	{
		symbol: "BTCUSDT",
		timeframe: "4h",
		indicator: "SHETEX",
		side: "long",
		entry: 107450,
		sl: 106210,
		tp: 109682,
		qty: .091,
		leverage: 20,
		notional: 9778,
		risk: 113,
		fees: 8,
		rr: 1.8,
		atr: 520,
		reason: "SHETEX 1.8R second-test support · FTC tag",
		notes: "بومی ۴ساعته. تگ FTC بدون کلوز تأیید. HTF EMA50 هم‌راستا.",
		openedOffsetH: 36,
		holdH: 12,
		status: "closed",
		exit: 109682,
		exitReason: "tp",
		pnl: 195,
		pnlR: 1.79,
		maeR: .24,
		mfeR: 1.82,
		barsHeld: 3
	},
	{
		symbol: "ETHUSDT",
		timeframe: "1h",
		indicator: "SHETEX",
		side: "short",
		entry: 4288,
		sl: 4341,
		tp: 4192.6,
		qty: 2.2,
		leverage: 20,
		notional: 9434,
		risk: 117,
		fees: 8,
		rr: 1.8,
		atr: 22,
		reason: "SHETEX 1.8R second-test resistance · FTC tag",
		notes: "استاپ خورد؛ استاپ ثابت ماند چون BE ندارد.",
		openedOffsetH: 20,
		holdH: 5,
		status: "closed",
		exit: 4341,
		exitReason: "sl",
		pnl: -124,
		pnlR: -1,
		maeR: 1,
		mfeR: .38,
		barsHeld: 5
	}
];
var DEFAULT_LEV_SIZE_TIERS = [
	{
		leverage: 5,
		capitalPct: 15
	},
	{
		leverage: 10,
		capitalPct: 12
	},
	{
		leverage: 25,
		capitalPct: 6
	}
];
function clampCapitalPct(n, fallback = 3) {
	const v = Number(n);
	if (!Number.isFinite(v)) return Math.min(100, Math.max(1, fallback));
	return Math.min(100, Math.max(1, v));
}
function parseLevSizeTiers(raw) {
	let arr = raw;
	if (raw == null) return DEFAULT_LEV_SIZE_TIERS.map((t) => ({ ...t }));
	if (typeof raw === "string") {
		const s = raw.trim();
		if (!s) return DEFAULT_LEV_SIZE_TIERS.map((t) => ({ ...t }));
		try {
			arr = JSON.parse(s);
		} catch {
			return DEFAULT_LEV_SIZE_TIERS.map((t) => ({ ...t }));
		}
	}
	if (!Array.isArray(arr)) return DEFAULT_LEV_SIZE_TIERS.map((t) => ({ ...t }));
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of arr) {
		if (!row || typeof row !== "object") continue;
		const rec = row;
		const leverage = Math.round(Number(rec.leverage));
		const capitalPct = clampCapitalPct(Number(rec.capitalPct), NaN);
		if (!Number.isFinite(leverage) || leverage < 1 || leverage > 200) continue;
		if (!Number.isFinite(capitalPct)) continue;
		if (seen.has(leverage)) continue;
		seen.add(leverage);
		out.push({
			leverage,
			capitalPct
		});
	}
	out.sort((a, b) => a.leverage - b.leverage);
	return out;
}
function stringifyLevSizeTiers(tiers) {
	return JSON.stringify(parseLevSizeTiers(tiers));
}
/** Margin % of equity for this fill. Match the coin's venue max leverage, else the default. */
function capitalPctForLeverage(usedLeverage, defaultPct, tiers) {
	const lev = Math.round(Number(usedLeverage));
	const hit = tiers.find((t) => t.leverage === lev);
	return clampCapitalPct(hit ? hit.capitalPct : defaultPct);
}
/** Notional as % of equity = margin% × leverage. */
function notionalPctOfEquity(marginPct, leverage) {
	return clampCapitalPct(marginPct) * Math.max(1, Number(leverage) || 1);
}
/** Columns that never leave the server in plaintext — AES-256-GCM at rest in Neon. */
var SECRET_SETTING_KEYS = [
	"lighter_api_key",
	"lighter_api_private_key",
	"aster_api_key",
	"aster_api_secret",
	"ourbit_api_key",
	"ourbit_api_secret",
	"hyperliquid_private_key"
];
var PREFIX = "enc:v1:";
function keyMaterial() {
	const ikm = typeof process !== "undefined" && process.env.DATABASE_URL?.trim() ? process.env.DATABASE_URL.trim() : "pglite-local";
	return Buffer.from(hkdfSync("sha256", ikm, "apex-desk", "neon-venue-secrets-v1", 32));
}
function isSealedSecret(value) {
	return typeof value === "string" && value.startsWith(PREFIX);
}
function sealSecret(plain) {
	const text = plain.trim();
	if (!text) return "";
	if (isSealedSecret(text)) return text;
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", keyMaterial(), iv);
	const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `${PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}
function openSecret(value) {
	if (value == null) return null;
	const raw = value.trim();
	if (!raw) return null;
	if (!isSealedSecret(raw)) return raw;
	const parts = raw.slice(7).split(".");
	if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) throw new Error("sealed secret is malformed");
	const iv = Buffer.from(parts[0], "base64url");
	const tag = Buffer.from(parts[1], "base64url");
	const data = Buffer.from(parts[2], "base64url");
	const decipher = createDecipheriv("aes-256-gcm", keyMaterial(), iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
function persistSecret(value) {
	if (value == null) return null;
	const s = String(value).trim();
	if (!s) return null;
	return sealSecret(s);
}
function num(v, d = 0) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : d;
}
var TOKEN_DIR = join(process.cwd(), ".data");
var TOKEN_FILE = join(TOKEN_DIR, "desk-token");
function isPlaceholderToken(token) {
	const t = (token ?? "").trim();
	return !t || t === "change-me";
}
function readPinnedToken() {
	try {
		if (!existsSync(TOKEN_FILE)) return null;
		const t = readFileSync(TOKEN_FILE, "utf8").trim();
		if (isPlaceholderToken(t)) return null;
		if (!/^[a-f0-9]{16,128}$/i.test(t)) return null;
		return t;
	} catch {
		return null;
	}
}
function pinToken(token) {
	if (isPlaceholderToken(token)) return;
	try {
		mkdirSync(TOKEN_DIR, { recursive: true });
		writeFileSync(TOKEN_FILE, token, {
			encoding: "utf8",
			mode: 384
		});
	} catch {}
}
function publicSettings(row, opts) {
	const unlocked = Boolean(opts?.unlocked);
	return {
		mode: row.mode,
		venue: bookVenue(row.venue),
		riskPct: num(row.risk_pct, 1),
		capitalPct: num(row.capital_pct, 3),
		maxLeverage: Math.min(200, Math.max(1, Math.round(num(row.max_leverage, 200)))),
		stackLevCount: Math.min(20, Math.max(0, Math.round(num(row.stack_lev_count, 2)))),
		stackLevCap: Math.min(200, Math.max(1, Math.round(num(row.stack_lev_cap, 75)))),
		levSizeTiers: parseLevSizeTiers(row.lev_size_tiers),
		maxPositions: num(row.max_positions, 4),
		minMarketCapUsd: num(row.min_market_cap_usd, 0),
		equityUsd: num(row.equity_usd, 1e4),
		availableUsd: num(row.equity_usd, 1e4),
		startingEquityUsd: num(row.starting_equity_usd, 1e4),
		liveEnabled: Boolean(num(row.live_enabled)),
		botEnabled: Boolean(num(row.bot_enabled, 1)),
		paper24h: Boolean(num(row.paper_24h, 1)),
		tickToken: unlocked ? row.tick_token : "",
		tokenIsDefault: isPlaceholderToken(row.tick_token),
		scanCursor: num(row.scan_cursor),
		scanBatch: num(row.scan_batch, 0),
		lastTickAt: row.last_tick_at,
		lastTickSource: row.last_tick_source ?? null,
		dbSource: getDbSource(),
		durable: getDbSource() === "neon",
		serverless: isServerlessRuntime(),
		hasLighter: Boolean(row.lighter_api_private_key || row.lighter_api_key),
		hasAster: (() => {
			const pk = (row.aster_api_secret ?? "").trim();
			if (/^(0x)?[0-9a-fA-F]{64}$/.test(pk)) return true;
			return Boolean(row.aster_api_key && row.aster_api_secret);
		})(),
		hasOurbit: Boolean(row.ourbit_api_key && row.ourbit_api_secret),
		hasHyperliquid: Boolean(row.hyperliquid_private_key),
		lighterAccountIndex: unlocked ? row.lighter_account_index : null,
		lighterKeyIndex: unlocked ? row.lighter_api_key_index : null,
		lighterKeyHint: unlocked && row.lighter_api_key ? mask(row.lighter_api_key) : "",
		asterKeyHint: unlocked && row.aster_api_key ? mask(row.aster_api_key) : "",
		ourbitKeyHint: unlocked && row.ourbit_api_key ? mask(row.ourbit_api_key) : "",
		hyperliquidAddrHint: unlocked && row.hyperliquid_wallet_address ? mask(row.hyperliquid_wallet_address) : "",
		hyperliquidKeyHint: unlocked && row.hyperliquid_private_key ? mask(row.hyperliquid_private_key) : "",
		hasPin: Boolean(row.operator_pin_hash),
		unlocked,
		universeVenue: bookVenue(row.universe_venue),
		engineGates: row.engine_gates ?? "{}"
	};
}
function mask(s) {
	if (s.length <= 8) return "••••";
	return `${s.slice(0, 4)}••••${s.slice(-4)}`;
}
async function revealSecrets(row) {
	const sql = await getSql();
	const next = { ...row };
	for (const key of SECRET_SETTING_KEYS) {
		const raw = row[key];
		if (typeof raw !== "string" || !raw.trim()) {
			next[key] = null;
			continue;
		}
		if (!isSealedSecret(raw)) {
			try {
				await sql.query(`update desk_settings set ${key} = $1, updated_at = now() where id = 1`, [persistSecret(raw)]);
			} catch {}
			next[key] = raw.trim();
			continue;
		}
		try {
			next[key] = openSecret(raw);
		} catch {
			next[key] = null;
		}
	}
	return next;
}
async function ensureTickHardeningColumns(sql) {
	for (const ddl of [
		"alter table desk_settings add column if not exists scan_cursors text not null default '{}'",
		"alter table desk_settings add column if not exists orphan_fills text not null default '[]'",
		"alter table desk_settings add column if not exists tick_lock_id text",
		"alter table desk_settings add column if not exists tick_lock_at timestamptz",
		"alter table desk_settings add column if not exists engine_gates text not null default '{}'",
		"alter table desk_settings add column if not exists ourbit_api_key text",
		"alter table desk_settings add column if not exists ourbit_api_secret text",
		"alter table desk_settings add column if not exists stack_lev_count integer not null default 2",
		"alter table desk_settings add column if not exists stack_lev_cap integer not null default 75",
		"alter table desk_settings add column if not exists lev_size_tiers text not null default '[{\"leverage\":5,\"capitalPct\":15},{\"leverage\":10,\"capitalPct\":12},{\"leverage\":25,\"capitalPct\":6}]'",
		"alter table desk_settings alter column capital_pct set default 3",
		"alter table desk_settings alter column venue set default 'aster'"
	]) try {
		await sql.query(ddl);
	} catch {}
	try {
		await sql.query(`update desk_settings set venue = 'ourbit' where venue = 'toobit'`);
		await sql.query(`update desk_settings set universe_venue = 'ourbit' where universe_venue = 'toobit'`);
	} catch {}
}
async function getSettings() {
	const sql = await getSql();
	let row = (await sql`select * from desk_settings where id = 1`)[0];
	if (!row) {
		await sql`insert into desk_settings (id) values (1) on conflict (id) do nothing`;
		row = (await sql`select * from desk_settings where id = 1`)[0];
	}
	if (row.max_leverage == null) try {
		await sql.query("alter table desk_settings add column if not exists max_leverage integer not null default 200");
		const again = await sql`select * from desk_settings where id = 1`;
		if (again[0]) row = again[0];
	} catch {}
	await ensureTickHardeningColumns(sql);
	const pinned = readPinnedToken();
	if (!isPlaceholderToken(row.tick_token)) {
		if (pinned !== row.tick_token) pinToken(row.tick_token);
		return revealSecrets(row);
	}
	if (pinned) {
		await sql`
      update desk_settings
      set tick_token = ${pinned}, updated_at = now()
      where id = 1 and (tick_token = 'change-me' or tick_token is null or tick_token = '')
    `;
		row = (await sql`select * from desk_settings where id = 1`)[0];
	}
	return revealSecrets(row);
}
async function rotateTickToken() {
	const sql = await getSql();
	await getSettings();
	const token = randomBytes(16).toString("hex");
	pinToken(token);
	await sql`update desk_settings set tick_token = ${token}, updated_at = now() where id = 1`;
	return getSettings();
}
async function patchSettings(patch) {
	const sql = await getSql();
	await getSettings();
	const allowed = /* @__PURE__ */ new Set([
		"mode",
		"venue",
		"risk_pct",
		"capital_pct",
		"max_leverage",
		"stack_lev_count",
		"stack_lev_cap",
		"lev_size_tiers",
		"max_positions",
		"min_market_cap_usd",
		"equity_usd",
		"starting_equity_usd",
		"live_enabled",
		"bot_enabled",
		"paper_24h",
		"scan_batch",
		"lighter_api_key",
		"lighter_api_private_key",
		"lighter_account_index",
		"lighter_api_key_index",
		"aster_api_key",
		"aster_api_secret",
		"ourbit_api_key",
		"ourbit_api_secret",
		"hyperliquid_private_key",
		"hyperliquid_wallet_address",
		"engine_gates"
	]);
	const flags = /* @__PURE__ */ new Set([
		"live_enabled",
		"bot_enabled",
		"paper_24h"
	]);
	const secretKeys = new Set(SECRET_SETTING_KEYS);
	const entries = Object.entries(patch).filter(([k, v]) => v !== void 0 && allowed.has(k));
	if (!entries.length) return getSettings();
	for (const [k, raw] of entries) {
		const v = secretKeys.has(k) ? persistSecret(raw) : flags.has(k) ? raw ? 1 : 0 : raw;
		try {
			await sql.query(`update desk_settings set ${k} = $1, updated_at = now() where id = 1`, [v]);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			if (flags.has(k) && /boolean|type/i.test(msg)) {
				await sql.query(`update desk_settings set ${k} = $1, updated_at = now() where id = 1`, [Boolean(v)]);
				continue;
			}
			if (/does not exist/i.test(msg)) continue;
			throw err;
		}
	}
	return getSettings();
}
async function listOpenPositions() {
	return (await (await getSql())`
    select * from positions where status = 'open' order by opened_at desc
  `).map((r) => ({
		...r,
		qty: Number(r.qty ?? r.size ?? 0)
	}));
}
async function listClosedPositions(limit = 80) {
	return (await (await getSql())`
    select * from positions where status = 'closed' order by closed_at desc limit ${limit}
  `).map((r) => ({
		...r,
		qty: Number(r.qty ?? r.size ?? 0)
	}));
}
async function listSignals(limit = 80) {
	return (await getSql())`select * from signals order by ts desc limit ${limit}`;
}
async function listEquity(limit = 120) {
	return (await getSql())`
    select ts, equity_usd, open_count, mode from equity_snapshots order by ts desc limit ${limit}
  `;
}
async function listScanLog(limit = 20) {
	return (await getSql())`
    select ts, scanned, signals, opened, closed, duration_ms, note, source from scan_log order by ts desc limit ${limit}
  `;
}
async function listUniverse() {
	const sql = await getSql();
	try {
		return await sql`select symbol, base, name, market_cap_usd, volume_24h_usd, max_leverage, venue_symbol from universe_assets order by market_cap_usd desc`;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (!/venue_symbol|does not exist/i.test(msg)) throw err;
		return (await sql`select symbol, base, name, market_cap_usd, volume_24h_usd, max_leverage from universe_assets order by market_cap_usd desc`).map((r) => ({
			...r,
			venue_symbol: null
		}));
	}
}
async function setUniverseVenue(venue) {
	const sql = await getSql();
	try {
		await sql.query(`update desk_settings set universe_venue = $1, updated_at = now() where id = 1`, [venue || null]);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/does not exist/i.test(msg)) return;
		throw err;
	}
}
async function clearUniverse() {
	await (await getSql()).query(`delete from universe_assets`);
}
async function replaceUniverse(rows) {
	if (!rows.length) return;
	const sql = await getSql();
	const CHUNK = 80;
	for (let i = 0; i < rows.length; i += CHUNK) {
		const chunk = rows.slice(i, i + CHUNK);
		const values = [];
		const tuples = chunk.map((r, idx) => {
			const lev = Math.max(1, Math.round(Number(r.maxLeverage) || 1));
			const base = idx * 7;
			values.push(r.symbol, r.base, r.name, r.marketCapUsd, r.volume24hUsd, lev, r.venueSymbol ?? r.symbol);
			return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
		});
		await sql.query(`insert into universe_assets (symbol, base, name, market_cap_usd, volume_24h_usd, max_leverage, venue_symbol)
       values ${tuples.join(", ")}
       on conflict (symbol) do update set
         base = excluded.base,
         name = excluded.name,
         market_cap_usd = excluded.market_cap_usd,
         volume_24h_usd = excluded.volume_24h_usd,
         max_leverage = excluded.max_leverage,
         venue_symbol = excluded.venue_symbol,
         updated_at = now()`, values);
	}
	const keep = rows.map((r) => r.symbol);
	const placeholders = keep.map((_, i) => `$${i + 1}`).join(", ");
	await sql.query(`delete from universe_assets where symbol not in (${placeholders})`, keep);
}
async function insertSignal(s) {
	const sql = await getSql();
	const existing = await sql`
    select id from signals
    where symbol = ${s.symbol}
      and timeframe = ${s.timeframe}
      and indicator = ${s.indicator}
      and bar_time = ${s.barTime}
    limit 1
  `;
	if (existing[0]) return existing[0].id;
	try {
		return (await sql`
      insert into signals (bar_time, symbol, timeframe, indicator, side, entry, sl, tp, rr, atr, reason, taken, skip_reason)
      values (${s.barTime}, ${s.symbol}, ${s.timeframe}, ${s.indicator}, ${s.side}, ${s.entry}, ${s.sl}, ${s.tp}, ${s.rr}, ${s.atr}, ${s.reason}, ${s.taken ? 1 : 0}, ${s.skipReason ?? null})
      returning id
    `)[0]?.id ?? 0;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/duplicate key|unique constraint|signals_dedupe/i.test(msg)) return (await sql`
        select id from signals
        where symbol = ${s.symbol}
          and timeframe = ${s.timeframe}
          and indicator = ${s.indicator}
          and bar_time = ${s.barTime}
        limit 1
      `)[0]?.id ?? 0;
		throw err;
	}
}
async function alreadyFilled(opts) {
	const sql = await getSql();
	try {
		if ((await sql`
      select id from positions
      where symbol = ${opts.symbol}
        and timeframe = ${opts.timeframe}
        and indicator = ${opts.indicator}
        and bar_time = ${opts.barTime}
      limit 1
    `)[0]) return true;
		const byEntry = await sql`
      select id from positions
      where symbol = ${opts.symbol}
        and timeframe = ${opts.timeframe}
        and indicator = ${opts.indicator}
        and side = ${opts.side}
        and (bar_time is null or bar_time = 0)
        and abs(entry - ${opts.entry}) < ${Math.max(1e-10, Math.abs(opts.entry) * 1e-8)}
      limit 1
    `;
		return Boolean(byEntry[0]);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/bar_time|does not exist/i.test(msg)) return false;
		throw err;
	}
}
function tickLockStaleMs() {
	if (process.env.VERCEL) return 2e4;
	return 55e3;
}
async function acquireTickLock() {
	const sql = await getSql();
	await ensureTickHardeningColumns(sql);
	const token = randomBytes(12).toString("hex");
	const staleMs = tickLockStaleMs();
	try {
		if ((await sql`
      update desk_settings
      set tick_lock_at = now(), tick_lock_id = ${token}
      where id = 1
        and (
          tick_lock_id is null
          or tick_lock_at is null
          or tick_lock_at < now() - (${staleMs}::int * interval '1 millisecond')
        )
      returning id
    `)[0]) return token;
		return null;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/tick_lock_id|tick_lock_at|does not exist/i.test(msg)) return null;
		throw err;
	}
}
async function heartbeatTickLock(token) {
	if (!token) return false;
	const sql = await getSql();
	try {
		const rows = await sql`
      update desk_settings
      set tick_lock_at = now()
      where id = 1 and tick_lock_id = ${token}
      returning id
    `;
		return Boolean(rows[0]);
	} catch {
		return false;
	}
}
async function releaseTickLock(token) {
	if (!token) return;
	const sql = await getSql();
	try {
		await sql`
      update desk_settings
      set tick_lock_at = null, tick_lock_id = null
      where id = 1 and tick_lock_id = ${token}
    `;
	} catch {}
}
async function insertPosition(p) {
	const sql = await getSql();
	const barTime = p.barTime && p.barTime > 0 ? p.barTime : null;
	let id = 0;
	try {
		id = (await sql`
      insert into positions (mode, venue, symbol, timeframe, indicator, side, entry, sl, tp, qty, size, leverage, notional_usd, risk_usd, fees_usd, exchange_order_id, status, bar_time)
      values (${p.mode}, ${p.venue}, ${p.symbol}, ${p.timeframe}, ${p.indicator}, ${p.side}, ${p.entry}, ${p.sl}, ${p.tp}, ${p.qty}, ${p.qty}, ${p.leverage}, ${p.notional}, ${p.risk}, ${p.fees}, ${p.orderId ?? null}, 'open', ${barTime})
      returning id
    `)[0]?.id ?? 0;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/duplicate key|unique constraint|positions_dedupe/i.test(msg)) return 0;
		if (!/column "size"|column "bar_time"/i.test(msg)) throw err;
		try {
			id = (await sql`
        insert into positions (mode, venue, symbol, timeframe, indicator, side, entry, sl, tp, qty, leverage, notional_usd, risk_usd, fees_usd, exchange_order_id, status, bar_time)
        values (${p.mode}, ${p.venue}, ${p.symbol}, ${p.timeframe}, ${p.indicator}, ${p.side}, ${p.entry}, ${p.sl}, ${p.tp}, ${p.qty}, ${p.leverage}, ${p.notional}, ${p.risk}, ${p.fees}, ${p.orderId ?? null}, 'open', ${barTime})
        returning id
      `)[0]?.id ?? 0;
		} catch (err2) {
			const msg2 = err2 instanceof Error ? err2.message : String(err2);
			if (/duplicate key|unique constraint|positions_dedupe/i.test(msg2)) return 0;
			if (!/column "bar_time"/i.test(msg2)) throw err2;
			id = (await sql`
        insert into positions (mode, venue, symbol, timeframe, indicator, side, entry, sl, tp, qty, leverage, notional_usd, risk_usd, fees_usd, exchange_order_id, status)
        values (${p.mode}, ${p.venue}, ${p.symbol}, ${p.timeframe}, ${p.indicator}, ${p.side}, ${p.entry}, ${p.sl}, ${p.tp}, ${p.qty}, ${p.leverage}, ${p.notional}, ${p.risk}, ${p.fees}, ${p.orderId ?? null}, 'open')
        returning id
      `)[0]?.id ?? 0;
		}
	}
	if (id) await stampPositionMeta(id, p);
	return id;
}
async function stampPositionMeta(id, p) {
	const sql = await getSql();
	try {
		await sql`
      update positions
      set orig_sl = ${p.origSl ?? p.sl},
          signal_reason = ${p.signalReason ?? null},
          atr_at_entry = ${p.atr ?? null},
          equity_at_open = ${p.equityAtOpen ?? null},
          rr_planned = ${p.rrPlanned ?? null},
          margin_usd = ${p.margin ?? null}
      where id = ${id}
    `;
	} catch {}
}
async function closePosition(id, exit, reason, pnl, pnlR, extra) {
	const sql = await getSql();
	await sql`
    update positions
    set status = 'closed', closed_at = now(), exit_px = ${exit}, exit_reason = ${reason}, pnl_usd = ${pnl}, pnl_r = ${pnlR}
    where id = ${id} and status = 'open'
  `;
	if (extra?.feesUsd != null && Number.isFinite(extra.feesUsd)) try {
		await sql`update positions set fees_usd = ${extra.feesUsd} where id = ${id}`;
	} catch {}
	if (!extra) return;
	try {
		await sql`
      update positions
      set mae_r = ${extra.maeR ?? null},
          mfe_r = ${extra.mfeR ?? null},
          bars_held = ${extra.barsHeld ?? null},
          hold_ms = ${extra.holdMs ?? null},
          be_moved = ${extra.beMoved ? 1 : 0}
      where id = ${id}
    `;
	} catch {}
}
async function resetJournal(scope) {
	const sql = await getSql();
	if (scope === "paper") await sql`delete from positions where mode = 'paper' or venue = 'paper'`;
	else await sql`delete from positions where status = 'closed'`;
	await sql`delete from signals`;
	await sql`delete from scan_log`;
	await sql`delete from equity_snapshots`;
	await sql`delete from backtests`;
	const start = num((await getSettings()).starting_equity_usd, 1e4);
	try {
		await sql`
      update desk_settings
      set equity_usd = ${start}, scan_cursor = 0, journal_seeded = 1, updated_at = now()
      where id = 1
    `;
	} catch {
		await sql`
      update desk_settings
      set equity_usd = ${start}, scan_cursor = 0, updated_at = now()
      where id = 1
    `;
	}
	const open = await sql`select count(*)::int as n from positions where status = 'open'`;
	await sql`
    insert into equity_snapshots (equity_usd, open_count, mode)
    values (${start}, ${num(open[0]?.n)}, 'paper')
  `;
	return {
		ok: true,
		equity: start,
		open: num(open[0]?.n),
		scope
	};
}
async function saveTradeNote(id, notes) {
	await (await getSql())`update positions set notes = ${notes.slice(0, 2e3) || null} where id = ${id}`;
	return {
		ok: true,
		id
	};
}
async function maybeSeedJournal() {
	if (num((await (await getSql())`select count(*)::int as n from positions`)[0]?.n) > 0) return {
		ok: true,
		seeded: 0,
		skipped: true
	};
	if (num((await getSettings()).journal_seeded) > 0) return {
		ok: true,
		seeded: 0,
		skipped: true
	};
	return seedDemoJournal();
}
async function seedDemoJournal() {
	const sql = await getSql();
	if (num((await sql`select count(*)::int as n from positions`)[0]?.n) > 0) return {
		ok: true,
		seeded: 0,
		skipped: true
	};
	const start = num((await getSettings()).starting_equity_usd, 1e4);
	const t0 = Date.now();
	let equity = start;
	let seeded = 0;
	try {
		await sql`delete from equity_snapshots`;
	} catch {}
	await sql`
    insert into equity_snapshots (ts, equity_usd, open_count, mode)
    values (${(/* @__PURE__ */ new Date(t0 - 72e6)).toISOString()}, ${start}, 0, 'paper')
  `;
	for (const t of DEMO_JOURNAL) {
		const opened = (/* @__PURE__ */ new Date(t0 - t.openedOffsetH * 36e5)).toISOString();
		const closed = t.status === "closed" ? (/* @__PURE__ */ new Date(t0 - (t.openedOffsetH - t.holdH) * 36e5)).toISOString() : null;
		const id = await insertPosition({
			mode: "paper",
			venue: "paper",
			symbol: t.symbol,
			timeframe: t.timeframe,
			indicator: t.indicator,
			side: t.side,
			entry: t.entry,
			sl: t.sl,
			tp: t.tp,
			qty: t.qty,
			leverage: t.leverage,
			notional: t.notional,
			risk: t.risk,
			fees: t.fees,
			barTime: Date.parse(opened),
			origSl: t.sl,
			signalReason: t.reason,
			atr: t.atr,
			equityAtOpen: equity,
			rrPlanned: t.rr,
			margin: t.notional / Math.max(1, t.leverage)
		});
		if (!id) continue;
		if (t.status === "closed" && t.exit != null && t.exitReason && t.pnl != null && t.pnlR != null) {
			await closePosition(id, t.exit, t.exitReason, t.pnl, t.pnlR, {
				maeR: t.maeR,
				mfeR: t.mfeR,
				barsHeld: t.barsHeld,
				holdMs: Math.round(t.holdH * 36e5),
				beMoved: Boolean(t.beMoved)
			});
			equity += t.pnl;
			try {
				await sql`
          update positions
          set opened_at = ${opened}, closed_at = ${closed}, notes = ${t.notes ?? null}
          where id = ${id}
        `;
			} catch {
				await sql`update positions set opened_at = ${opened}, closed_at = ${closed} where id = ${id}`;
			}
			await sql`
        insert into equity_snapshots (ts, equity_usd, open_count, mode)
        values (${closed}, ${equity}, 0, 'paper')
      `;
		} else try {
			await sql`update positions set opened_at = ${opened}, notes = ${t.notes ?? null} where id = ${id}`;
		} catch {
			await sql`update positions set opened_at = ${opened} where id = ${id}`;
		}
		seeded += 1;
	}
	try {
		await sql`
      update desk_settings
      set equity_usd = ${equity}, journal_seeded = 1, updated_at = now()
      where id = 1
    `;
	} catch {
		await sql`update desk_settings set equity_usd = ${equity}, updated_at = now() where id = 1`;
	}
	return {
		ok: true,
		seeded,
		skipped: false,
		equity
	};
}
async function updatePositionSl(id, sl) {
	await (await getSql())`update positions set sl = ${sl} where id = ${id} and status = 'open'`;
}
async function bumpEquity(delta) {
	await (await getSql())`update desk_settings set equity_usd = equity_usd + ${delta}, updated_at = now() where id = 1`;
}
async function setEquity(equity) {
	if (!Number.isFinite(equity)) return;
	await (await getSql())`update desk_settings set equity_usd = ${equity}, updated_at = now() where id = 1`;
}
async function snapshotEquity(equity, openCount, mode) {
	await (await getSql())`insert into equity_snapshots (equity_usd, open_count, mode) values (${equity}, ${openCount}, ${mode})`;
}
async function touchTick(source) {
	await (await getSql())`update desk_settings set last_tick_at = now(), last_tick_source = ${source} where id = 1`;
}
async function logScan(scanned, signals, opened, closed, ms, note, source = "manual", opts) {
	const sql = await getSql();
	await sql`
    insert into scan_log (scanned, signals, opened, closed, duration_ms, note, source)
    values (${scanned}, ${signals}, ${opened}, ${closed}, ${ms}, ${note}, ${source})
  `;
	if (opts?.touch !== false) await sql`update desk_settings set last_tick_at = now(), last_tick_source = ${source} where id = 1`;
}
async function setScanCursor(n) {
	const sql = await getSql();
	await sql`update desk_settings set scan_cursor = ${n} where id = 1`;
	try {
		await sql`update desk_settings set scan_cursors = '{}' where id = 1`;
	} catch {}
}
function parseOrphans(raw) {
	let obj = raw;
	if (typeof raw === "string") try {
		obj = JSON.parse(raw);
	} catch {
		return [];
	}
	if (!Array.isArray(obj)) return [];
	return obj.filter((x) => Boolean(x) && typeof x === "object" && typeof x.symbol === "string");
}
async function listOrphanFills() {
	const sql = await getSql();
	await ensureTickHardeningColumns(sql);
	try {
		return parseOrphans((await sql`select orphan_fills from desk_settings where id = 1`)[0]?.orphan_fills);
	} catch {
		return [];
	}
}
async function rememberOrphanFill(fill) {
	const sql = await getSql();
	await ensureTickHardeningColumns(sql);
	const next = {
		...fill,
		at: fill.at ?? Date.now()
	};
	const rest = (await listOrphanFills()).filter((x) => x.symbol !== next.symbol);
	rest.push(next);
	const clipped = rest.slice(-20);
	await sql`update desk_settings set orphan_fills = ${JSON.stringify(clipped)} where id = 1`;
}
async function dropOrphanFill(symbol) {
	const sql = await getSql();
	const cur = await listOrphanFills();
	const next = cur.filter((x) => x.symbol !== symbol);
	if (next.length === cur.length) return;
	try {
		await sql`update desk_settings set orphan_fills = ${JSON.stringify(next)} where id = 1`;
	} catch {}
}
async function markScanProgress(opts) {
	const sql = await getSql();
	await sql`update desk_settings set scan_cursor = ${opts.cursor}, scan_epoch_ms = ${opts.epochMs} where id = 1`;
	if (opts.cursors) try {
		await sql`update desk_settings set scan_cursors = ${JSON.stringify(opts.cursors)} where id = 1`;
	} catch {}
	const d = opts.done;
	if (!d) return;
	if (d["5m"] != null) await sql`update desk_settings set scan_done_5m = ${d["5m"]} where id = 1`;
	if (d["15m"] != null) await sql`update desk_settings set scan_done_15m = ${d["15m"]} where id = 1`;
	if (d["1h"] != null) await sql`update desk_settings set scan_done_1h = ${d["1h"]} where id = 1`;
	if (d["4h"] != null) await sql`update desk_settings set scan_done_4h = ${d["4h"]} where id = 1`;
}
async function stats() {
	const sql = await getSql();
	const closed = await sql`
    select
      count(*)::int as n,
      coalesce(sum(case when pnl_usd > 0 then 1 else 0 end), 0)::int as wins,
      coalesce(sum(pnl_usd), 0) as pnl,
      coalesce(sum(pnl_r), 0) as r
    from positions where status = 'closed'
  `;
	const open = await sql`select count(*)::int as n from positions where status = 'open'`;
	const c = closed[0] ?? {
		n: 0,
		wins: 0,
		pnl: 0,
		r: 0
	};
	return {
		closed: num(c.n),
		wins: num(c.wins),
		pnl: num(c.pnl),
		r: num(c.r),
		open: num(open[0]?.n),
		winRate: num(c.n) ? 100 * num(c.wins) / num(c.n) : 0
	};
}
var ENGINE_TFS = [
	"5m",
	"15m",
	"1h",
	"4h"
];
var ENGINE_SIDES = ["long", "short"];
var ENGINE_FAMILIES = [
	{
		id: "apex",
		label: "APEX",
		names: [
			"APEX1",
			"APEX15",
			"APEX2"
		]
	},
	{
		id: "halcyon",
		label: "HALCYON",
		names: [
			"HAEG",
			"HVES",
			"HORI",
			"HALC"
		]
	},
	{
		id: "trex",
		label: "TREX",
		names: ["TREX1", "TREX12"]
	},
	{
		id: "ketex",
		label: "KETEX",
		names: ["KETEX"]
	},
	{
		id: "shetex",
		label: "SHETEX",
		names: ["SHETEX"]
	}
];
var NAME_SET = new Set(ALL_INDICATORS);
var TF_SET = new Set(ENGINE_TFS);
var SIDES_KEY = "_sides";
function parseEngineGates(raw) {
	let obj = raw;
	if (typeof raw === "string") {
		const t = raw.trim();
		if (!t) return {};
		try {
			obj = JSON.parse(t);
		} catch {
			return {};
		}
	}
	if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
	const out = {};
	for (const [name, row] of Object.entries(obj)) {
		if (name === SIDES_KEY) continue;
		if (!NAME_SET.has(name) || !row || typeof row !== "object" || Array.isArray(row)) continue;
		const next = {};
		for (const [tf, v] of Object.entries(row)) {
			if (!TF_SET.has(tf) || typeof v !== "boolean") continue;
			next[tf] = v;
		}
		if (Object.keys(next).length) out[name] = next;
	}
	return out;
}
function parseSideGates(raw) {
	let obj = raw;
	if (typeof raw === "string") {
		const t = raw.trim();
		if (!t) return {};
		try {
			obj = JSON.parse(t);
		} catch {
			return {};
		}
	}
	if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
	const block = obj[SIDES_KEY];
	if (!block || typeof block !== "object" || Array.isArray(block)) return {};
	const out = {};
	for (const [name, row] of Object.entries(block)) {
		if (!NAME_SET.has(name) || !row || typeof row !== "object" || Array.isArray(row)) continue;
		const next = {};
		for (const [side, v] of Object.entries(row)) {
			if (side !== "long" && side !== "short" || typeof v !== "boolean") continue;
			next[side] = v;
		}
		if (Object.keys(next).length) out[name] = next;
	}
	return out;
}
/** Missing cell = on. Only explicit false mutes that engine on that TF. */
function isEngineOn(gates, name, tf) {
	return gates[name]?.[tf] !== false;
}
/** Missing cell = on. Only explicit false mutes that engine's long or short. */
function isSideOn(sides, name, side) {
	if (!NAME_SET.has(name)) return true;
	return sides[name]?.[side] !== false;
}
function setEngineGate(gates, name, tf, on) {
	return {
		...gates,
		[name]: {
			...gates[name] ?? {},
			[tf]: on
		}
	};
}
function setSideGate(sides, name, side, on) {
	return {
		...sides,
		[name]: {
			...sides[name] ?? {},
			[side]: on
		}
	};
}
function setEngineRow(gates, name, on) {
	let next = gates;
	for (const tf of ENGINE_TFS) next = setEngineGate(next, name, tf, on);
	return next;
}
function setEngineCol(gates, tf, on) {
	let next = gates;
	for (const name of ALL_INDICATORS) next = setEngineGate(next, name, tf, on);
	return next;
}
function setAllEngines(on) {
	let next = {};
	for (const name of ALL_INDICATORS) next = setEngineRow(next, name, on);
	return next;
}
function setAllSides(sides, side, on) {
	let next = sides;
	for (const name of ALL_INDICATORS) next = setSideGate(next, name, side, on);
	return next;
}
function countArmed(gates) {
	const total = ALL_INDICATORS.length * ENGINE_TFS.length;
	let on = 0;
	for (const name of ALL_INDICATORS) for (const tf of ENGINE_TFS) if (isEngineOn(gates, name, tf)) on += 1;
	return {
		on,
		total
	};
}
function countSidesArmed(sides) {
	const total = ALL_INDICATORS.length;
	let longOn = 0;
	let shortOn = 0;
	for (const name of ALL_INDICATORS) {
		if (isSideOn(sides, name, "long")) longOn += 1;
		if (isSideOn(sides, name, "short")) shortOn += 1;
	}
	return {
		longOn,
		shortOn,
		total
	};
}
/** SCAN_RULE order, minus muted cells. Empty object = every engine stays on. */
function scanNames(tf, gates) {
	return SCAN_RULE[tf].filter((name) => isEngineOn(gates, name, tf));
}
function serializeEngineGates(gates, sides = {}) {
	const compact = {};
	for (const name of ALL_INDICATORS) for (const tf of ENGINE_TFS) {
		if (isEngineOn(gates, name, tf)) continue;
		const row = compact[name] ?? {};
		row[tf] = false;
		compact[name] = row;
	}
	const sideCompact = {};
	for (const name of ALL_INDICATORS) for (const side of ENGINE_SIDES) {
		if (isSideOn(sides, name, side)) continue;
		sideCompact[name] = sideCompact[name] ?? {};
		sideCompact[name][side] = false;
	}
	if (Object.keys(sideCompact).length) compact[SIDES_KEY] = sideCompact;
	return JSON.stringify(compact);
}
var SCAN_TFS = [
	"5m",
	"15m",
	"1h",
	"4h"
];
/**
* How long after a bar's close we still accept a fill.
* Window is the rest of the next bar of that TF so a 200-coin book can
* finish across 1-minute cron pings (Vercel ~10s/tick ≈ 30–40 coins).
*/
var FRESH_MS = {
	"5m": TF_MS["5m"] - 3e3,
	"15m": TF_MS["15m"] - 3e3,
	"1h": TF_MS["1h"] - 3e3,
	"4h": TF_MS["4h"] - 3e3
};
function emptyCursors() {
	return {
		"5m": {
			c: 0,
			e: 0
		},
		"15m": {
			c: 0,
			e: 0
		},
		"1h": {
			c: 0,
			e: 0
		},
		"4h": {
			c: 0,
			e: 0
		}
	};
}
function parseCursors(raw) {
	const out = emptyCursors();
	let obj = raw;
	if (typeof raw === "string") {
		const t = raw.trim();
		if (!t) return out;
		try {
			obj = JSON.parse(t);
		} catch {
			return out;
		}
	}
	if (!obj || typeof obj !== "object") return out;
	const rec = obj;
	for (const tf of SCAN_TFS) {
		const row = rec[tf];
		if (typeof row === "number" && Number.isFinite(row)) {
			out[tf] = {
				c: Math.max(0, Math.floor(row)),
				e: 0
			};
			continue;
		}
		if (!row || typeof row !== "object") continue;
		const c = Number(row.c);
		const e = Number(row.e);
		out[tf] = {
			c: Number.isFinite(c) ? Math.max(0, Math.floor(c)) : 0,
			e: Number.isFinite(e) ? e : 0
		};
	}
	return out;
}
/** Consecutive completed items from the start of a planned slice. */
function prefixCompleted(done) {
	let n = 0;
	while (n < done.length && done[n]) n += 1;
	return n;
}
/** Round-robin items from several slices so a 5m wave cannot starve 1h/4h. */
function interleaveSlices(slices) {
	const out = [];
	const max = Math.max(0, ...slices.map((s) => s.length));
	for (let i = 0; i < max; i++) for (const s of slices) {
		const x = s[i];
		if (x !== void 0) out.push(x);
	}
	return out;
}
function nextTfCursor(opts) {
	const start = shouldResetCursor(opts.epoch, opts.closedOpen) ? 0 : opts.cur;
	const len = Math.max(0, opts.universeLen);
	const prefix = Math.max(0, Math.min(opts.prefixDone, len || opts.prefixDone));
	if (!len) return {
		cursor: {
			c: 0,
			e: opts.closedOpen
		},
		wrapped: false
	};
	const nextRaw = start + prefix;
	const wrapped = nextRaw >= len && prefix > 0;
	return {
		cursor: {
			c: wrapped ? 0 : nextRaw % len,
			e: opts.closedOpen
		},
		wrapped
	};
}
/** Open time of the latest fully closed bar. */
function latestClosedOpen(tfMs, now) {
	return Math.floor(now / tfMs) * tfMs - tfMs;
}
function barCloseTime(barOpen, tfMs) {
	return barOpen + tfMs;
}
/**
* Cron: only TFs whose latest closed bar is still fresh and not fully swept.
* Manual: every TF (operator asked for a scan now).
*/
function dueTimeframes(now, scanDone, source) {
	if (!source || source === "manual") return SCAN_TFS.slice();
	return SCAN_TFS.filter((tf) => {
		const tfMs = TF_MS[tf];
		const closedOpen = latestClosedOpen(tfMs, now);
		if (closedOpen <= (scanDone[tf] || 0)) return false;
		const age = now - barCloseTime(closedOpen, tfMs);
		if (age < 0) return false;
		if (age > FRESH_MS[tf]) return false;
		return true;
	});
}
/** Cron only inspects the just-closed bar. Manual may look back a few. */
function scanLastN(source) {
	if (!source || source === "manual") return 4;
	return 1;
}
/** True only for the latest closed bar, and only while it is still fresh. */
function isFreshSignal(barOpen, tf, now) {
	const tfMs = TF_MS[tf];
	if (!Number.isFinite(barOpen) || barOpen <= 0) return false;
	if (barOpen !== latestClosedOpen(tfMs, now)) return false;
	const age = now - barCloseTime(barOpen, tfMs);
	return age >= -2e3 && age <= FRESH_MS[tf];
}
/** Start a new sweep for this TF when its latest closed bar changes. */
function shouldResetCursor(epochMs, latestClosed) {
	return latestClosed > 0 && latestClosed !== epochMs;
}
function usedMarginUsd(open) {
	return open.reduce((a, p) => {
		return a + (Number(p.notional_usd ?? p.notional) || 0) / Math.max(1, Number(p.leverage) || 1);
	}, 0);
}
function attachAvailable(settings, open) {
	if (settings.mode === "live" && settings.availableUsd != null && Number.isFinite(settings.availableUsd)) return {
		...settings,
		availableUsd: Math.max(0, settings.availableUsd)
	};
	return {
		...settings,
		availableUsd: Math.max(0, settings.equityUsd - usedMarginUsd(open))
	};
}
async function readVenueWallet(adapter, acc) {
	try {
		if (adapter.fetchWallet) {
			const w = await adapter.fetchWallet(acc);
			if (w && Number.isFinite(w.available) && Number.isFinite(w.equity)) return {
				equity: Math.max(0, w.equity),
				available: Math.max(0, w.available)
			};
		}
	} catch {}
	try {
		const bal = await adapter.fetchBalance(acc);
		if (bal != null && Number.isFinite(bal)) {
			const n = Math.max(0, bal);
			return {
				equity: n,
				available: n
			};
		}
	} catch {}
	return null;
}
var SCAN_BARS = 360;
var MIN_BARS = 278;
var SCAN_CONCURRENCY = 16;
var MAX_BATCH = 250;
var UNIVERSE_TTL_MS = 18e5;
var LOCK_HEARTBEAT_MS = 5e3;
function tickBudgetMs() {
	const override = Number(process.env.TICK_BUDGET_MS);
	if (Number.isFinite(override) && override >= 3e3) return Math.min(55e3, override);
	if (process.env.VERCEL) {
		const cap = Number(process.env.VERCEL_MAX_DURATION);
		if (Number.isFinite(cap) && cap >= 15) return Math.min(55e3, cap * 1e3 - 2e3);
		return 8e3;
	}
	return 45e3;
}
var universeCache = null;
function clearUniverseCache() {
	universeCache = null;
}
function hasLiveKeys(s, venue) {
	if (venue === "hyperliquid") {
		const w = (s.hyperliquid_wallet_address ?? "").trim();
		return Boolean(s.hyperliquid_private_key) && /^0x[0-9a-fA-F]{40}$/.test(w);
	}
	if (venue === "lighter") return Boolean(s.lighter_api_private_key && s.lighter_account_index != null);
	if (venue === "aster") {
		const pk = (s.aster_api_secret ?? "").trim();
		if (/^(0x)?[0-9a-fA-F]{64}$/.test(pk)) return true;
		return Boolean(s.aster_api_key && s.aster_api_secret);
	}
	if (venue === "ourbit") return Boolean(s.ourbit_api_key && s.ourbit_api_secret);
	return false;
}
function accountFrom(s, venue) {
	if (venue === "aster") return {
		venue,
		apiKey: s.aster_api_key ?? void 0,
		apiSecret: s.aster_api_secret ?? void 0,
		walletAddress: s.aster_api_key ?? void 0,
		privateKey: s.aster_api_secret ?? void 0
	};
	if (venue === "ourbit") return {
		venue,
		apiKey: s.ourbit_api_key ?? void 0,
		apiSecret: s.ourbit_api_secret ?? void 0
	};
	if (venue === "hyperliquid") return {
		venue,
		privateKey: s.hyperliquid_private_key ?? void 0,
		walletAddress: s.hyperliquid_wallet_address ?? void 0
	};
	return {
		venue: "lighter",
		apiKey: s.lighter_api_key ?? void 0,
		privateKey: s.lighter_api_private_key ?? void 0,
		accountIndex: s.lighter_account_index ?? void 0,
		apiKeyIndex: s.lighter_api_key_index ?? 2
	};
}
var ORPHAN_MARK = "UNPROTECTED flatten failed";
function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
function withTimeout(p, ms) {
	return new Promise((resolve, reject) => {
		const t = setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), ms);
		p.then((v) => {
			clearTimeout(t);
			resolve(v);
		}, (e) => {
			clearTimeout(t);
			reject(e);
		});
	});
}
/** Overlay live venue balance / fill onto the desk payload. Style unchanged. */
async function overlayLiveSnapshot(settings, open) {
	const venue = bookVenue(settings.venue);
	if (settings.mode !== "live" || venue === "paper") return {
		settings: attachAvailable(settings, open),
		open
	};
	const row = await getSettings().catch(() => null);
	if (!row || !hasLiveKeys(row, venue)) return {
		settings: attachAvailable(settings, open),
		open
	};
	const adapter = getAdapter(venue);
	if (!adapter) return {
		settings: attachAvailable(settings, open),
		open
	};
	const acc = accountFrom(row, venue);
	let next = settings;
	try {
		const w = await withTimeout(readVenueWallet(adapter, acc), 5e3);
		if (w) {
			next = {
				...next,
				equityUsd: w.equity,
				availableUsd: w.available
			};
			await setEquity(w.equity).catch(() => void 0);
		} else next = attachAvailable(next, open);
	} catch {
		next = attachAvailable(next, open);
	}
	if (!open.length) return {
		settings: next,
		open
	};
	try {
		const vpos = await withTimeout(adapter.fetchPositions(acc), 5e3);
		const mapped = open.map((p) => {
			const hit = vpos.find((x) => sameCoin(x.symbol, p.symbol) || sameCoin(x.symbol, venueSymbol(venue, p.symbol)));
			if (!hit) return p;
			return {
				...p,
				entry: hit.entry > 0 ? hit.entry : p.entry,
				qty: hit.qty > 0 ? hit.qty : p.qty,
				leverage: hit.leverage > 0 ? hit.leverage : p.leverage,
				pnl_usd: Number.isFinite(hit.upl) ? hit.upl : p.pnl_usd
			};
		});
		return {
			settings: next,
			open: mapped
		};
	} catch {
		return {
			settings: next,
			open
		};
	}
}
async function resolveLiveExit(adapter, acc, venue, pos, fallbackPx) {
	const side = pos.side;
	const entry = Number(pos.entry);
	const origPx = origStopPx({
		side,
		entry,
		sl: Number(pos.sl),
		origSl: pos.orig_sl,
		qty: Number(pos.qty),
		risk: Number(pos.risk_usd)
	});
	const slDist = Math.abs(entry - origPx);
	let exit = fallbackPx;
	let pnl = null;
	let fees = null;
	if (adapter.fetchTrades) try {
		const openedAt = new Date(pos.opened_at).getTime();
		const hit = closeFromVenueTrades({
			side,
			entry,
			trades: await adapter.fetchTrades(acc, {
				symbol: venueSymbol(venue, pos.symbol),
				startTime: Math.max(0, openedAt - 15e3)
			}),
			openedAt
		});
		if (hit) {
			exit = hit.exit;
			pnl = hit.pnl;
			fees = hit.fees;
		}
	} catch {}
	if (pnl == null) {
		const settled = netClosePnl({
			side,
			entry,
			exit,
			qty: Number(pos.qty),
			riskUsd: Number(pos.risk_usd),
			openFee: Number(pos.fees_usd)
		});
		pnl = settled.pnl;
		if (fees == null) fees = settled.fees;
	}
	if (fees == null) {
		const settled = netClosePnl({
			side,
			entry,
			exit,
			qty: Number(pos.qty),
			riskUsd: Number(pos.risk_usd),
			openFee: Number(pos.fees_usd)
		});
		fees = settled.fees;
		if (pnl == null) pnl = settled.pnl;
	}
	const priceR = slDist > 0 ? (side === "long" ? exit - entry : entry - exit) / slDist : 0;
	const pnlR = netPnlR(pnl, Number(pos.risk_usd), priceR);
	return {
		exit,
		pnl,
		pnlR,
		fees
	};
}
async function confirmLiveFill(adapter, acc, symbol, sl, tp, orderId) {
	let last = {
		onVenue: false,
		hasSl: false,
		hasTp: false,
		unknown: true
	};
	for (let i = 0; i < 5; i++) {
		try {
			last = await adapter.fetchProtection(acc, {
				symbol,
				sl,
				tp
			});
			if (!last.unknown && last.onVenue && last.hasSl && last.hasTp) return {
				ok: true,
				orderId,
				message: "fill confirmed · SL/TP on venue"
			};
			if (!last.unknown && !last.onVenue) break;
		} catch {
			last = {
				onVenue: false,
				hasSl: false,
				hasTp: false,
				unknown: true
			};
		}
		if (i < 4) await sleep(400);
	}
	const why = last.unknown ? "live fill unconfirmed (venue read failed)" : !last.onVenue ? "live fill not on venue" : `live fill missing ${[!last.hasSl && "SL", !last.hasTp && "TP"].filter(Boolean).join("+")}`;
	try {
		const closed = await adapter.closePosition(acc, symbol);
		if (closed.ok || closed.message === "flat") return {
			ok: false,
			orderId,
			message: `${why} — flattened, no unprotected position left`
		};
		return {
			ok: false,
			liveOpen: true,
			orderId,
			message: `${why} — flatten failed (${closed.message})`
		};
	} catch (e) {
		return {
			ok: false,
			liveOpen: true,
			orderId,
			message: `${why} — flatten failed (${e instanceof Error ? e.message : "close threw"})`
		};
	}
}
function isOrphanPosition(pos) {
	return typeof pos.signal_reason === "string" && pos.signal_reason.includes(ORPHAN_MARK);
}
async function mapPool(items, limit, fn) {
	const out = [];
	let i = 0;
	async function worker() {
		while (i < items.length) {
			const idx = i++;
			out[idx] = await fn(items[idx]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
	return out;
}
function resolveBatch(raw, universeLen) {
	if (!universeLen) return 0;
	if (!Number.isFinite(raw) || raw <= 0) return Math.min(MAX_BATCH, universeLen);
	return Math.min(MAX_BATCH, universeLen, Math.max(1, Math.round(raw)));
}
async function refreshUniverse(minMcap, venue = "paper", force = false) {
	const floor = minCapUsd(minMcap);
	const book = bookVenue(venue);
	if (!force && universeCache && universeCache.venue === book && Date.now() - universeCache.at < UNIVERSE_TTL_MS && universeCache.assets.length) return filterByMinCap(universeCache.assets, floor, (a) => a.marketCapUsd);
	let listed = [];
	let listedErr = null;
	try {
		listed = await fetchVenueUniverse(book, force);
	} catch (e) {
		listedErr = e instanceof Error ? e : /* @__PURE__ */ new Error(`${book} listed markets empty`);
		listed = [];
	}
	if (!listed.length && universeCache && universeCache.venue === book && universeCache.assets.length) return filterByMinCap(universeCache.assets, floor, (a) => a.marketCapUsd);
	if (!listed.length) {
		const existing = await listUniverse().catch(() => []);
		const stored = await getSettings().catch(() => null);
		const storedVenue = stored?.universe_venue ? bookVenue(stored.universe_venue) : null;
		if (existing.length && storedVenue === book) return filterByMinCap(existing.map((a) => ({
			symbol: a.symbol,
			base: a.base,
			name: a.name,
			marketCapUsd: Number(a.market_cap_usd),
			volume24hUsd: Number(a.volume_24h_usd),
			maxLeverage: Number(a.max_leverage),
			venueSymbol: a.venue_symbol ?? a.symbol
		})), floor, (a) => a.marketCapUsd);
		if (book === "paper") {
			try {
				listed = await fetchUniverse(0);
			} catch {
				listed = [];
			}
			if (!listed.length) listed = FALLBACK.slice();
		} else if (!listed.length) throw listedErr ?? /* @__PURE__ */ new Error(`${book} listed markets empty`);
	}
	try {
		await loadPublicLeverageMaps();
	} catch {}
	const stamped = await Promise.all(listed.map(async (a) => ({
		...a,
		maxLeverage: a.maxLeverage > 0 ? capLeverage(a.maxLeverage) : await venueMaxLeverage(book, a.symbol)
	})));
	await replaceUniverse(stamped);
	if (looksLikeFallbackUniverse(stamped)) {
		universeCache = null;
		await setUniverseVenue("");
	} else {
		await setUniverseVenue(book);
		universeCache = {
			at: Date.now(),
			venue: book,
			assets: stamped
		};
	}
	return filterByMinCap(stamped, floor, (a) => a.marketCapUsd);
}
async function runTick(opts) {
	const t0 = Date.now();
	const source = opts?.source ?? "manual";
	const lock = await acquireTickLock();
	if (!lock) return {
		ok: true,
		skipped: true,
		reason: "tick already running",
		public: publicSettings(await getSettings())
	};
	const hb = setInterval(() => {
		heartbeatTickLock(lock);
	}, LOCK_HEARTBEAT_MS);
	hb.unref?.();
	try {
		return await runTickBody({
			...opts,
			source,
			t0,
			lock
		});
	} finally {
		clearInterval(hb);
		await releaseTickLock(lock);
	}
}
async function runTickBody(opts) {
	const t0 = opts.t0;
	const settings = await getSettings();
	if (!settings.bot_enabled) {
		await touchTick(opts.source);
		return {
			ok: true,
			skipped: true,
			reason: "bot off",
			public: publicSettings(await getSettings())
		};
	}
	const venue = bookVenue(settings.venue);
	const minMcap = minCapUsd(settings.min_market_cap_usd);
	let universe;
	try {
		universe = (await refreshUniverse(minMcap, venue, Boolean(opts?.forceUniverse))).map((a) => ({
			symbol: a.symbol,
			base: a.base,
			name: a.name,
			market_cap_usd: a.marketCapUsd,
			volume_24h_usd: a.volume24hUsd,
			max_leverage: a.maxLeverage
		}));
	} catch {
		const stored = await getSettings().catch(() => null);
		const existing = await listUniverse().catch(() => []);
		if (existing.length && bookVenue(stored?.universe_venue ?? "") === venue) universe = filterByMinCap(existing, minMcap, (a) => Number(a.market_cap_usd));
		else universe = [];
	}
	const open = await listOpenPositions();
	let closed = 0;
	let opened = 0;
	let signals = 0;
	let scanned = 0;
	const openSyms = [...new Set(open.map((p) => p.symbol))];
	const lastBars = /* @__PURE__ */ new Map();
	await mapPool(openSyms, 4, async (sym) => {
		try {
			const bars = await fetchKlinesCached(sym, "5m", 96, venue);
			lastBars.set(sym, bars);
		} catch {}
	});
	let equity = Number(settings.equity_usd);
	let usedMargin = usedMarginUsd(open);
	let available = Math.max(0, equity - usedMargin);
	const wantLive = settings.mode === "live" && venue !== "paper";
	const live = wantLive && Boolean(settings.live_enabled) && hasLiveKeys(settings, venue);
	const liveBlock = wantLive && !live ? !hasLiveKeys(settings, venue) ? `${venue} keys incomplete — live blocked, not opening paper` : `live not armed — not opening paper` : "";
	const acc = accountFrom(settings, venue === "paper" ? "lighter" : venue);
	const adapter = live ? getAdapter(venue) : null;
	let liveBalReady = !live;
	let liveBookReady = !live;
	if (live && adapter) {
		try {
			const w = await withTimeout(readVenueWallet(adapter, acc), 8e3);
			if (w) {
				equity = w.equity;
				available = w.available;
				liveBalReady = true;
				await setEquity(equity);
			}
		} catch {
			liveBalReady = false;
		}
		if (!liveBalReady) {
			equity = 0;
			available = 0;
		}
		try {
			const pending = await listOrphanFills();
			for (const o of pending) {
				try {
					const res = await adapter.closePosition(acc, venueSymbol(venue, o.symbol));
					if (res.ok || res.message === "flat") {
						await dropOrphanFill(o.symbol);
						continue;
					}
				} catch {}
				try {
					if (await insertPosition({
						mode: "live",
						venue,
						symbol: o.symbol,
						timeframe: o.timeframe || "5m",
						indicator: o.indicator || "ORPHAN",
						side: o.side,
						entry: o.entry,
						sl: o.sl,
						tp: o.tp,
						qty: o.qty,
						leverage: o.leverage,
						notional: o.notional,
						risk: o.risk,
						fees: o.fees,
						orderId: o.orderId,
						barTime: o.barTime,
						origSl: o.origSl ?? o.sl,
						signalReason: `${o.reason ?? ""} · ${ORPHAN_MARK}`,
						margin: o.notional / Math.max(1, o.leverage)
					})) await dropOrphanFill(o.symbol);
				} catch {}
			}
		} catch {}
	}
	for (const pos of open) {
		if (pos.mode === "live") {
			if (!live || !adapter) continue;
			if (pos.venue && pos.venue !== "paper" && bookVenue(pos.venue) !== venue) continue;
		}
		if (live && adapter && pos.mode === "live" && isOrphanPosition(pos)) try {
			const res = await adapter.closePosition(acc, venueSymbol(venue, pos.symbol));
			if (res.ok || res.message === "flat") {
				let exitPx = Number(pos.entry);
				try {
					const last = await fetchVenueLastPrice(venue, pos.symbol);
					if (Number.isFinite(last)) exitPx = last;
				} catch {}
				const resolved = await resolveLiveExit(adapter, acc, venue, pos, exitPx);
				const holdMs = Math.max(0, Date.now() - new Date(pos.opened_at).getTime());
				await closePosition(pos.id, resolved.exit, "flatten retry", resolved.pnl, resolved.pnlR, {
					holdMs,
					beMoved: false,
					feesUsd: resolved.fees
				});
				closed += 1;
				continue;
			}
		} catch {}
		if (live && adapter && pos.mode === "live") {
			const vs = venueSymbol(venue, pos.symbol);
			const side = pos.side;
			const slNow = Number(pos.sl);
			const tpNow = Number(pos.tp);
			const qtyNow = Number(pos.qty);
			let skipBe = false;
			try {
				const prot = await adapter.fetchProtection(acc, {
					symbol: vs,
					sl: slNow,
					tp: tpNow
				});
				if (!prot.unknown && !prot.onVenue) skipBe = true;
				else if (!prot.unknown && prot.onVenue && (!prot.hasSl || !prot.hasTp)) {
					let restored = false;
					try {
						if ((await adapter.updateStop(acc, {
							symbol: vs,
							side,
							sl: slNow,
							tp: tpNow,
							qty: qtyNow
						})).ok) {
							const again = await adapter.fetchProtection(acc, {
								symbol: vs,
								sl: slNow,
								tp: tpNow
							});
							restored = !again.unknown && again.hasSl && again.hasTp;
						}
					} catch {
						restored = false;
					}
					if (!restored) {
						const res = await adapter.closePosition(acc, vs);
						if (res.ok || res.message === "flat") {
							let exitPx = Number(pos.entry);
							try {
								const last = await fetchVenueLastPrice(venue, pos.symbol);
								if (Number.isFinite(last)) exitPx = last;
							} catch {}
							const resolved = await resolveLiveExit(adapter, acc, venue, pos, exitPx);
							const holdMs = Math.max(0, Date.now() - new Date(pos.opened_at).getTime());
							await closePosition(pos.id, resolved.exit, "unprotected", resolved.pnl, resolved.pnlR, {
								holdMs,
								beMoved: false,
								feesUsd: resolved.fees
							});
							closed += 1;
							continue;
						}
						skipBe = true;
					}
				}
			} catch {}
			if (!skipBe) {
				const bars = lastBars.get(pos.symbol);
				const last = bars?.[bars.length - 1];
				const beAtR = trexBeAtR(pos.indicator);
				if (last && beAtR) {
					const entry = Number(pos.entry);
					const origPx = origStopPx({
						side,
						entry,
						sl: slNow,
						origSl: pos.orig_sl,
						qty: pos.qty,
						risk: pos.risk_usd
					});
					const dist = Math.abs(entry - origPx);
					const alreadyBe = Math.abs(slNow - entry) <= 1e-8 * Math.max(1, entry);
					const fav = side === "long" ? last.close - entry : entry - last.close;
					if (!alreadyBe && dist > 0 && fav >= beAtR * dist) try {
						if ((await adapter.updateStop(acc, {
							symbol: vs,
							side,
							sl: entry,
							tp: tpNow,
							qty: qtyNow
						})).ok) await updatePositionSl(pos.id, entry);
					} catch {}
				}
			}
			continue;
		}
		const bars = lastBars.get(pos.symbol);
		if (!bars?.length) continue;
		const side = pos.side;
		const entry = Number(pos.entry);
		let slNow = Number(pos.sl);
		const tpNow = Number(pos.tp);
		const tf = pos.timeframe in TF_MS ? pos.timeframe : "5m";
		const tfMs = TF_MS[tf];
		const openedMs = new Date(pos.opened_at).getTime();
		const barTime = Number(pos.bar_time);
		const start = Number.isFinite(barTime) && barTime > 0 ? barTime + tfMs : openedMs;
		let path = bars.filter((b) => b.time >= start - 2e3);
		if (!path.length) path = [bars[bars.length - 1]];
		const walked = walkPath({
			side,
			entry,
			sl: slNow,
			tp: tpNow,
			bars: path,
			beAtR: trexBeAtR(pos.indicator)
		});
		if (walked.beMoved && Math.abs(walked.sl - slNow) > 1e-12) {
			let venueOk = true;
			if (live && adapter && pos.mode === "live") try {
				venueOk = (await adapter.updateStop(acc, {
					symbol: venueSymbol(venue, pos.symbol),
					side,
					sl: walked.sl,
					tp: tpNow,
					qty: Number(pos.qty)
				})).ok;
			} catch {
				venueOk = false;
			}
			if (venueOk) try {
				await updatePositionSl(pos.id, walked.sl);
				slNow = walked.sl;
			} catch {}
		}
		const reason = walked.hit?.reason ?? null;
		if (reason) {
			const why = reason;
			if (live && adapter && pos.mode === "live") try {
				if (!(await adapter.closePosition(acc, venueSymbol(venue, pos.symbol))).ok) continue;
			} catch {
				continue;
			}
			const { maeR, mfeR } = pathExcursion({
				side,
				entry,
				origSl: origStopPx({
					side,
					entry,
					sl: Number(pos.sl),
					origSl: pos.orig_sl,
					qty: pos.qty,
					risk: pos.risk_usd
				}),
				bars: walked.hit ? path.filter((b) => b.time <= walked.hit.barTime) : path
			});
			const openMs = Number.isFinite(barTime) && barTime > 0 ? barTime : openedMs;
			const closeMs = walked.hit?.barTime ?? Date.now();
			let exit = walked.hit.exit;
			const settled = netClosePnl({
				side,
				entry,
				exit,
				qty: Number(pos.qty),
				riskUsd: Number(pos.risk_usd),
				openFee: Number(pos.fees_usd)
			});
			let pnl = settled.pnl;
			let pnlR = settled.pnlR;
			let fees = settled.fees;
			if (live && adapter && pos.mode === "live") {
				const resolved = await resolveLiveExit(adapter, acc, venue, pos, exit);
				exit = resolved.exit;
				pnl = resolved.pnl;
				pnlR = resolved.pnlR;
				fees = resolved.fees;
			}
			await closePosition(pos.id, exit, why, pnl, pnlR, {
				maeR,
				mfeR,
				barsHeld: walked.barsHeld,
				holdMs: Math.max(0, closeMs - openMs),
				beMoved: walked.beMoved,
				feesUsd: fees
			});
			if (live && pos.mode === "live") {} else {
				equity += pnl;
				await bumpEquity(pnl);
			}
			closed += 1;
		}
	}
	let venueBook = null;
	let walletAfterClose = false;
	if (live && adapter) {
		try {
			const exPos = await adapter.fetchPositions(acc);
			venueBook = exPos;
			liveBookReady = true;
			const still = await listOpenPositions();
			for (const pos of still) {
				if (pos.mode !== "live") continue;
				if (pos.venue && pos.venue !== "paper" && bookVenue(pos.venue) !== venue) continue;
				if (Date.now() - new Date(pos.opened_at).getTime() < 45e3) continue;
				if (exPos.some((p) => sameCoin(p.symbol, pos.symbol) || sameCoin(p.symbol, venueSymbol(venue, pos.symbol)))) continue;
				let exitPx = Number(pos.entry);
				try {
					const last = await fetchVenueLastPrice(venue, pos.symbol);
					if (Number.isFinite(last)) exitPx = last;
				} catch {}
				const resolved = await resolveLiveExit(adapter, acc, venue, pos, exitPx);
				const holdMs = Math.max(0, Date.now() - new Date(pos.opened_at).getTime());
				await closePosition(pos.id, resolved.exit, "venue", resolved.pnl, resolved.pnlR, {
					holdMs,
					beMoved: false,
					feesUsd: resolved.fees
				});
				closed += 1;
			}
		} catch {
			liveBookReady = false;
		}
		if (liveBalReady) try {
			const w = await withTimeout(readVenueWallet(adapter, acc), 5e3);
			if (w) {
				equity = w.equity;
				available = w.available;
				await setEquity(equity);
				walletAfterClose = true;
			}
		} catch {}
	}
	const stillOpen = await listOpenPositions();
	const held = new Set(stillOpen.map((p) => p.symbol));
	usedMargin = usedMarginUsd(stillOpen);
	if (!walletAfterClose) available = Math.max(0, equity - usedMargin);
	const scanDone = {
		"5m": Number(settings.scan_done_5m) || 0,
		"15m": Number(settings.scan_done_15m) || 0,
		"1h": Number(settings.scan_done_1h) || 0,
		"4h": Number(settings.scan_done_4h) || 0
	};
	const nowMs = Date.now();
	const tfs = dueTimeframes(nowMs, scanDone, opts.source);
	const engineGates = parseEngineGates(settings.engine_gates);
	const sideGates = parseSideGates(settings.engine_gates);
	if (!tfs.length) {
		await touchTick(opts.source);
		return {
			ok: true,
			skipped: true,
			reason: "waiting for next closed bar",
			scanned: 0,
			signals: 0,
			opened: closed,
			closed,
			durationMs: Date.now() - t0,
			coins: 0,
			universe: universe.length,
			tfs,
			public: publicSettings(await getSettings())
		};
	}
	const tradeable = universe;
	const batch = resolveBatch(opts?.batch ?? Number(settings.scan_batch), tradeable.length);
	const closed5m = latestClosedOpen(TF_MS["5m"], nowMs);
	const cursors = parseCursors(settings.scan_cursors);
	if (!settings.scan_cursors) cursors["5m"] = {
		c: Number(settings.scan_cursor) || 0,
		e: Number(settings.scan_epoch_ms) || 0
	};
	const tfWork = tfs.map((tf) => {
		const closedOpen = latestClosedOpen(TF_MS[tf], nowMs);
		const saved = cursors[tf] ?? {
			c: 0,
			e: 0
		};
		const cur = saved.e !== closedOpen && closedOpen > 0 ? 0 : saved.c;
		const slice = [];
		const n = Math.min(batch, tradeable.length);
		for (let k = 0; k < n; k++) slice.push(tradeable[(cur + k) % Math.max(1, tradeable.length)]);
		return {
			tf,
			closedOpen,
			cur,
			slice,
			done: slice.map(() => false)
		};
	});
	const planned = /* @__PURE__ */ new Map();
	const slice = [];
	const tagged = tfWork.map((w) => w.slice.map((a) => ({
		a,
		tf: w.tf
	})));
	for (const row of interleaveSlices(tagged)) {
		const list = planned.get(row.a.symbol);
		if (list) {
			if (!list.includes(row.tf)) list.push(row.tf);
		} else {
			planned.set(row.a.symbol, [row.tf]);
			slice.push(row.a);
		}
	}
	const found = [];
	const seenSig = /* @__PURE__ */ new Set();
	const deadline = t0 + tickBudgetMs();
	let scannedCoins = 0;
	let tried = 0;
	const lastN = live ? 1 : scanLastN(opts.source);
	const finished = /* @__PURE__ */ new Set();
	if (Date.now() + 1500 < deadline) await mapPool(slice, SCAN_CONCURRENCY, async (asset) => {
		if (Date.now() > deadline) return;
		tried += 1;
		try {
			const tfsHere = planned.get(asset.symbol) ?? tfs;
			const need = new Set(tfsHere);
			for (const tf of tfsHere) {
				need.add(HTF_OF[tf]);
				need.add(HTF2_OF[tf]);
			}
			const loaded = /* @__PURE__ */ new Map();
			await Promise.all([...need].map(async (tf) => {
				const limit = tf === "1d" || tf === "1w" ? 80 : SCAN_BARS;
				for (let attempt = 0; attempt < 2; attempt++) try {
					const bars = await fetchKlinesCached(asset.symbol, tf, limit, venue);
					if (bars.length) {
						loaded.set(tf, bars);
						return;
					}
				} catch {}
				loaded.set(tf, []);
			}));
			let any = false;
			const scannedTf = /* @__PURE__ */ new Set();
			for (const tf of tfsHere) {
				const raw = loaded.get(tf) ?? [];
				const closedBars = onlyClosedBars(raw, tf);
				if (closedBars.length < MIN_BARS) {
					if (raw.length) scannedTf.add(tf);
					continue;
				}
				scannedTf.add(tf);
				const htfTf = HTF_OF[tf];
				const htf2Tf = HTF2_OF[tf];
				const htfClosed = onlyClosedBars(loaded.get(htfTf) ?? [], htfTf);
				const htf2Closed = onlyClosedBars(loaded.get(htf2Tf) ?? [], htf2Tf);
				scanned += 1;
				any = true;
				const names = scanNames(tf, engineGates);
				const sigs = scanBarClosed(closedBars, tf, htfClosed.length > 20 ? htfClosed : void 0, lastN, htf2Closed.length > 10 ? htf2Closed : void 0, names);
				for (const s of sigs) {
					const key = `${asset.symbol}|${tf}|${s.indicator}|${s.barTime}`;
					if (seenSig.has(key)) continue;
					seenSig.add(key);
					found.push({
						symbol: asset.symbol,
						timeframe: tf,
						indicator: s.indicator,
						side: s.side,
						entry: s.entry,
						sl: s.sl,
						tp: s.tp,
						rr: s.rr,
						atr: s.atr,
						reason: s.reason,
						barTime: s.barTime
					});
				}
			}
			if (any) scannedCoins += 1;
			finished.add(asset.symbol);
			for (const work of tfWork) {
				const idx = work.slice.findIndex((a) => a.symbol === asset.symbol);
				if (idx >= 0 && scannedTf.has(work.tf)) work.done[idx] = true;
			}
		} catch {}
	});
	const scanIncomplete = Boolean(slice.length) && finished.size < slice.length;
	if (tradeable.length && slice.length) {
		const nextCursors = { ...cursors };
		const done = {};
		let next = Number(settings.scan_cursor) || 0;
		for (const work of tfWork) {
			const prefix = prefixCompleted(work.done);
			const stepped = nextTfCursor({
				cur: work.cur,
				epoch: work.closedOpen,
				closedOpen: work.closedOpen,
				universeLen: tradeable.length,
				prefixDone: prefix
			});
			nextCursors[work.tf] = stepped.cursor;
			if (work.tf === "5m") next = stepped.cursor.c;
			if (stepped.wrapped) done[work.tf] = work.closedOpen;
		}
		try {
			await markScanProgress({
				cursor: next,
				epochMs: closed5m,
				cursors: nextCursors,
				done: Object.keys(done).length ? done : void 0
			});
		} catch {
			await setScanCursor(next);
		}
	}
	signals = found.length;
	const remainingSlots = Math.max(0, Number(settings.max_positions) - (await listOpenPositions()).length);
	let used = 0;
	const capitalPctDefault = Number(settings.capital_pct) || 3;
	const levSizeTiers = parseLevSizeTiers(settings.lev_size_tiers);
	const userLevCap = Math.min(200, Math.max(1, Math.round(Number(settings.max_leverage) || 200)));
	const rawStackCount = Number(settings.stack_lev_count);
	const stackCount = Number.isFinite(rawStackCount) ? Math.max(0, Math.round(rawStackCount)) : 2;
	const stackCap = Math.min(200, Math.max(1, Math.round(Number(settings.stack_lev_cap) || 75)));
	const levMemo = /* @__PURE__ */ new Map();
	const openLevs = stillOpen.map((p) => Number(p.leverage) || 0);
	async function coinMaxLev(sym) {
		let n = levMemo.get(sym);
		if (!n) {
			n = capLeverage(await resolveMaxLeverage(venue, venue === "paper" ? sym : venueSymbol(venue, sym), acc));
			levMemo.set(sym, n);
		}
		return n;
	}
	for (const s of found) {
		let taken = false;
		let skip = "";
		if ((live || opts.source !== "manual") && !isFreshSignal(s.barTime, s.timeframe, Date.now())) skip = "stale bar";
		else if (!isSideOn(sideGates, s.indicator, s.side)) skip = "side muted";
		else if (held.has(s.symbol)) skip = "already in symbol";
		else if (live && venueBook && venueBook.some((p) => sameCoin(p.symbol, s.symbol) || sameCoin(p.symbol, venueSymbol(venue, s.symbol)))) skip = "already on venue";
		else if (live && (!liveBalReady || !liveBookReady)) skip = !liveBalReady ? "live balance unread — not sending" : "live positions unread — not sending";
		else if (used >= remainingSlots) skip = "max positions";
		else if (await alreadyFilled({
			symbol: s.symbol,
			timeframe: s.timeframe,
			indicator: s.indicator,
			side: s.side,
			entry: s.entry,
			barTime: s.barTime
		})) skip = "already filled";
		else {
			if (live && adapter && liveBalReady) try {
				const w = await withTimeout(readVenueWallet(adapter, acc), 5e3);
				if (w) {
					equity = w.equity;
					available = Math.min(available, w.available);
				}
			} catch {}
			const coinMax = await coinMaxLev(s.symbol);
			const lev = Math.min(stackedUserLevCap(userLevCap, openLevs, stackCount, stackCap), coinMax);
			const capitalPct = capitalPctForLeverage(coinMax, capitalPctDefault, levSizeTiers);
			const sized = sizePosition({
				equity,
				capitalPct,
				entry: s.entry,
				sl: s.sl,
				leverage: lev,
				usedMargin,
				available
			});
			if (!sized) skip = available <= 0 ? "no free capital" : "size failed";
			else {
				let orderId;
				let placedLive = false;
				let orphan = false;
				let liveFillPx = 0;
				let liveFillQty = 0;
				let liveFillSl = s.sl;
				let liveFillTp = s.tp;
				let liveFillFees = sized.fees;
				let liveStopsPlaced = false;
				if (liveBlock) skip = liveBlock;
				else if (live) {
					const ad = getAdapter(venue);
					if (!ad) skip = "no adapter";
					else if (!hasLiveKeys(settings, venue)) skip = `${venue} keys missing`;
					else if (!await heartbeatTickLock(opts.lock)) skip = "tick lock lost";
					else try {
						const res = await ad.placeOrder(acc, {
							symbol: venueSymbol(venue, s.symbol),
							side: s.side,
							qty: sized.qty,
							leverage: lev,
							sl: s.sl,
							tp: s.tp,
							entry: s.entry
						});
						if (res.fillPrice && res.fillPrice > 0) liveFillPx = res.fillPrice;
						if (res.filledQty && res.filledQty > 0) liveFillQty = res.filledQty;
						if (res.sl && res.sl > 0) {
							liveFillSl = res.sl;
							liveStopsPlaced = true;
						}
						if (res.tp && res.tp > 0) {
							liveFillTp = res.tp;
							liveStopsPlaced = true;
						}
						if (res.feeUsd != null && Number.isFinite(res.feeUsd)) liveFillFees = res.feeUsd;
						let final = res;
						if (res.ok || res.liveOpen || res.orderId) {
							if (res.ok || !res.liveOpen && res.orderId) final = await confirmLiveFill(ad, acc, venueSymbol(venue, s.symbol), liveFillSl, liveFillTp, res.orderId);
						}
						if (final.ok) {
							orderId = final.orderId ?? res.orderId;
							placedLive = true;
						} else if (final.liveOpen) {
							orderId = final.orderId ?? res.orderId;
							placedLive = true;
							orphan = true;
						} else skip = final.message;
					} catch (e) {
						skip = e instanceof Error ? e.message : "order threw";
						try {
							const vs = venueSymbol(venue, s.symbol);
							const prot = await ad.fetchProtection(acc, {
								symbol: vs,
								sl: liveFillSl,
								tp: liveFillTp
							});
							if (!prot.unknown && prot.onVenue) {
								const check = await confirmLiveFill(ad, acc, vs, liveFillSl, liveFillTp);
								if (check.ok) {
									orderId = check.orderId;
									placedLive = true;
									skip = "";
								} else if (check.liveOpen) {
									orderId = check.orderId;
									placedLive = true;
									orphan = true;
									skip = "";
								} else skip = check.message;
							}
						} catch {}
					}
				}
				if (placedLive && adapter) {
					try {
						const hit = (await adapter.fetchPositions(acc)).find((p) => sameCoin(p.symbol, s.symbol) || sameCoin(p.symbol, venueSymbol(venue, s.symbol)));
						if (hit) {
							if (hit.entry > 0) liveFillPx = hit.entry;
							if (hit.qty > 0) liveFillQty = hit.qty;
						}
					} catch {}
					if (liveFillPx > 0) {
						const rebased = rebaseStopsFromFill({
							paperEntry: s.entry,
							fill: liveFillPx,
							sl: s.sl,
							tp: s.tp
						});
						const px = Math.max(1e-8, liveFillPx);
						const slDrift = Math.abs(rebased.sl - liveFillSl) / px;
						const tpDrift = Math.abs(rebased.tp - liveFillTp) / px;
						liveFillSl = rebased.sl;
						liveFillTp = rebased.tp;
						if (!liveStopsPlaced || slDrift > 1e-4 || tpDrift > 1e-4) try {
							await adapter.updateStop(acc, {
								symbol: venueSymbol(venue, s.symbol),
								side: s.side,
								sl: liveFillSl,
								tp: liveFillTp,
								qty: liveFillQty || sized.qty
							});
							liveStopsPlaced = true;
						} catch {}
					}
				}
				if (!skip) {
					const fillEntry = liveFillPx > 0 ? liveFillPx : s.entry;
					const fillQty = liveFillQty > 0 ? liveFillQty : sized.qty;
					const fillSl = liveFillSl;
					const fillTp = liveFillTp;
					const fillNotional = fillQty * fillEntry;
					const fillMargin = fillNotional / Math.max(1, lev);
					const fillRisk = fillQty * Math.abs(fillEntry - fillSl);
					const fillFees = liveFillPx > 0 ? liveFillFees || fillNotional * 4 / 1e4 : sized.fees;
					const fill = {
						mode: live ? "live" : "paper",
						venue: live ? venue : "paper",
						symbol: s.symbol,
						timeframe: s.timeframe,
						indicator: s.indicator,
						side: s.side,
						entry: fillEntry,
						sl: fillSl,
						tp: fillTp,
						qty: fillQty,
						leverage: lev,
						notional: fillNotional || sized.notional,
						risk: fillRisk || sized.risk,
						fees: fillFees,
						orderId,
						barTime: s.barTime,
						origSl: fillSl,
						atr: s.atr,
						equityAtOpen: equity,
						rrPlanned: s.rr,
						margin: fillMargin
					};
					const reason = orphan ? `${s.reason} · ${ORPHAN_MARK}` : s.reason;
					async function flattenLive() {
						if (!adapter) return false;
						try {
							const res = await adapter.closePosition(acc, venueSymbol(venue, s.symbol));
							return res.ok || res.message === "flat";
						} catch {
							return false;
						}
					}
					async function bookOrphan() {
						return insertPosition({
							...fill,
							signalReason: `${s.reason} · ${ORPHAN_MARK}`
						});
					}
					async function stashOrphan() {
						try {
							await rememberOrphanFill({
								venue: fill.venue,
								symbol: fill.symbol,
								side: fill.side,
								qty: fill.qty,
								entry: fill.entry,
								sl: fill.sl,
								tp: fill.tp,
								leverage: fill.leverage,
								notional: fill.notional,
								risk: fill.risk,
								fees: fill.fees,
								timeframe: fill.timeframe,
								indicator: fill.indicator,
								barTime: fill.barTime,
								orderId: fill.orderId,
								origSl: fill.origSl,
								reason: s.reason
							});
							return true;
						} catch {
							try {
								await logScan(0, 0, 0, 0, 0, `${ORPHAN_MARK} ${fill.symbol}`, opts.source, { touch: false });
							} catch {}
							return false;
						}
					}
					try {
						if (!await insertPosition({
							...fill,
							signalReason: reason
						})) {
							skip = "already filled";
							if (placedLive) {
								if (!await flattenLive()) {
									if (await bookOrphan().catch(() => 0)) {
										held.add(s.symbol);
										openLevs.push(lev);
										used += 1;
										opened += 1;
										usedMargin += fillMargin;
										available = Math.max(0, available - fillMargin);
										taken = true;
										skip = ORPHAN_MARK;
									} else {
										await stashOrphan();
										skip = ORPHAN_MARK;
									}
								}
							}
						} else {
							held.add(s.symbol);
							openLevs.push(lev);
							used += 1;
							opened += 1;
							usedMargin += fillMargin;
							available = Math.max(0, available - fillMargin);
							taken = true;
							if (orphan) skip = ORPHAN_MARK;
						}
					} catch (e) {
						skip = e instanceof Error ? e.message : "position insert failed";
						if (placedLive) {
							if (!await flattenLive()) try {
								if (await bookOrphan()) {
									held.add(s.symbol);
									openLevs.push(lev);
									used += 1;
									opened += 1;
									usedMargin += fillMargin;
									available = Math.max(0, available - fillMargin);
									taken = true;
									skip = ORPHAN_MARK;
								} else {
									await stashOrphan();
									skip = ORPHAN_MARK;
								}
							} catch {
								await stashOrphan();
								skip = ORPHAN_MARK;
							}
						}
					}
				}
			}
		}
		try {
			await insertSignal({
				barTime: s.barTime,
				symbol: s.symbol,
				timeframe: s.timeframe,
				indicator: s.indicator,
				side: s.side,
				entry: s.entry,
				sl: s.sl,
				tp: s.tp,
				rr: s.rr,
				atr: s.atr,
				reason: s.reason,
				taken,
				skipReason: skip || void 0
			});
		} catch {}
	}
	const freshSettings = await getSettings();
	if (live && adapter && liveBalReady) try {
		const w = await withTimeout(readVenueWallet(adapter, acc), 5e3);
		if (w) {
			await setEquity(w.equity);
			freshSettings.equity_usd = w.equity;
		}
	} catch {}
	await snapshotEquity(Number(freshSettings.equity_usd), (await listOpenPositions()).length, freshSettings.mode);
	const ms = Date.now() - t0;
	const heads = slice.slice(0, 8).map((s) => s.base).join(",");
	const note = `${scannedCoins}/${tradeable.length} ${venue} perps · chart ${chartHostLabel(venue)} · ${tfs.join("/")}${scanIncomplete ? " · sweep continues next minute" : " · fresh close"} · ${heads}${slice.length > 8 ? "…" : ""}${liveBlock ? ` · ${liveBlock}` : ""}`;
	await logScan(scanned, signals, opened, closed, ms, note, opts.source);
	return {
		ok: true,
		skipped: false,
		scanned,
		signals,
		opened,
		closed,
		durationMs: ms,
		coins: scannedCoins,
		universe: universe.length,
		tfs,
		batch: slice.map((s) => s.symbol),
		public: publicSettings(await getSettings())
	};
}
//#endregion
export { setEngineRow as $, maybeSeedJournal as A, refreshUniverse as B, listClosedPositions as C, listSignals as D, listScanLog as E, overlayLiveSnapshot as F, runTick as G, resetJournal as H, parseEngineGates as I, serializeEngineGates as J, saveTradeNote as K, parseSideGates as L, nativeSymbol as M, notionalPctOfEquity as N, listUniverse as O, onlyClosedBars as P, setEngineGate as Q, patchSettings as R, isSideOn as S, listOpenPositions as T, rotateTickToken as U, replaceUniverse as V, runIndicator as W, setAllSides as X, setAllEngines as Y, setEngineCol as Z, filterByMinCap as _, VENUE_META as a, getSql as b, capitalPctForLeverage as c, clearListedCache as d, setScanCursor as et, clearUniverse as f, fetchKlinesCached as g, countSidesArmed as h, FALLBACK as i, venueLabel as it, minCapUsd as j, looksLikeFallbackUniverse as k, chartHostLabel as l, countArmed as m, ENGINE_FAMILIES as n, stats as nt, accountFrom as o, clearUniverseCache as p, seedDemoJournal as q, ENGINE_TFS as r, stringifyLevSizeTiers as rt, bookVenue as s, DEFAULT_LEV_SIZE_TIERS as t, setSideGate as tt, clampCapitalPct as u, getAdapter as v, listEquity as w, isEngineOn as x, getSettings as y, publicSettings as z };
