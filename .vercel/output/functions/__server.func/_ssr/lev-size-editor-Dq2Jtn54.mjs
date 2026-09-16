import { N as notionalPctOfEquity, c as capitalPctForLeverage, t as DEFAULT_LEV_SIZE_TIERS, u as clampCapitalPct } from "./tick.server-CbcdAWH0.mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as useLocale } from "./functions-B6PAbNKD.mjs";
import { c as Plus, r as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-D0UV1GOx.mjs";
import { n as Label, t as Input } from "./field-IIn5hLD1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lev-size-editor-Dq2Jtn54.js
var import_jsx_runtime = require_jsx_runtime();
function LevSizeEditor({ capital, onCapital, tiers, onTiers, disabled, equityUsd, universe }) {
	const { locale } = useLocale();
	const fa = locale === "fa";
	const defaultPct = clampCapitalPct(Number(capital) || 3);
	function setRow(i, patch) {
		onTiers(tiers.map((t, j) => j === i ? {
			...t,
			...patch
		} : t));
	}
	const groups = groupUniverse(universe ?? [], defaultPct, tiers, fa ? "بقیه" : "other");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 rounded-lg border border-accent/50 bg-surface-2 p-3 sm:col-span-2 lg:col-span-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium",
				children: fa ? "سایز بر اساس اهرم ارز" : "Size by coin leverage"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-xs leading-relaxed text-muted",
				children: fa ? "درصد از سرمایهٔ آزاد است. اگر سقف اهرم همان ارز دقیقاً با یک ردیف یکی باشد، درصد همان ردیف می‌رود تو معامله. حجم اسمی = درصد مارجین × اهرم." : "Percent of free capital. If that coin's max leverage matches a row exactly, that row's % is the margin. Notional = margin % × leverage."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5 sm:max-w-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "lev-size-default",
						children: fa ? "درصد پیش‌فرض (بقیه ارزها)" : "Default capital % (everything else)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "lev-size-default",
						type: "number",
						min: 1,
						max: 100,
						step: 1,
						value: capital,
						disabled,
						onChange: (e) => onCapital(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: [
							3,
							5,
							6,
							10,
							12,
							15,
							20
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled,
							onClick: () => onCapital(String(n)),
							className: `min-h-11 rounded-sm border px-2.5 text-xs ${Number(capital) === n ? "border-accent bg-surface text-fg" : "border-border text-muted hover:border-border-strong"} disabled:opacity-40`,
							children: [n, "%"]
						}, n))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-md border border-border bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[28rem] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-start font-medium",
									children: fa ? "اهرم ارز" : "Coin leverage"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-start font-medium",
									children: fa ? "درصد سرمایه" : "Capital %"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-start font-medium",
									children: fa ? "حجم اسمی" : "Notional"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-3 py-2 text-end font-medium" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [tiers.map((row, i) => {
						const notion = notionalPctOfEquity(row.capitalPct, row.leverage);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 1,
											max: 200,
											step: 1,
											value: String(row.leverage),
											disabled,
											"aria-label": fa ? "اهرم" : "leverage",
											onChange: (e) => setRow(i, { leverage: Math.min(200, Math.max(1, Math.round(Number(e.target.value) || 1))) })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-subtle",
											children: "x"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 1,
											max: 100,
											step: 1,
											value: String(row.capitalPct),
											disabled,
											"aria-label": fa ? "درصد سرمایه" : "capital percent",
											onChange: (e) => setRow(i, { capitalPct: clampCapitalPct(Number(e.target.value) || 1) })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-subtle",
											children: "%"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 font-mono text-xs tabular text-muted",
									children: [
										notion,
										"%",
										equityUsd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ms-1 text-subtle",
											children: ["· ", Math.round(equityUsd * notion / 100).toLocaleString()]
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-end",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled,
										"aria-label": fa ? "حذف ردیف" : "Remove row",
										onClick: () => onTiers(tiers.filter((_, j) => j !== i)),
										className: "inline-flex size-11 items-center justify-center rounded-sm text-muted hover:bg-surface-2 hover:text-short disabled:opacity-40",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
											className: "size-4",
											strokeWidth: 1.75
										})
									})
								})
							]
						}, `${row.leverage}-${i}`);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs text-subtle",
							children: fa ? "بقیه" : "other"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2 font-mono text-xs tabular",
							children: [defaultPct, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs text-subtle",
							children: fa ? `${defaultPct}% × اهرم همان ارز` : `${defaultPct}% × that coin's lev`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {})
					] })] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					disabled,
					onClick: () => onTiers([...tiers, nextBlankTier(tiers)]),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-4",
						strokeWidth: 1.75
					}), fa ? "افزودن ردیف" : "Add row"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					disabled,
					onClick: () => {
						onCapital(String(3));
						onTiers(DEFAULT_LEV_SIZE_TIERS.map((t) => ({ ...t })));
					},
					children: fa ? "برگشت به پیش‌فرض" : "Reset defaults"
				})]
			}),
			groups.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: fa ? "روی جهان ارز فعلی" : "On the current universe"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-sm border border-border bg-bg-elev px-2.5 py-1.5 font-mono text-xs tabular",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: g.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-subtle",
								children: [" · ", g.count]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									" · ",
									g.pct,
									"% → ",
									g.notional,
									"%"
								]
							})
						]
					}, g.key))
				})]
			}) : null
		]
	});
}
function nextBlankTier(tiers) {
	const used = new Set(tiers.map((t) => t.leverage));
	for (const n of [
		5,
		10,
		20,
		25,
		50,
		75,
		100,
		125,
		150,
		200
	]) if (!used.has(n)) return {
		leverage: n,
		capitalPct: 3
	};
	let n = 1;
	while (used.has(n) && n < 200) n += 1;
	return {
		leverage: n,
		capitalPct: 3
	};
}
function groupUniverse(universe, defaultPct, tiers, otherLabel = "other") {
	const map = /* @__PURE__ */ new Map();
	let other = 0;
	for (const a of universe) {
		const lev = Math.round(Number(a.max_leverage) || 0);
		if (!(lev > 0)) continue;
		if (tiers.some((t) => t.leverage === lev)) map.set(lev, (map.get(lev) ?? 0) + 1);
		else other += 1;
	}
	const rows = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([lev, count]) => {
		const pct = capitalPctForLeverage(lev, defaultPct, tiers);
		return {
			key: String(lev),
			label: `${lev}x`,
			count,
			pct,
			notional: notionalPctOfEquity(pct, lev)
		};
	});
	if (other) rows.push({
		key: "other",
		label: otherLabel,
		count: other,
		pct: defaultPct,
		notional: defaultPct
	});
	return rows;
}
//#endregion
export { LevSizeEditor as t };
