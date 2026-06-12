export interface Stock {
    ticker: string;
    timestamps: number[];
    close_prices: number[];
    open_prices: number[];
    high_prices: number[];
    low_prices: number[];
}
export interface StockForPrediction {
    target: string;
    features: [string, number][]; 
    test_size: number;
}
export interface NewStockRequest {
    ticker: string;
    interval: string;
    range: string;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface TickerName {
  ticker: string;
  full_name: string;
}

export interface PredictionResult {
  training_data: number[];
  predicted_test: number[];
  train_timestamps: number[];
  test_timestamps: number[];
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  guest_tickers?: Array<{ ticker: string; interval: string; range: string }>;
  guest_session_id?: string;
}