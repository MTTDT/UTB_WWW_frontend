import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
export default function SingleSelector({selections, setSelection}: {selections: string[], setSelection: (selection: string) => void}) {
    return(
        <Select onValueChange={(value: string) => setSelection(value)}>
            <SelectTrigger className="">
                <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {selections.map((selection) => (
                        <SelectItem key={selection} value={selection}>{selection}</SelectItem>
                    ))}                
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}