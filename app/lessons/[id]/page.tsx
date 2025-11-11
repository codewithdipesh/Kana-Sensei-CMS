"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, Menu, X, Plus, Trash2 } from "lucide-react"
import Sidebar from "@/components/sidebar"
import PageEditor from "@/components/page-editor"

interface PageItem {
  id: number
  order: number
  title: string
  type: "INFO" | "ANIMATION" | "PRACTICE" | "QUIZ"
  badge: string
}

export default function LessonDetailPage({ params }: { params: { id: string } }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPage, setSelectedPage] = useState<PageItem | null>(null)
  const [pages, setPages] = useState<PageItem[]>([
    { id: 1, order: 1, title: "Animation", type: "ANIMATION", badge: "Animation" },
    { id: 2, order: 2, title: "Practice-guided", type: "PRACTICE", badge: "Practice-guided" },
    { id: 3, order: 3, title: "Practice", type: "PRACTICE", badge: "Practice" },
    { id: 4, order: 4, title: "Illustration", type: "INFO", badge: "Illustration" },
  ])
  const [draggedPage, setDraggedPage] = useState<PageItem | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<number | null>(null)
  const [showChecklist, setShowChecklist] = useState(false)
  const [allFieldsValid, setAllFieldsValid] = useState(false)
  const [showEditorModal, setShowEditorModal] = useState(false)
  const DELETE_PASSWORD = "verify123"

  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0])
    }
  }, [pages, selectedPage])

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
    const baseCharacter = pages[0]?.title?.split("-")[0] || "New"
    const newType = "INFO"
    const newTitle = `${baseCharacter}-${newType.toLowerCase()}`

    const newPage: PageItem = {
      id: Math.max(...pages.map((p) => p.id), 0) + 1,
      order: pages.length + 1,
      title: newTitle,
      type: "INFO",
      badge: newTitle,
    }
    setPages([...pages, newPage])
    setSelectedPage(newPage)
  }

  const handleDragStart = (e: React.DragEvent, page: PageItem) => {
    setDraggedPage(page)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetPage: PageItem) => {
    e.preventDefault()
    if (!draggedPage || draggedPage.id === targetPage.id) return

    const draggedIndex = pages.findIndex((p) => p.id === draggedPage.id)
    const targetIndex = pages.findIndex((p) => p.id === targetPage.id)

    const newPages = [...pages]
    newPages.splice(draggedIndex, 1)
    newPages.splice(targetIndex, 0, draggedPage)
    newPages.forEach((p, i) => (p.order = i + 1))

    setPages(newPages)
    setDraggedPage(null)
  }

  const handleDeletePageClick = (id: number) => {
    setShowPasswordPrompt(id)
    setDeletePassword("")
  }

  const handleConfirmDelete = () => {
    if (deletePassword === DELETE_PASSWORD) {
      handleDeletePage(showPasswordPrompt!)
      setShowPasswordPrompt(null)
      setDeletePassword("")
    } else {
      alert("Incorrect password")
      setDeletePassword("")
    }
  }

  const handleDeletePage = (id: number) => {
    const filtered = pages.filter((p) => p.id !== id)
    setPages(filtered)
    if (selectedPage?.id === id) {
      setSelectedPage(filtered[0] || null)
    }
    setShowPasswordPrompt(null)
  }

  const handleSaveChanges = () => {
    const isValid = validatePageFields(selectedPage)
    setAllFieldsValid(isValid)
    if (isValid) {
      setShowChecklist(true)
    } else {
      alert("Please fill in all required fields in the editor")
    }
  }

  const validatePageFields = (page: PageItem | null) => {
    if (!page) return false
    return page.title && page.title.trim().length > 0
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
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Lesson Editor</h1>
                <p className="text-xs sm:text-sm text-gray-600">Vowels - ぁ・ぃ・ぅ・ぇ・ぉ</p>
              </div>
            </div>
            <button
              onClick={handleAddPage}
              className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Page
            </button>
          </div>
        </div>

        {/* Content Area - Responsive Grid */}
        <div className="flex-1 overflow-hidden">
          {/* Desktop: Side by side layout */}
          <div className="hidden lg:flex gap-4 p-3 sm:p-6 md:p-8 h-full overflow-hidden">
            {/* Left Panel */}
            <div className="w-72 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                <div ref={listRef} className="flex-1 overflow-y-auto">
                  {filteredPages.length > 0 ? (
                    <div className="space-y-2 p-3 sm:p-4">
                      {filteredPages.map((page) => (
                        <div
                          key={page.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, page)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, page)}
                          onClick={() => setSelectedPage(page)}
                          className={`p-3 rounded-lg cursor-move transition-all ${
                            selectedPage?.id === page.id
                              ? "bg-blue-50 border-2 border-blue-500"
                              : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                          } ${draggedPage?.id === page.id ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                  {page.order}
                                </span>
                                <span
                                  className={`text-xs font-semibold text-white px-2 py-1 rounded ${getPageTypeColor(page.type)}`}
                                >
                                  {page.type}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 mt-2 truncate">{page.title}</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePageClick(page.id)
                              }}
                              className="p-1.5 hover:bg-red-100 rounded transition-colors ml-auto"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-xs sm:text-sm">No pages found</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Page Editor */}
            <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
              {selectedPage ? (
                <PageEditor page={selectedPage} onSave={handleSaveChanges} />
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

          {/* Mobile: Pages list only, editor opens in modal */}
          <div className="lg:hidden p-3 sm:p-6 h-full overflow-hidden">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col overflow-hidden">
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
                  <div className="space-y-2 p-3 sm:p-4">
                    {filteredPages.map((page) => (
                      <div
                        key={page.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, page)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, page)}
                        onClick={() => {
                          setSelectedPage(page)
                          setShowEditorModal(true)
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          selectedPage?.id === page.id
                            ? "bg-blue-50 border-2 border-blue-500"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        } ${draggedPage?.id === page.id ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded">
                                {page.order}
                              </span>
                              <span
                                className={`text-xs font-semibold text-white px-2 py-1 rounded ${getPageTypeColor(page.type)}`}
                              >
                                {page.type}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 mt-2 truncate">{page.title}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePageClick(page.id)
                            }}
                            className="p-1.5 hover:bg-red-100 rounded transition-colors ml-auto"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-xs sm:text-sm">No pages found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Editor Modal for Mobile */}
      {showEditorModal && selectedPage && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-h-[90vh] overflow-hidden flex flex-col max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">{selectedPage.title}</h2>
              <button
                onClick={() => setShowEditorModal(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <PageEditor page={selectedPage} onSave={handleSaveChanges} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Delete</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the verification password to confirm deletion of this page.
            </p>
            <input
              type="password"
              placeholder="Enter password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              onKeyPress={(e) => e.key === "Enter" && handleConfirmDelete()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPasswordPrompt(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklist && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Save Checklist</h2>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">All page content is accurate</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">All media files are valid (SVG, audio)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">Page order is correct</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700">All required fields are filled</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowChecklist(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowChecklist(false)
                  alert("Lesson changes saved successfully!")
                }}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
