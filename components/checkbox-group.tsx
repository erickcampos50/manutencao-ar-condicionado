"use client"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxGroupProps {
  items: { id: string; label: string }[]
  selectedItems: string[]
  onChange: (selectedItems: string[]) => void
}

export function CheckboxGroup({ items, selectedItems, onChange }: CheckboxGroupProps) {
  const handleItemChange = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedItems, id])
    } else {
      onChange(selectedItems.filter((item) => item !== id))
    }
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <Checkbox
            id={item.id}
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => handleItemChange(item.id, checked as boolean)}
          />
          <label
            htmlFor={item.id}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {item.label}
          </label>
        </div>
      ))}
    </div>
  )
}
