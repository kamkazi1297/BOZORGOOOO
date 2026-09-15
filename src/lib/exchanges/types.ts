import type { Side, VenueId } from "@/lib/engine/types";

export type ExchangeAccount = {
  venue: VenueId;
  apiKey?: string;
  apiSecret?: string;
  privateKey?: string;
  accountIndex?: number;
  apiKeyIndex?: number;
  walletAddress?: string;
};

export type PlaceOrderInput = {
  symbol: string;
  side: Side;
  qty: number;
  leverage: number;
  sl: number;
  tp: number;
  reduceOnly?: boolean;
  /** Signal/paper entry. Used only to rebase SL/TP onto the live fill. */
  entry?: number;
};

export type PlaceOrderResult = {
  ok: boolean;
  orderId?: string;
  message: string;
  /** Fill is still open on the venue. Set when ok is false after a failed flatten. */
  liveOpen?: boolean;
  /** Actual average fill on the venue (market entry). */
  fillPrice?: number;
  filledQty?: number;
  feeUsd?: number;
  /** SL/TP actually placed (rebased onto the live fill when known). */
  sl?: number;
  tp?: number;
};

export type PositionSnapshot = {
  symbol: string;
  side: Side;
  qty: number;
  entry: number;
  leverage: number;
  upl: number;
};

export type ConnectionTest = {
  ok: boolean;
  message: string;
};

export type UpdateStopInput = {
  symbol: string;
  side: Side;
  sl: number;
  tp: number;
  qty: number;
};

export type ProtectionSnapshot = {
  onVenue: boolean;
  hasSl: boolean;
  hasTp: boolean;
  unknown: boolean;
};

export type ListedMarket = {
  base: string;
  symbol: string;
  venueSymbol: string;
  volume24hUsd: number;
  maxLeverage: number;
};

export type VenueTrade = {
  time: number;
  side: string;
  price: number;
  qty: number;
  realizedPnl: number;
  commission: number;
  orderId?: string;
};

export type ExchangeAdapter = {
  id: VenueId;
  label: string;
  kind: "dex" | "cex" | "sim";
  docs: string;
  symbolOf(base: string): string;
  /** Public listed perps on this venue — the only tradeable set. */
  listMarkets(): Promise<ListedMarket[]>;
  fetchMaxLeverage(symbol: string, account?: ExchangeAccount): Promise<number>;
  fetchBalance(account: ExchangeAccount): Promise<number | null>;
  placeOrder(account: ExchangeAccount, order: PlaceOrderInput): Promise<PlaceOrderResult>;
  /** Move the venue stop (TREX break-even). Must keep TP in place. */
  updateStop(account: ExchangeAccount, order: UpdateStopInput): Promise<PlaceOrderResult>;
  closePosition(account: ExchangeAccount, symbol: string): Promise<PlaceOrderResult>;
  fetchPositions(account: ExchangeAccount): Promise<PositionSnapshot[]>;
  /** Re-read the live position and whether SL/TP are actually on the book. */
  fetchProtection(
    account: ExchangeAccount,
    input: { symbol: string; sl: number; tp: number },
  ): Promise<ProtectionSnapshot>;
  testConnection(account: ExchangeAccount): Promise<ConnectionTest>;
  /** Fills actually executed on the venue (journal / realized PnL). */
  fetchTrades?(
    account: ExchangeAccount,
    opts: { symbol: string; startTime?: number },
  ): Promise<VenueTrade[]>;
};
