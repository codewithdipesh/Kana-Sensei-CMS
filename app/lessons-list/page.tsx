"use client"

import { useState } from "react"
import { Search, Menu, X, Plus } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/sidebar"

const SAMPLE_LESSONS = [
  {
    id: "1898498",
    title: "Vowels",
    orderNumber: 1,
    characterId: "1898498",
    shortDescription: "ぁ・ぃ・ぅ・ぇ・ぉ",
    expandedTitle: "Hiragana a i u e o",
    detailedDescription: "Learn to write the first 5 vowels",
  },
  {
    id: "1898499",
    title: "Consonants",
    orderNumber: 2,
    characterId: "1898499",
    shortDescription: "か・き・く・け・こ",
    expandedTitle: "Hiragana K-series",
    detailedDescription: "Master the K-row consonants",
  },
]

const SAMPLE_CHAPTERS = [
  { id: "ch-001", name: "Chapter 1", description: "Basic Hiragana" },
  { id: "ch-002", name: "Chapter 2", description: "Advanced Hiragana" },
  { id: "ch-003", name: "Chapter 3", description: "Basic Katakana" },
]

export default function LessonsListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [lessons, setLessons] = useState(SAMPLE_LESSONS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<string | null>(null)
  const [savePassword, setSavePassword] = useState("")
  const [showSavePassword, setShowSavePassword] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const DELETE_PASSWORD = "verify123" // Simple verification (can be enhanced)

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.id.includes(searchQuery) ||
      lesson.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleOpenAddModal = () => {
    setEditingLesson(null)
    setFormData({
      title: "",
      orderNumber: "",
      chapterId: "",
      shortDescription: "",
      expandedTitle: "",
      detailedDescription: "",
    })
    setShowAddModal(true)
  }

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson)
    setFormData(lesson)
    setShowEditConfirm(true)
  }

  const handleSave = () => {
    const requiredFields = {
      title: formData.title?.trim(),
      orderNumber: formData.orderNumber?.toString().trim(),
      chapterId: formData.chapterId?.toString().trim(),
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(", ")}`)
      return
    }

    if (editingLesson) {
      setShowSavePassword(true)
      setShowAddModal(false)
    } else {
      setShowSavePassword(true)
      setShowAddModal(false)
    }
  }

  const handleConfirmSave = () => {
    if (savePassword === DELETE_PASSWORD) {
      if (editingLesson) {
        setLessons(lessons.map((l) => (l.id === editingLesson.id ? { ...formData, id: editingLesson.id } : l)))
      } else {
        setLessons([...lessons, { ...formData, id: Date.now().toString() }])
      }
      setShowSavePassword(false)
      setSavePassword("")
      alert("Lesson saved successfully!")
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
    setLessons(lessons.filter((l) => l.id !== id))
    setShowPasswordPrompt(null)
  }

  const [formData, setFormData] = useState({
    title: "",
    orderNumber: "",
    chapterId: "",
    shortDescription: "",
    expandedTitle: "",
    detailedDescription: "",
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-20 md:w-64 bg-gray-900 hidden lg:flex flex-col">
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
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Lessons</h1>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Lesson
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search by Title, ID or Description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="divide-y divide-gray-200">
                {filteredLessons.map((lesson) => (
                  <div key={lesson.id} className="px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-1">
                          <Link href={`/lessons/${lesson.id}`} className="font-semibold text-blue-600 hover:underline">
                            {lesson.title}
                          </Link>
                          <div className="text-xs sm:text-sm text-gray-600">{lesson.shortDescription}</div>
                          <div className="flex gap-2 flex-wrap text-xs text-gray-500">
                            <span>ID: {lesson.id}</span>
                            <span>Order: {lesson.orderNumber}</span>
                            <span>Chapter: {lesson.characterId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                          edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(lesson.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                        >
                          delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showEditConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Edit Lesson</h2>
            <p className="text-gray-600 mb-4 text-sm">Are you sure you want to edit this lesson?</p>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
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
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Chapter *</label>
                <select
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select a chapter</option>
                  {SAMPLE_CHAPTERS.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name} - {chapter.description}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Expanded Title</label>
                <input
                  type="text"
                  value={formData.expandedTitle}
                  onChange={(e) => setFormData({ ...formData, expandedTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Detailed Description</label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none"
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

      {showSavePassword && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Save</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the verification password to confirm {editingLesson ? "editing" : "adding"} this lesson.
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

      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Delete</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the verification password to confirm deletion of this lesson.
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
