"use client"

import { Plus } from "lucide-react"

interface LessonHeaderProps {
  title: string
  subtitle: string
  onAddPage: () => void
}

export default function LessonHeader({ title, subtitle, onAddPage }: LessonHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{subtitle}</p>
        </div>
        <button
          onClick={onAddPage}
          className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </button>
      </div>
    </div>
  )
}
