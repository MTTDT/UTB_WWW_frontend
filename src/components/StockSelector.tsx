import React, { useEffect, useState } from "react"
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

import { getStockNames } from "@/api_req"

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
    }, [refetch])

    useEffect(() => {
        setSelectedStocks(value)
    }, [value, setSelectedStocks])




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
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}