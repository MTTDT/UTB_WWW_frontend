import type { Stock } from "@/types"

export function findDerivitive(stocks: Stock[]) {
    const derivitiveStocks: Stock[] = [];
    stocks.map((stock) => {
        const d_stock = {
            ticker: stock.ticker,
            timestamps: stock.timestamps,
            close_prices: [] as number[],
            open_prices: [],
            high_prices: [],
            low_prices: []
        }
        stock.close_prices.map((price, j) => {
            if(j === stock.close_prices.length - 1) return;

            const dy = stock.close_prices[j+1] - price;
            const dx = stock.timestamps[j+1] - stock.timestamps[j];

            d_stock.close_prices.push(dy/dx );
        })
        derivitiveStocks.push(d_stock);

    });


    return derivitiveStocks;
}

export function interpolateDots(stocks: Stock[]) {
    return stocks;
}