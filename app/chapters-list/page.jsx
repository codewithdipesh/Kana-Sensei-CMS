"use client"

import { useEffect, useState } from "react"
import { Search, Menu, X, Plus, ChevronDown, ChevronUp } from "lucide-react"
import Sidebar from "@/components/sidebar"
import { subscribeCollection, addDocument, setDocument, deleteDocument, swapOrder } from "@/lib/firebase"

export default function ChaptersListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [chapters, setChapters] = useState([])
  const [expandedChapterId, setExpandedChapterId] = useState(null)
  const [editingChapter, setEditingChapter] = useState(null)
  const [formData, setFormData] = useState({ name: "", description: "", scriptType: "", orderNumber: 0 })

  useEffect(() => {
    const unsub = subscribeCollection("chapters", (docs) => setChapters(docs), { orderBy: { field: "orderNumber", direction: "asc" } })
    return () => unsub()
  }, [])

  const handleOpenAddModal = () => {
    setEditingChapter(null)
    setFormData({ name: "", description: "", scriptType: "", orderNumber: chapters.length + 1 })
  }

  const handleSave = async () => {
    try {
      if (editingChapter) {
        await setDocument("chapters", editingChapter.id, { ...formData, updatedAt: new Date().toISOString() })
      } else {
        await addDocument("chapters", { ...formData, createdAt: new Date().toISOString() })
      }
    } catch (err) {
      console.error(err)
      alert("Save failed")
    }
  }

  const handleDelete = async (id) => {
    await deleteDocument("chapters", id)
  }

  const moveUp = async (id) => {
    const idx = chapters.findIndex((c) => c.id === id)
    if (idx > 0) await swapOrder("chapters", id, chapters[idx - 1].id, "orderNumber")
  }

  const moveDown = async (id) => {
    const idx = chapters.findIndex((c) => c.id === id)
    if (idx < chapters.length - 1) await swapOrder("chapters", id, chapters[idx + 1].id, "orderNumber")
  }

  const filteredChapters = chapters.filter((chapter) => {
    const q = searchQuery.toLowerCase()
    return !q || chapter.name?.toLowerCase().includes(q) || String(chapter.id).includes(q) || chapter.description?.toLowerCase().includes(q)
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 lg:flex flex-col">
        <Sidebar />
      </div>
 
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`fixed left-0 top-0 h-screen w-64 lg:hidden transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Chapters</h1>
            </div>
            <button onClick={handleOpenAddModal} className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Add Chapter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <input type="text" placeholder="Search by Name, ID or Description" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredChapters.map((chapter) => (
                <div key={chapter.id}>
                  <div className="px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <button onClick={() => setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)} className="mt-1 sm:mt-0 p-1 hover:bg-gray-200 rounded transition-colors shrink-0">
                          {expandedChapterId === chapter.id ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1">
                            <div className="font-semibold text-gray-900">{chapter.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600">{chapter.description}</div>
                            <div className="flex gap-2 flex-wrap text-xs text-gray-500">
                              <span>ID: {chapter.id}</span>
                              <span>Type: {chapter.scriptType}</span>
                              <span>Order: {chapter.orderNumber}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditingChapter(chapter); setFormData({ ...chapter }) }} className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors">edit</button>
                        <button onClick={() => handleDelete(chapter.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors">delete</button>
                        <button onClick={() => moveUp(chapter.id)} className="px-2 py-1 border rounded">↑</button>
                        <button onClick={() => moveDown(chapter.id)} className="px-2 py-1 border rounded">↓</button>
                      </div>
                    </div>
                  </div>

                  {expandedChapterId === chapter.id && (
                    <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
                      <div className="ml-6 sm:ml-10">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">Lessons in this chapter:</h4>
                        <div className="space-y-2">
                          <div className="text-xs sm:text-sm text-gray-500 italic">No lessons loaded here</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
