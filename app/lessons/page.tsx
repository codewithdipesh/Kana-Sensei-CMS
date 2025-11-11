"use client"

import { useState } from "react"
import { Search, Menu, X, Plus } from "lucide-react"
import Sidebar from "@/components/sidebar"
import PagesList from "@/components/pages-list"
import PageEditor from "@/components/page-editor"

export default function LessonsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPage, setSelectedPage] = useState<any>(null)
  const [pages, setPages] = useState([
    { id: 1, order: 1, title: "Animation", type: "ANIMATION", badge: "Animation" },
    { id: 2, order: 2, title: "Practice_guided", type: "PRACTICE", badge: "Practice_guided" },
    { id: 3, order: 3, title: "Practice", type: "PRACTICE", badge: "Practice" },
    { id: 4, order: 4, title: "Illustration", type: "INFO", badge: "Illustration" },
    { id: 5, order: 5, title: "Practice_guided", type: "PRACTICE", badge: "Practice_guided" },
    { id: 6, order: 6, title: "Practice", type: "PRACTICE", badge: "Practice" },
  ])

  const getPageTypeColor = (type: string) => {
    switch (type) {
      case "INFO":
        return "bg-blue-500"
      case "ANIMATION":
        return "bg-purple-500"
      case "PRACTICE":
        return "bg-green-500"
      case "QUIZ":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleAddPage = () => {
    const newPage = {
      id: Math.max(...pages.map((p) => p.id), 0) + 1,
      order: pages.length + 1,
      title: "New Page",
      type: "INFO",
      badge: "New Page",
    }
    setPages([...pages, newPage])
    setSelectedPage(newPage)
  }

  const handleDeletePage = (id: number) => {
    const filtered = pages.filter((p) => p.id !== id)
    setPages(filtered)
    if (selectedPage?.id === id) {
      setSelectedPage(filtered[0] || null)
    }
  }

  const handleMoveUp = (id: number) => {
    const index = pages.findIndex((p) => p.id === id)
    if (index > 0) {
      const newPages = [...pages]
      ;[newPages[index], newPages[index - 1]] = [newPages[index - 1], newPages[index]]
      newPages.forEach((p, i) => (p.order = i + 1))
      setPages(newPages)
    }
  }

  const handleMoveDown = (id: number) => {
    const index = pages.findIndex((p) => p.id === id)
    if (index < pages.length - 1) {
      const newPages = [...pages]
      ;[newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]]
      newPages.forEach((p, i) => (p.order = i + 1))
      setPages(newPages)
    }
  }

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) || page.order.toString().includes(searchQuery),
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="w-20 md:w-64 bg-gray-900 hidden lg:flex flex-col">
        <Sidebar />
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`fixed left-0 top-0 h-screen w-64 lg:hidden transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex-1 sm:flex-none">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Vowels</h1>
                <p className="text-xs sm:text-sm text-gray-600">あ, い, う, え, お</p>
              </div>
            </div>
            <button
              onClick={handleAddPage}
              className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus className="w-4 h-4" />
              Add Page
            </button>
          </div>
        </div>

        {/* Content Area - Responsive Grid */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-3 sm:p-6 md:p-8">
          {/* Left Panel - Pages List */}
          <div className="w-full lg:w-72 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search */}
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search pages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Pages List */}
              <div className="flex-1 overflow-y-auto">
                {filteredPages.length > 0 ? (
                  <PagesList
                    pages={filteredPages}
                    selectedPage={selectedPage}
                    onSelectPage={setSelectedPage}
                    onDeletePage={handleDeletePage}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    getPageTypeColor={getPageTypeColor}
                  />
                ) : (
                  <div className="p-4 text-center text-gray-500 text-xs sm:text-sm">No pages found</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Page Editor */}
          <div className="w-full lg:flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {selectedPage ? (
              <PageEditor page={selectedPage} />
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <p className="text-gray-500 text-sm mb-4">Select a page to edit or create a new one</p>
                  <button
                    onClick={handleAddPage}
                    className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
