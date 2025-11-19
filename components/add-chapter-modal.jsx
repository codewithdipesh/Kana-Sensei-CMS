"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

export default function AddChapterModal({ isOpen, onClose, editingChapter, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scriptType: "Hiragana",
    orderNumber: 1
  })

  const [action, setAction] = useState("add")
  const [showConfirm, setShowConfirm] = useState(false)

  // ---- SETUP FOR EDIT / ADD ----
  useEffect(() => {
    if (editingChapter) {
      setFormData({
        name: editingChapter.name || "",
        description: editingChapter.description || "",
        scriptType: editingChapter.scriptType || "Hiragana",
        orderNumber: editingChapter.orderNumber || 1
      })
      setAction("edit")
    } else {
      setFormData({
        name: "",
        description: "",
        scriptType: "Hiragana",
        orderNumber: 1
      })
      setAction("add")
    }
  }, [editingChapter, isOpen])

  if (!isOpen) return null

  // ---- HANDLE INPUT ----
  const handleInput = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "orderNumber" ? Number(value) : value
    }))
  }

  // ---- VALIDATION ----
  const validate = () => {
    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.scriptType.trim() ||
      !formData.orderNumber
    ) {
      alert("Please fill all required fields.")
      return false
    }
    return true
  }

  // ---- SUBMIT ----
  const handleSubmit = () => {
    if (!validate()) return
    setShowConfirm(true)
  }

  const confirmAction = () => {
    onSave(formData, action)
    setShowConfirm(false)
    onClose()
  }

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* MAIN MODAL */}
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              {action === "add" ? "Add New Chapter" : "Edit Chapter"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-4">
            
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInput}
                placeholder="e.g. Hiragana Basics"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInput}
                rows={3}
                placeholder="Chapter description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* SCRIPT TYPE */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Script Type *</label>
              <select
                name="scriptType"
                value={formData.scriptType}
                onChange={handleInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="Hiragana">Hiragana</option>
                <option value="Katakana">Katakana</option>
                <option value="Kanji">Kanji</option>
              </select>
            </div>

            {/* ORDER NUMBER */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Order Number *</label>
              <input
                type="number"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInput}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="1"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-800"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              {action === "add"
                ? "Add this chapter?"
                : "Save changes to this chapter?"}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
