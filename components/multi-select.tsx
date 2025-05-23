"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  items: { id: string; label: string }[]
  selectedItems: string[]
  onChange: (selectedItems: string[]) => void
  placeholder?: string
  className?: string
  maxDisplayItems?: number
}

export function MultiSelect({
  items,
  selectedItems,
  onChange,
  placeholder = "Selecione itens...",
  className,
  maxDisplayItems = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedLabels = items
    .filter((item) => selectedItems.includes(item.id))
    .map((item) => item.label)

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleSelect = (itemId: string) => {
    const newSelectedItems = selectedItems.includes(itemId)
      ? selectedItems.filter((id) => id !== itemId)
      : [...selectedItems, itemId]
    
    onChange(newSelectedItems)
  }

  const handleRemove = (itemId: string) => {
    onChange(selectedItems.filter((id) => id !== itemId))
  }

  const handleClearAll = () => {
    onChange([])
  }

  const displayText = () => {
    if (selectedLabels.length === 0) {
      return placeholder
    }
    
    if (selectedLabels.length <= maxDisplayItems) {
      return selectedLabels.join(", ")
    }
    
    return `${selectedLabels.slice(0, maxDisplayItems).join(", ")} +${selectedLabels.length - maxDisplayItems} mais`
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <span className="truncate">{displayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
              <CommandGroup>
                {selectedItems.length > 0 && (
                  <CommandItem onSelect={handleClearAll} className="justify-center text-sm text-muted-foreground">
                    Limpar seleção
                  </CommandItem>
                )}
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedItems.includes(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Badges dos itens selecionados */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label, index) => {
            const itemId = items.find((item) => item.label === label)?.id
            return (
              <Badge
                key={`${itemId}-${index}`}
                variant="secondary"
                className="text-xs"
              >
                {label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(itemId!)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleRemove(itemId!)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
