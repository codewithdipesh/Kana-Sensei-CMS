"use client"

import { useState } from "react"
import { Search, Menu, X } from "lucide-react"
import Sidebar from "@/components/sidebar"
import CharacterTable from "@/components/character-table"
import AddCharacterModal from "@/components/add-character-modal"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleAddClick = () => {
    setEditingCharacter(null)
    setIsModalOpen(true)
  }

  const handleEdit = (character) => {
    setEditingCharacter(character)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCharacter(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden lg:flex w-64 bg-gray-900 flex-col">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`fixed left-0 top-0 h-screen w-64 lg:hidden transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <button
                onClick={handleAddClick}
                className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                + Add Kana
              </button>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by Text or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
          <CharacterTable searchQuery={searchQuery} onEdit={handleEdit} />
        </div>
      </main>

      <AddCharacterModal isOpen={isModalOpen} onClose={handleCloseModal} editingCharacter={editingCharacter} />
    </div>
  )
}
