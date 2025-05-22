"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface ComboboxProps {
  items: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowCustomValue?: boolean
}

export function Combobox({
  items,
  value,
  onChange,
  placeholder = "Selecione um item...",
  allowCustomValue = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [customMode, setCustomMode] = React.useState(false)

  // Encontrar o item selecionado ou usar o valor como label se for um valor personalizado
  const selectedItem = items.find((item) => item.value === value)
  const displayValue = selectedItem ? selectedItem.label : value

  // Resetar o modo personalizado quando o dropdown é fechado
  React.useEffect(() => {
    if (!open) {
      setCustomMode(false)
    }
  }, [open])

  // Adicionar valor personalizado
  const handleAddCustomValue = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim())
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? displayValue : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        {customMode ? (
          <div className="flex flex-col p-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite um novo valor..."
              className="mb-2"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setCustomMode(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleAddCustomValue}>
                Adicionar
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput
              placeholder={`Buscar ${placeholder.toLowerCase()}...`}
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                {allowCustomValue ? (
                  <Button variant="outline" className="w-full justify-start mt-2" onClick={() => setCustomMode(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar "{inputValue}"
                  </Button>
                ) : (
                  "Não encontrado."
                )}
              </CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={() => {
                      onChange(item.value === value ? "" : item.value)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                    {item.label}
                  </CommandItem>
                ))}
                {allowCustomValue &&
                  inputValue.trim() &&
                  !items.some(
                    (item) =>
                      item.label.toLowerCase() === inputValue.toLowerCase() ||
                      item.value.toLowerCase() === inputValue.toLowerCase(),
                  ) && (
                    <CommandItem
                      value={`add-${inputValue}`}
                      onSelect={() => {
                        onChange(inputValue)
                        setOpen(false)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar "{inputValue}"
                    </CommandItem>
                  )}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
