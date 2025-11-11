"use client"

import React from "react"

import { useState } from "react"
import { X } from "lucide-react"

interface Character {
  id: string
  character: string
  romaji: string
  kana_type: string
  svgUrl: string
  audioUrl: string
  example_word: string
  notes: string
}

interface AddCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  editingCharacter: Character | null
}

export default function AddCharacterModal({ isOpen, onClose, editingCharacter }: AddCharacterModalProps) {
  const [formData, setFormData] = useState<Character>(
    editingCharacter || {
      id: "",
      character: "",
      romaji: "",
      kana_type: "Hiragana",
      svgUrl: "",
      audioUrl: "",
      example_word: "",
      notes: "",
    },
  )

  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState<"add" | "edit">("add")

  // Update form when editingCharacter changes
  React.useEffect(() => {
    if (editingCharacter) {
      setFormData(editingCharacter)
      setAction("edit")
    } else {
      setFormData({
        id: "",
        character: "",
        romaji: "",
        kana_type: "Hiragana",
        svgUrl: "",
        audioUrl: "",
        example_word: "",
        notes: "",
      })
      setAction("add")
    }
  }, [editingCharacter, isOpen])

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    const requiredFields = ["character", "romaji", "kana_type", "svgUrl", "audioUrl"]
    const isEmpty = requiredFields.some((field) => !formData[field as keyof Character]?.toString().trim())

    if (isEmpty) {
      alert("Please fill all required fields (marked with *)")
      return
    }

    setShowConfirm(true)
  }

  const handleConfirm = () => {
    // Here you would send the data to your backend
    console.log(`${action === "add" ? "Adding" : "Editing"} character:`, formData)
    setShowConfirm(false)
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {action === "add" ? "Add New Character" : "Edit Character"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">character (japanese)*</label>
              <input
                type="text"
                name="character"
                value={formData.character}
                onChange={handleInputChange}
                placeholder="e.g. あ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">romaji *</label>
              <input
                type="text"
                name="romaji"
                value={formData.romaji}
                onChange={handleInputChange}
                placeholder="e.g. a"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">kana_type*</label>
              <select
                name="kana_type"
                value={formData.kana_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="Hiragana">Hiragana</option>
                <option value="Katakana">Katakana</option>
                <option value="Kanji">Kanji</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">svgUrl*</label>
              <input
                type="text"
                name="svgUrl"
                value={formData.svgUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/svg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">audioUrl*</label>
              <input
                type="text"
                name="audioUrl"
                value={formData.audioUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/audio"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">example_word</label>
              <input
                type="text"
                name="example_word"
                value={formData.example_word}
                onChange={handleInputChange}
                placeholder="e.g. 赤い"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add notes..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
              please recheck the svg and audio before adding
            </p>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-900 text-white py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              {action === "add"
                ? "Are you sure you want to add this character?"
                : "Are you sure you want to edit this character?"}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
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
