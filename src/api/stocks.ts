// src/api/stocks.ts
// Drop-in replacement for any existing stocks fetching code.
// Uses apiFetch so auth headers / guest session headers are injected automatically.
import { apiFetch } from "./auth";

export interface StockRecord {
  ticker: string;
  close_prices: number[];
  // … extend with other fields your backend returns
}

export interface TickerName {
  ticker: string;
  full_name: string;
}

export interface PredictionResult {
  // Shape depends on your regression_model output
  [key: string]: unknown;
}

export function getTickerNames(): Promise<TickerName[]> {
  return apiFetch("/stocks/names");
}

export function getStocks(tickers: string[]): Promise<StockRecord[]> {
  return apiFetch("/stocks", {
    method: "POST",
    body: JSON.stringify({ tickers }),
  });
}

export function addTicker(
  ticker: string,
  interval = "1d",
  range = "3mo"
): Promise<{ message: string }> {
  return apiFetch("/stocks/add", {
    method: "POST",
    body: JSON.stringify({ ticker, interval, range }),
  });
}

export function predict(
  target: string,
  features: string[],
  test_size: number
): Promise<PredictionResult> {
  return apiFetch("/predict", {
    method: "POST",
    body: JSON.stringify({ target, features, test_size }),
  });
}