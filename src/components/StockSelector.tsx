import { useEffect, useState } from "react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  
} from "@/components/ui/combobox"
import { Button } from "@/components/ui/button";

import { getStockNames, deleteTicker } from "@/api_req"

export default function StockSelector({ setSelectedStocks, refetch }: { setSelectedStocks: (stocks: string[]) => void , refetch: boolean}) {
  const [value, setValue] = useState<string[]>([])
  const [stocks, setStocks] = useState<string[]>([])
    useEffect(() => {
        async function fetchStockNames() {
            const stockNames = await getStockNames()
            console.log("Fetched stock names:", stockNames)
            setStocks(stockNames.map((stock) => stock.ticker))
        }
        fetchStockNames()
    }, [refetch, setStocks])

    useEffect(() => {
        setSelectedStocks(value)
    }, [value, setSelectedStocks])

    const handleRemove = async (ticker: string) => {
      try {
        await deleteTicker(ticker)
        setValue((prev) => prev.filter((t) => t !== ticker))
        setStocks((prev) => prev.filter((t) => t !== ticker))
        const newValue = value.filter((t) => t !== ticker)
        setSelectedStocks(newValue)
      } catch (err) {
        console.error("Failed to delete ticker:", err)
      }
    }

    




  return (
    <Combobox
      items={stocks || []}
      multiple
      value={value}
      onValueChange={setValue}
    >
      <ComboboxChips>
        <ComboboxValue>
          {value.map((item) => (
            <ComboboxChip key={item}>{item}</ComboboxChip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput placeholder="Add framework" />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
              <Button variant="outline" size="sm" className="ml-auto" type="button" onClick={(e) => {handleRemove(item); e.stopPropagation()}}>
                remove
              </Button>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}