
import { apiFetch } from "./auth";

export interface StockRecord {
  ticker: string;
  close_prices: number[];
}

export interface TickerName {
  ticker: string;
  full_name: string;
}

export interface PredictionResult {
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