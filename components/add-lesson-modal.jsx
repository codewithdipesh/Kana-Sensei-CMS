"use client"

import { useState, useEffect } from "react"
import { addDocument, updateDocument } from "@/lib/firebase"

export default function AddLessonModal({ isOpen, onClose, editingLesson, chapters = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    orderNumber: "",
    chapterId: "",
    shortDescription: "",
    expandedTitle: "",
    detailedDescription: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // populate form when editing
  useEffect(() => {
    if (editingLesson) {
      setFormData({
        title: editingLesson.title || "",
        orderNumber: editingLesson.orderNumber || "",
        chapterId: editingLesson.chapterId || "",
        shortDescription: editingLesson.shortDescription || "",
        expandedTitle: editingLesson.expandedTitle || "",
        detailedDescription: editingLesson.detailedDescription || "",
      })
    } else {
      setFormData({
        title: "",
        orderNumber: "",
        chapterId: "",
        shortDescription: "",
        expandedTitle: "",
        detailedDescription: "",
      })
    }
  }, [editingLesson])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!formData.title || !formData.orderNumber || !formData.chapterId) {
      alert("Please fill in Title, Order Number, and Chapter.")
      return
    }

    setIsSaving(true)
    try {
      if (editingLesson) {
        await updateDocument("lessons", editingLesson.id, {
          ...formData,
          orderNumber: Number(formData.orderNumber),
          updatedAt: new Date().toISOString(),
        })
      } else {
        await addDocument("lessons", {
          ...formData,
          orderNumber: Number(formData.orderNumber),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to save lesson.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingLesson ? "Edit Lesson" : "Add New Lesson"}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Title *</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Order Number *</label>
            <input
              name="orderNumber"
              type="number"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Chapter *</label>
            <select
              name="chapterId"
              value={formData.chapterId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="">Select a Chapter</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>
          {[
            { label: "Short Description", name: "shortDescription", type: "text" },
            { label: "Expanded Title", name: "expandedTitle", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-900 mb-1">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Detailed Description</label>
            <textarea
              name="detailedDescription"
              value={formData.detailedDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
