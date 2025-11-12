"use client"

import { useEffect, useState } from "react"
import { Search, Menu, X, Plus } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/sidebar"
import AddLessonModal from "@/components/add-lesson-modal"
import { subscribeCollection, addDocument, deleteDocument, setDocument, swapOrder } from "@/lib/firebase"

export default function LessonsListPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [lessons, setLessons] = useState([])
  const [editingLesson, setEditingLesson] = useState(null)
  const [formData, setFormData] = useState({ title: "", orderNumber: 0, chapterId: "", shortDescription: "" })
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const unsub = subscribeCollection("lessons", (docs) => setLessons(docs), { orderBy: { field: "orderNumber", direction: "asc" } })
    return () => unsub()
  }, [])

  const handleOpenAddModal = () => {
    setEditingLesson(null)
    setFormData({ title: "", orderNumber: lessons.length + 1, chapterId: "", shortDescription: "" })
    setIsModalOpen(true)
  }
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson)
    setFormData({ ...lesson })
    setIsModalOpen(true)
  }
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLesson(null)
   }
  const handleSave = async () => {
    if (!formData.title || !formData.chapterId) {
      alert("Please fill required fields")
      return
    }
    try {
      if (editingLesson) {
        await setDocument("lessons", editingLesson.id, { ...formData, updatedAt: new Date().toISOString() })
      } else {
        await addDocument("lessons", { ...formData, createdAt: new Date().toISOString() })
      }
      setEditingLesson(null)
    } catch (err) {
      console.error(err)
      alert("Save failed")
    }
  }

  const handleDelete = async (id) => {
    await deleteDocument("lessons", id)
  }

  const moveUp = async (id) => {
    const idx = lessons.findIndex((l) => l.id === id)
    if (idx > 0) await swapOrder("lessons", id, lessons[idx - 1].id, "orderNumber")
  }

  const moveDown = async (id) => {
    const idx = lessons.findIndex((l) => l.id === id)
    if (idx < lessons.length - 1) await swapOrder("lessons", id, lessons[idx + 1].id, "orderNumber")
  }

  const filtered = lessons.filter((l) => {
    const q = searchQuery.toLowerCase()
    return !q || l.title?.toLowerCase().includes(q) || String(l.id).includes(q) || String(l.orderNumber).includes(q)
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-gray-900 lg:flex flex-col">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 lg:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}
      <div
        className={`fixed left-0 top-0 h-screen w-64 lg:hidden transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
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
            <div className="flex gap-2">
              <button
                 onClick={handleOpenAddModal}
                 className="bg-black text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
              <Plus className="w-4 h-4" />
              Add Lesson
              </button>

            </div>
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
                {filtered.map((lesson) => (
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
                            <span>Chapter: {lesson.chapterId}</span>
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
                          onClick={() => handleDelete(lesson.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-600 transition-colors"
                        >
                          delete
                        </button>
                        <button onClick={() => moveUp(lesson.id)} className="px-2 py-1 border rounded">↑</button>
                        <button onClick={() => moveDown(lesson.id)} className="px-2 py-1 border rounded">↓</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <AddLessonModal
       isOpen={isModalOpen}
       onClose={handleCloseModal}
       editingLesson={editingLesson}
      />

    </div>
  )
}
