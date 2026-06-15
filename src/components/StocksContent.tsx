"use client";
import { useEffect, useState } from "react";

import { AuthDialog } from "@/components/AuthDialog";
import StockSelector from "@/components/StockSelector";
import SingleSelector from "@/components/SingleSelector";
import { StockChart } from "@/components/StockChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { StockForPrediction, Stock } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getStocksData,
  addNewTicker,
  predict
} from "../api_req";
import { findDerivitive } from "@/utils";
import { PlusCircle, TrendingUp, } from "lucide-react";

export default function StocksContent() {
    const [authOpen, setAuthOpen] = useState(false);
  
    const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
    const [stocksData, setStocksData] = useState<Stock[] | null>(null);
    const [derivativeData, setDerivativeData] = useState<Stock[] | null>(null);
    const [chartData, setChartData] = useState<Stock[] | null>(null);
  
  
    const [newTicker, setNewTicker] = useState("");
    const [interval, setIntervalVal] = useState("1d");
    const [range, setRange] = useState("3mo");
    const [addingTicker, setAddingTicker] = useState(false);
  
    const [refetch, setRefetch] = useState(true);

    const [predictionPrep, setPredictionPrep] = useState<StockForPrediction | null>(null);
  
    const handleGetSelectedStocks = async () => {
      const data = await getStocksData(selectedStocks);
      setStocksData(data);
    };
  
    const handleAddTicker = async () => {
      if (!newTicker) return;
  
      setAddingTicker(true);
      try {
        await addNewTicker(newTicker, interval, range);
        setNewTicker("");
      } finally {
        setAddingTicker(false);
        setRefetch((prev) => !prev);
      }
    };
  
    const handlePredict = async () => {
      if (predictionPrep === null) return;
      const prediction = await predict(predictionPrep);
      const allTimestamps = [...prediction.train_timestamps, ...prediction.test_timestamps];
      const fullTrainPrices = [
        ...prediction.training_data,
        ...new Array(prediction.test_timestamps.length).fill(null),
      ];
      const fullPredictPrices = [
        ...new Array(prediction.train_timestamps.length).fill(null),
        ...prediction.predicted_test,
      ];
      setChartData([...(stocksData || []),
        { ticker: predictionPrep.target + "_trained", timestamps: allTimestamps, close_prices: fullTrainPrices, open_prices: [], high_prices: [], low_prices: [] },
        { ticker:  predictionPrep.target + "_predicted", timestamps: allTimestamps, close_prices: fullPredictPrices, open_prices: [], high_prices: [], low_prices: [] },
      ]);
    };
  
    useEffect(() => { setChartData(stocksData); }, [stocksData]);
    useEffect(() => { setChartData(derivativeData); }, [derivativeData]);
  
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
  
          {/* ── Add Ticker ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Ticker
              </CardTitle>
              <CardDescription>Fetch a new stock symbol into your session.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Interval</span>
                  <SingleSelector selections={["1h", "1d", "1wk", "1mo"]} setSelection={setIntervalVal} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Range</span>
                  <SingleSelector selections={["1mo", "3mo", "6mo", "1y"]} setSelection={setRange} />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-35">
                  <span className="text-xs text-muted-foreground">Symbol</span>
                  <Input
                    placeholder="e.g. AAPL"
                    value={newTicker}
                    onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTicker()}
                    className="uppercase"
                  />
                </div>
                <Button onClick={handleAddTicker} disabled={!newTicker || addingTicker}>
                  {addingTicker ? "Adding…" : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>
  
          {/* ── Stock Selector ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Watchlist
              </CardTitle>
              <CardDescription>Select tickers to chart.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StockSelector setSelectedStocks={setSelectedStocks} refetch={refetch}/>
              <Button
                onClick={handleGetSelectedStocks}
                disabled={selectedStocks.length === 0}
                className="w-full sm:w-auto"
              >
                Load {selectedStocks.length > 0 ? `${selectedStocks.length} Stock${selectedStocks.length !== 1 ? "s" : ""}` : "Stocks"}
              </Button>
            </CardContent>
          </Card>
  
          {/* ── Chart ── */}
          {chartData && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">Chart</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {chartData.map((s) => (
                      <Badge key={s.ticker} variant="secondary" className="text-xs">
                        {s.ticker}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StockChart stocks={chartData} setPredictionPrep={setPredictionPrep} />
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDerivativeData(findDerivitive(chartData))}>
                    Derivative
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setChartData(stocksData)}>
                    Reset
                  </Button>
                
                </div>
              </CardContent>
            </Card>
          )}
  
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Prediction Setup</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 items-end">
               
              <Button onClick={handlePredict} disabled={!predictionPrep}>
                Run Prediction
              </Button>
            </CardContent>
          </Card>
        </main>
  
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    );
  }