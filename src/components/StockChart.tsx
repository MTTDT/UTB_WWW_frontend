"use client"

import React, { useState, useRef, useMemo } from "react"
import { TrendingUp, GripHorizontal, Target } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { Stock, StockForPrediction } from "@/types"

export function StockChart({ 
  stocks, 
  setPredictionPrep 
}: { 
  stocks: Stock[], 
  setPredictionPrep: React.Dispatch<React.SetStateAction<StockForPrediction | null>> 
}) {
  // --- Dragging & Selection State ---
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [targetStock, setTargetStock] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Data Transformation ---
  const chartData = useMemo(() => {
    const shiftedStocks = stocks.map((stock) => ({
      ...stock,
      shiftedTimestamps: stock.timestamps.map(
        (t) => t + (offsets[stock.ticker] || 0)
      ),
    }));

    const allStamps = Array.from(
      new Set(shiftedStocks.flatMap((s) => s.shiftedTimestamps))
    ).sort((a, b) => a - b);

    return allStamps.map((stamp) => {
      const dataPoint: { timestamp: number; [key: string]: number } = { timestamp: stamp };

      shiftedStocks.forEach((stock) => {
        const idx = stock.shiftedTimestamps.indexOf(stamp);
        if (idx !== -1) {
          dataPoint[stock.ticker] = stock.close_prices[idx];
        }
      });
      return dataPoint;
    });
  }, [stocks, offsets]);

  // --- Configuration ---
  const dynamicConfig = stocks.reduce((acc, stock, index) => {
    acc[stock.ticker] = {
      label: stock.ticker,
      color: `var(--chart-${(index % 5) + 1})`,
    };
    return acc;
  }, {} as ChartConfig);

  // --- Helper to Sync with Parent State ---
  const syncPredictionPayload = (target: string | null, currentOffsets: Record<string, number>) => {
    if (!target) return;

    // Map all stocks to the features format: [ticker, day_offset]
    const features = stocks.filter((s) => s.ticker !== target).map((s): [string, number] => {
      const secondsOffset = currentOffsets[s.ticker] || 0;
      const dayOffset = Math.round(secondsOffset / 86400); // 86400 seconds in a day
      return [s.ticker, dayOffset];
    });

    setPredictionPrep({
      target,
      features,
      test_size: 0.8 // Default fallback test size
    });
  };

  // --- UI Handlers ---
  const handleTargetSelect = (ticker: string) => {
    const nextTarget = targetStock === ticker ? null : ticker;
    setTargetStock(nextTarget);
    syncPredictionPayload(nextTarget, offsets);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedStock) return;
    setIsDragging(true);
    setLastX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedStock || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const minTime = chartData[0]?.timestamp || 0;
    const maxTime = chartData[chartData.length - 1]?.timestamp || 0;
    const timeRange = maxTime - minTime;

    if (timeRange <= 0 || rect.width <= 0) return;

    const timePerPixel = timeRange / rect.width;
    const deltaX = e.clientX - lastX;
    const timeDelta = Math.round(deltaX * timePerPixel);

    setOffsets((prev) => ({
      ...prev,
      [selectedStock]: (prev[selectedStock] || 0) + timeDelta,
    }));
    
    setLastX(e.clientX);
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      // Sync layout to parent only when the user finishes dragging
      syncPredictionPayload(targetStock, offsets);
    }
  };

  const resetOffsets = () => {
    setOffsets({});
    syncPredictionPayload(targetStock, {});
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div>
            <CardTitle>Stock Performance</CardTitle>
            <CardDescription>Historical Price Comparison</CardDescription>
          </div>
          
          {/* Controls Panel */}
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col items-start sm:items-center lg:items-end w-full lg:w-auto chunk-controls">
            
            {/* Target Selection UI */}
            <div className="flex flex-col lg:items-end gap-1.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3 text-destructive" />
                Select Prediction Target:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stocks.map((stock) => (
                  <Button
                    key={`target-${stock.ticker}`}
                    variant={targetStock === stock.ticker ? "destructive" : "outline"}
                    size="sm"
                    className="h-7 px-3 text-xs font-semibold"
                    onClick={() => handleTargetSelect(stock.ticker)}
                  >
                    {stock.ticker}
                  </Button>
                ))}
              </div>
            </div>

            {/* Drag Selection UI */}
            <div className="flex flex-col lg:items-end gap-1.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <GripHorizontal className="h-3 w-3" />
                Select stock to shift timeline:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stocks.map((stock) => (
                  <Badge
                    key={`drag-${stock.ticker}`}
                    variant={selectedStock === stock.ticker ? "default" : "secondary"}
                    className="cursor-pointer transition-colors px-2.5 py-1"
                    onClick={() => setSelectedStock(
                      selectedStock === stock.ticker ? null : stock.ticker
                    )}
                  >
                    {stock.ticker}
                  </Badge>
                ))}
                {Object.keys(offsets).length > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground" onClick={resetOffsets}>
                    Reset Shifts
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          style={{
            cursor: isDragging ? "grabbing" : (selectedStock ? "grab" : "default"),
            touchAction: "none"
          }}
        >
          <ChartContainer config={dynamicConfig}>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Date(value * 1000).toLocaleDateString(undefined, {
                    year: "2-digit",
                    month: "2-digit",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                labelFormatter={(value) => new Date(value * 1000).toLocaleDateString()}
              />
              
              {stocks.map((stock) => (
                <Line
                  connectNulls={true}
                  key={stock.ticker}
                  dataKey={stock.ticker}
                  type="monotone"
                  stroke={dynamicConfig[stock.ticker].color}
                  strokeWidth={
                    targetStock === stock.ticker ? 4 : (selectedStock === stock.ticker ? 2.5 : 1.5)
                  }
                  strokeDasharray={targetStock === stock.ticker ? "4 4" : undefined} // Distinct look for target
                  dot={false}
                  isAnimationActive={!isDragging}
                />
              ))}
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium text-muted-foreground">
          Live Market Data <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}