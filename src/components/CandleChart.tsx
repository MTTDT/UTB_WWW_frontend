"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"

import type { Stock } from "@/types"

export function StockCandleChart({ stock }: { stock: Stock }) {
  const chartData = stock.timestamps.map((stamp, i) => {
    const isBullish = stock.close_prices[i] >= stock.open_prices[i];
    return {
      timestamp: stamp,
      open: stock.open_prices[i],
      high: stock.high_prices[i],
      low: stock.low_prices[i],
      close: stock.close_prices[i],
      ohlc: [stock.open_prices[i], stock.close_prices[i]],
      wick: [stock.low_prices[i], stock.high_prices[i]],
      color: isBullish ? "#22c55e" : "#ef4444", // Green-500 : Red-500
    };
  });

  const chartConfig = {
    ohlc: { label: "Price Action" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{stock.ticker} - Candlestick</CardTitle>
        <CardDescription>Daily OHLC View</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-100 w-full">
          <BarChart data={chartData} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => new Date(val * 1000).toLocaleDateString()}
            />
            <YAxis hide domain={["auto", "auto"]} />
            <ChartTooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border p-2 rounded shadow-sm text-xs">
                      <p className="font-bold">{new Date(data.timestamp * 1000).toLocaleDateString()}</p>
                      <p>O: {data.open.toFixed(2)}</p>
                      <p className="text-green-500">H: {data.high.toFixed(2)}</p>
                      <p className="text-red-500">L: {data.low.toFixed(2)}</p>
                      <p>C: {data.close.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* The Wick (Thin line) */}
            <Bar dataKey="wick" fill="#888888" barSize={2} />
            
            {/* The Body (Thicker rectangle) */}
            <Bar dataKey="ohlc" barSize={12}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 font-medium text-sm leading-none">
          OHLC Visualizer <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}