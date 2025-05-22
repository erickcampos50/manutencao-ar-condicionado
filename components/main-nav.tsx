"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AirVent, ClipboardList, Search, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"
import { useRouter } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  // Atalhos de teclado para navegação
  useKeyboardShortcut("F2", () => {
    router.push("/")
    toast({
      title: "Navegação",
      description: "Página inicial",
    })
  })

  useKeyboardShortcut("F3", () => {
    router.push("/equipamentos/novo")
    toast({
      title: "Navegação",
      description: "Entrada de Equipamento",
    })
  })

  useKeyboardShortcut("F4", () => {
    router.push("/intervencoes")
    toast({
      title: "Navegação",
      description: "Intervenções",
    })
  })

  useKeyboardShortcut("F5", () => {
    router.push("/consultas")
    toast({
      title: "Navegação",
      description: "Consultas",
    })
  })

  useKeyboardShortcut("F1", () => {
    toast({
      title: "Ajuda - Atalhos de Navegação",
      description: "F2: Início | F3: Equipamentos | F4: Intervenções | F5: Consultas",
    })
  })

  const navItems = [
    {
      href: "/",
      label: "Início",
      icon: <Home className="h-4 w-4 mr-2" />,
      shortcut: "F2",
    },
    {
      href: "/equipamentos/novo",
      label: "Equipamentos",
      icon: <AirVent className="h-4 w-4 mr-2" />,
      shortcut: "F3",
    },
    {
      href: "/intervencoes",
      label: "Intervenções",
      icon: <ClipboardList className="h-4 w-4 mr-2" />,
      shortcut: "F4",
    },
    {
      href: "/consultas",
      label: "Consultas",
      icon: <Search className="h-4 w-4 mr-2" />,
      shortcut: "F5",
    },
  ]

  return (
    <nav className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center font-bold text-lg">
              <AirVent className="h-6 w-6 mr-2" />
              <span>Sistema de Ar-Condicionado</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.icon}
                {item.label}
                <span className="ml-2 text-xs opacity-60">({item.shortcut})</span>
              </Link>
            ))}
          </div>
          <div className="md:hidden">
            <button
              className="p-2 rounded-md hover:bg-muted"
              onClick={() => {
                toast({
                  title: "Atalhos de Navegação",
                  description: "F2: Início | F3: Equipamentos | F4: Intervenções | F5: Consultas",
                })
              }}
            >
              <span className="sr-only">Atalhos</span>
              <AirVent className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
