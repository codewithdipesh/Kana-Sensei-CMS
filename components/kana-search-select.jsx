"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, ChevronDown, X, Check } from "lucide-react"

/**
 * Searchable kana picker. Type to filter by romaji / character / type
 * (e.g. "t" -> ta, ti, tsu, te, to) for faster content authoring.
 *
 * Drop-in replacement for the plain <select> kana dropdowns.
 */
export default function KanaSearchSelect({
  characters = [],
  value,
  onChange,
  ringClass = "focus:ring-blue-500",
  placeholder = "Choose a kana...",
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selected = useMemo(
    () => characters.find((c) => c.id === value),
    [characters, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return characters
    return characters.filter((c) => {
      const haystack = `${c.character || ""} ${c.romaji || ""} ${c.kana_type || ""}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [characters, query])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  // Focus the search field and reset highlight when opening.
  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      // Defer so the input is mounted before focusing.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const select = (char) => {
    onChange(char.id)
    setOpen(false)
    setQuery("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const char = filtered[activeIndex]
      if (char) select(char)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-left bg-white focus:outline-none focus:ring-2 ${ringClass}`}
      >
        <span className={selected ? "text-gray-900" : "text-gray-500"}>
          {selected
            ? `${selected.character} (${selected.romaji}) - ${selected.kana_type}`
            : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
            />
          )}
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search romaji, kana, type..."
              className="w-full text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500">No matches</li>
            ) : (
              filtered.map((char, i) => (
                <li key={char.id}>
                  <button
                    type="button"
                    onClick={() => select(char)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left ${
                      i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-gray-900">
                      <span className="font-semibold">{char.character}</span>{" "}
                      <span className="text-gray-600">({char.romaji})</span>{" "}
                      <span className="text-gray-400">- {char.kana_type}</span>
                    </span>
                    {char.id === value && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
