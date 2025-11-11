"use client"

import { useState } from "react"
import { Search, Menu, X, Plus, ChevronDown, ChevronUp } from "lucide-react"
import Sidebar from "@/components/sidebar"

const SAMPLE_CHAPTERS = [
  {
    id: "ch-001",
    name: "Chapter 1",
    description: "Basic Hiragana",
    scriptType: "hiragana",
    orderNumber: 1,
  },
  {
    id: "ch-002",
    name: "Chapter 2",
    description: "Advanced Hiragana",
    scriptType: "hiragana",
    orderNumber: 2,
  },
  {
    id: "ch-003",
    name: "Chapter 3",
    description: "Basic Katakana",
    scriptType: "katakana",
    orderNumber: 3,
  },
]

const SAMPLE_LESSONS = [
  {
    id: "l-001",
    title: "あ",
    romaji: "a",
    chapterId: "ch-001",
    orderNumber: 1,
  },
  {
    id: "l-002",
    title: "い",
    romaji: "i",
    chapterId: "ch-001",
    orderNumber: 2,
  },
  {
    id: "l-003",
    title: "う",
    romaji: "u",
    chapterId: "ch-001",
    orderNumber: 3,
  },
  {
    id: "l-004",
    title: "え",
    romaji: "e",
    chapterId: "ch-002",
    orderNumber: 1,
  },
]

export default function ChaptersListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [chapters, setChapters] = useState(SAMPLE_CHAPTERS)
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null) // Track expanded chapter
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingChapter, setEditingChapter] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<string | null>(null)
  const [savePassword, setSavePassword] = useState("")
  const [showSavePassword, setShowSavePassword] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const DELETE_PASSWORD = "verify123"

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scriptType: "",
    orderNumber: "",
  })

  const filteredChapters = chapters.filter(
    (chapter) =>
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chapter.id.includes(searchQuery) ||
      chapter.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getLessonsForChapter = (chapterId: string) => {
    return SAMPLE_LESSONS.filter((lesson) => lesson.chapterId === chapterId)
  }

  const handleOpenAddModal = () => {
    setEditingChapter(null)
    setFormData({
      name: "",
      description: "",
      scriptType: "",
      orderNumber: "",
    })
    setShowAddModal(true)
  }

  const handleEditChapter = (chapter: any) => {
    setEditingChapter(chapter)
    setFormData(chapter)
    setShowEditConfirm(true)
  }

  const handleSave = () => {
    const requiredFields = {
      name: formData.name?.trim(),
      scriptType: formData.scriptType?.trim(),
      orderNumber: formData.orderNumber?.toString().trim(),
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(", ")}`)
      return
    }

    setShowSavePassword(true)
    setShowAddModal(false)
  }

  const handleConfirmSave = () => {
    if (savePassword === DELETE_PASSWORD) {
      if (editingChapter) {
        setChapters(chapters.map((c) => (c.id === editingChapter.id ? { ...formData, id: editingChapter.id } : c)))
      } else {
        setChapters([...chapters, { ...formData, id: `ch-${Date.now()}` }])
      }
      setShowSavePassword(false)
      setSavePassword("")
      alert(`Chapter ${editingChapter ? "updated" : "created"} successfully!`)
    } else {
      alert("Incorrect password")
      setSavePassword("")
    }
  }

  const handleDeleteClick = (id: string) => {
    setShowPasswordPrompt(id)
    setDeletePassword("")
  }

  const handleConfirmDelete = () => {
    if (deletePassword === DELETE_PASSWORD) {
      handleDelete(showPasswordPrompt!)
      setShowPasswordPrompt(null)
      setDeletePassword("")
    } else {
      alert("Incorrect password")
      setDeletePassword("")
    }
  }

  const handleDelete = (id: string) => {
    setChapters(chapters.filter((c) => c.id !== id))
    setShowPasswordPrompt(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 hidden lg:flex flex-col">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`fixed left-0 top-0 h-screen w-64 lg:hidden transition-transform duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 md:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Chapters</h1>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Chapter
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search by Name, ID or Description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredChapters.map((chapter) => (
                <div key={chapter.id}>
                  <div className="px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => setExpandedChapterId(expandedChapterId === chapter.id ? null : chapter.id)}
                          className="mt-1 sm:mt-0 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                        >
                          {expandedChapterId === chapter.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
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
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditChapter(chapter)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(chapter.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedChapterId === chapter.id && (
                    <div className="bg-gray-50 border-t border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
                      <div className="ml-6 sm:ml-10">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3">
                          Lessons in this chapter:
                        </h4>
                        <div className="space-y-2">
                          {getLessonsForChapter(chapter.id).length > 0 ? (
                            getLessonsForChapter(chapter.id).map((lesson) => (
                              <div
                                key={lesson.id}
                                className="text-xs sm:text-sm p-2 bg-white rounded border border-gray-200"
                              >
                                <div className="font-medium text-gray-900">
                                  {lesson.title} ({lesson.romaji})
                                </div>
                                <div className="text-gray-500">ID: {lesson.id}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs sm:text-sm text-gray-500 italic">
                              No lessons in this chapter yet
                            </div>
                          )}
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

      {/* Edit Confirmation Modal */}
      {showEditConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Edit Chapter</h2>
            <p className="text-gray-600 mb-4 text-sm">Are you sure you want to edit this chapter?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEditConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEditConfirm(false)
                  setShowAddModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingChapter ? "Edit Chapter" : "Add New Chapter"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Basic Hiragana"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Script Type *</label>
                <select
                  value={formData.scriptType}
                  onChange={(e) => setFormData({ ...formData, scriptType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select script type</option>
                  <option value="hiragana">Hiragana</option>
                  <option value="katakana">Katakana</option>
                  <option value="kanji">Kanji</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Order Number *</label>
                <input
                  type="number"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Password Verification */}
      {showSavePassword && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Save</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the verification password to confirm {editingChapter ? "editing" : "adding"} this chapter.
            </p>
            <input
              type="password"
              placeholder="Enter password"
              value={savePassword}
              onChange={(e) => setSavePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              onKeyPress={(e) => e.key === "Enter" && handleConfirmSave()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSavePassword(false)
                  setSavePassword("")
                  setShowAddModal(true)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Password Verification */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Delete</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the verification password to confirm deletion of this chapter.
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
    </div>
  )
}
