import { o as __toESM } from "../_runtime.mjs";
import { s as indicatorLabel } from "./types-MiIsfLYT.mjs";
import { $ as setEngineRow, I as parseEngineGates, J as serializeEngineGates, L as parseSideGates, Q as setEngineGate, S as isSideOn, X as setAllSides, Y as setAllEngines, Z as setEngineCol, h as countSidesArmed, m as countArmed, n as ENGINE_FAMILIES, r as ENGINE_TFS, tt as setSideGate, x as isEngineOn } from "./tick.server-BULNc5Gq.mjs";
import { B as require_react, b as require_jsx_runtime, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as useLocale, l as saveDeskSettings } from "./functions-MYTkcX0p.mjs";
import { o as Route$5 } from "./router-BLY6pnWe.mjs";
import { n as cn, t as DeskShell } from "./shell-CFc0rpLx.mjs";
import { t as Button } from "./button-BK9WVr_q.mjs";
import { t as LockPanel } from "./lock-panel-DyPoIhDx.mjs";
import { t as Badge } from "./badge-BKxPaM8C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engines-vcB4QbPf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const data = Route$5.useLoaderData();
	const { t, locale } = useLocale();
	const router = useRouter();
	const unlocked = data.lock.unlocked;
	const fa = locale === "fa";
	const raw = data.settings.engineGates;
	const storedGates = (0, import_react.useMemo)(() => parseEngineGates(raw), [raw]);
	const storedSides = (0, import_react.useMemo)(() => parseSideGates(raw), [raw]);
	const [gates, setGates] = (0, import_react.useState)(storedGates);
	const [sides, setSides] = (0, import_react.useState)(storedSides);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setGates(storedGates);
		setSides(storedSides);
	}, [storedGates, storedSides]);
	const armed = countArmed(gates);
	const sideArmed = countSidesArmed(sides);
	const dirty = serializeEngineGates(gates, sides) !== serializeEngineGates(storedGates, storedSides);
	async function save() {
		if (!unlocked) return;
		setBusy(true);
		setMsg(null);
		setErr(null);
		try {
			await saveDeskSettings({ data: { engine_gates: serializeEngineGates(gates, sides) } });
			setMsg(t.enginesSaved);
			await router.invalidate({ sync: true });
		} catch (e) {
			setErr(e instanceof Error ? e.message : "save failed");
		} finally {
			setBusy(false);
		}
	}
	function flip(name, tf) {
		if (!unlocked) return;
		setGates((g) => setEngineGate(g, name, tf, !isEngineOn(g, name, tf)));
	}
	function flipSide(name, side) {
		if (!unlocked) return;
		setSides((s) => setSideGate(s, name, side, !isSideOn(s, name, side)));
	}
	function rowOn(name, on) {
		if (!unlocked) return;
		setGates((g) => setEngineRow(g, name, on));
	}
	function colOn(tf, on) {
		if (!unlocked) return;
		setGates((g) => setEngineCol(g, tf, on));
	}
	function familyOn(names, on) {
		if (!unlocked) return;
		setGates((g) => names.reduce((acc, name) => setEngineRow(acc, name, on), g));
	}
	function allSide(side, on) {
		if (!unlocked) return;
		setSides((s) => setAllSides(s, side, on));
	}
	const longAllOn = sideArmed.longOn === sideArmed.total;
	const shortAllOn = sideArmed.shortOn === sideArmed.total;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DeskShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl tracking-tight",
				children: t.engines
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: t.enginesHint
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: armed.on === armed.total ? "long" : armed.on === 0 ? "short" : "warn",
						children: fa ? `${armed.on} از ${armed.total} ${t.enginesArmed}` : `${armed.on} / ${armed.total} ${t.enginesArmed}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: longAllOn ? "long" : sideArmed.longOn === 0 ? "short" : "warn",
						children: fa ? `${sideArmed.longOn} از ${sideArmed.total} ${t.enginesLongArmed}` : `${sideArmed.longOn} / ${sideArmed.total} ${t.enginesLongArmed}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: shortAllOn ? "short" : sideArmed.shortOn === 0 ? "muted" : "warn",
						children: fa ? `${sideArmed.shortOn} از ${sideArmed.total} ${t.enginesShortArmed}` : `${sideArmed.shortOn} / ${sideArmed.total} ${t.enginesShortArmed}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: !unlocked || busy,
						onClick: () => setGates(setAllEngines(true)),
						children: t.enginesAllOn
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: !unlocked || busy,
						onClick: () => setGates(setAllEngines(false)),
						children: t.enginesAllOff
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: !unlocked || busy,
						onClick: () => allSide("long", !longAllOn),
						children: longAllOn ? t.enginesAllLongOff : t.enginesAllLongOn
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						disabled: !unlocked || busy,
						onClick: () => allSide("short", !shortAllOn),
						children: shortAllOn ? t.enginesAllShortOff : t.enginesAllShortOn
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						disabled: !unlocked || busy || !dirty,
						onClick: save,
						children: busy ? t.running : t.save
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockPanel, {
				hasPin: data.lock.hasPin,
				unlocked
			})
		}),
		!unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-warn",
			children: t.enginesLocked
		}) : null,
		msg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-long",
			children: msg
		}) : null,
		err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-short",
			children: err
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 overflow-x-auto rounded-lg border border-border bg-surface shadow-panel",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[760px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs text-subtle",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 text-start font-medium",
								children: t.thInd
							}),
							ENGINE_TFS.map((tf) => {
								const colOnCount = ENGINE_FAMILIES.flatMap((f) => f.names).filter((n) => isEngineOn(gates, n, tf)).length;
								const colTotal = ENGINE_FAMILIES.reduce((a, f) => a + f.names.length, 0);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-2 py-2 text-center font-medium",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											dir: "ltr",
											children: tf
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: !unlocked,
											onClick: () => colOn(tf, colOnCount < colTotal),
											className: "mx-auto text-[10px] text-muted hover:text-fg disabled:opacity-40",
											children: t.enginesCol
										})]
									})
								}, tf);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-center font-medium",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.long }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !unlocked,
										onClick: () => allSide("long", !longAllOn),
										className: "mx-auto text-[10px] text-muted hover:text-fg disabled:opacity-40",
										children: t.enginesCol
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-center font-medium",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.short }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !unlocked,
										onClick: () => allSide("short", !shortAllOn),
										className: "mx-auto text-[10px] text-muted hover:text-fg disabled:opacity-40",
										children: t.enginesCol
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 text-center font-medium",
								children: t.enginesRow
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: ENGINE_FAMILIES.map((family) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyBlock, {
					family,
					gates,
					sides,
					unlocked,
					fa,
					rowOn: t.enginesOn,
					rowOff: t.enginesOff,
					rowLabel: t.enginesRow,
					familyLabel: t.enginesFamily,
					onFlip: flip,
					onFlipSide: flipSide,
					onRow: rowOn,
					onFamily: familyOn
				}, family.id)) })]
			})
		})
	] });
}
function FamilyBlock({ family, gates, sides, unlocked, fa, rowOn, rowOff, rowLabel, familyLabel, onFlip, onFlipSide, onRow, onFamily }) {
	const familyOnCount = family.names.reduce((n, name) => n + ENGINE_TFS.filter((tf) => isEngineOn(gates, name, tf)).length, 0);
	const familyTotal = family.names.length * ENGINE_TFS.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-t border-border bg-bg-elev",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-3 py-2 font-medium",
				colSpan: 1,
				children: family.label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2 text-center text-xs text-subtle",
				colSpan: ENGINE_TFS.length + 2,
				children: fa ? `${familyOnCount} از ${familyTotal}` : `${familyOnCount} / ${familyTotal}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-2 py-2 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: !unlocked,
					onClick: () => onFamily(family.names, familyOnCount < familyTotal),
					className: "text-[10px] text-muted hover:text-fg disabled:opacity-40",
					children: familyLabel
				})
			})
		]
	}), family.names.map((name) => {
		const rowCount = ENGINE_TFS.filter((tf) => isEngineOn(gates, name, tf)).length;
		const longOn = isSideOn(sides, name, "long");
		const shortOn = isSideOn(sides, name, "short");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
			className: "border-t border-border/60",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
					className: "px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: indicatorLabel(name)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-[10px] text-subtle",
						dir: "ltr",
						children: name
					})]
				}),
				ENGINE_TFS.map((tf) => {
					const on = isEngineOn(gates, name, tf);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-2 py-2 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: !unlocked,
							onClick: () => onFlip(name, tf),
							className: cn("inline-flex h-11 min-w-16 items-center justify-center rounded-sm border px-3 text-xs font-medium transition-colors disabled:opacity-40", on ? "border-long/40 bg-long-dim text-long" : "border-border bg-surface-2 text-muted"),
							children: on ? rowOn : rowOff
						})
					}, tf);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-2 py-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !unlocked,
						onClick: () => onFlipSide(name, "long"),
						className: cn("inline-flex h-11 min-w-16 items-center justify-center rounded-sm border px-3 text-xs font-medium transition-colors disabled:opacity-40", longOn ? "border-long/40 bg-long-dim text-long" : "border-border bg-surface-2 text-muted"),
						children: longOn ? rowOn : rowOff
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-2 py-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !unlocked,
						onClick: () => onFlipSide(name, "short"),
						className: cn("inline-flex h-11 min-w-16 items-center justify-center rounded-sm border px-3 text-xs font-medium transition-colors disabled:opacity-40", shortOn ? "border-short/40 bg-short-dim text-short" : "border-border bg-surface-2 text-muted"),
						children: shortOn ? rowOn : rowOff
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					className: "px-2 py-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !unlocked,
						onClick: () => onRow(name, rowCount < ENGINE_TFS.length),
						className: "text-[10px] text-muted hover:text-fg disabled:opacity-40",
						children: rowLabel
					})
				})
			]
		}, name);
	})] });
}
//#endregion
export { Page as component };
