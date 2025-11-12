"use client"

import { useState } from "react"
import { Save, ChevronDown, X } from "lucide-react"

export default function PageEditor({ page, onSave }) {
  const [pageType, setPageType] = useState(page.type || "INFO")
  const [formData, setFormData] = useState({
    title: page.title || "",
    content: "",
    kanaSelect: "",
    hintText: "",
    autoPlay: false,
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [validationErrors, setValidationErrors] = useState([])

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    const errors = []
    if (!formData.title.trim()) errors.push("Page title is required")
    if ((pageType === "ANIMATION" || pageType === "PRACTICE") && !formData.kanaSelect) errors.push("Select Kana is required")
    if (pageType === "QUIZ") {
      if (!formData.question.trim()) errors.push("Question is required for quizzes")
      if (formData.options.some((opt) => !opt.trim())) errors.push("All quiz options must be filled")
    }
    if (errors.length > 0) {
      setValidationErrors(errors)
      alert(`Please fix these errors:\n${errors.join("\n")}`)
      return
    }
    setValidationErrors([])
    const confirmSave = confirm("Checklist:\n✓ All required fields are filled\n✓ Page type is correct\n✓ All content is accurate\n\nProceed with saving changes?")
    if (confirmSave && onSave) onSave()
  }

  const getPageTypeColor = (type) => {
    switch (type) {
      case "INFO": return "bg-blue-500"
      case "ANIMATION": return "bg-purple-500"
      case "PRACTICE": return "bg-green-500"
      case "QUIZ": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const renderPageTypeEditor = () => {
    switch (pageType) {
      case "INFO":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
              <input type="text" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Page title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
              <textarea value={formData.content} onChange={(e) => handleInputChange("content", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none" placeholder="Rich text content" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {imagePreview && (
                <div className="mt-4 relative inline-block">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-40 rounded-lg object-cover" />
                  <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors" type="button">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case "ANIMATION":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Kana</label>
              <select value={formData.kanaSelect} onChange={(e) => handleInputChange("kanaSelect", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Choose a kana...</option>
                <option>あ (a)</option>
                <option>い (i)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={formData.autoPlay} onChange={(e) => handleInputChange("autoPlay", e.target.checked)} className="w-4 h-4 rounded" />
              <label className="text-sm font-medium text-gray-900">Auto Play Animation</label>
            </div>
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <p className="text-4xl font-bold text-gray-900 mb-4">あ</p>
              <div className="w-full h-32 bg-white rounded border border-gray-300 flex items-center justify-center">
                <p className="text-gray-500 text-sm">SVG Preview</p>
              </div>
              <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-600 transition-colors">▶ Play Audio</button>
            </div>
          </div>
        )

      case "PRACTICE":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Kana</label>
              <select value={formData.kanaSelect} onChange={(e) => handleInputChange("kanaSelect", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>Choose a kana...</option>
                <option>あ (a)</option>
                <option>い (i)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Hint Text (Optional)</label>
              <input type="text" value={formData.hintText} onChange={(e) => handleInputChange("hintText", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Hint for the user" />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-900">Preview</p>
              <p className="text-3xl font-bold text-center">あ</p>
              <div className="text-sm space-y-1">
                <p><span className="font-semibold">Romaji:</span> a</p>
                <p><span className="font-semibold">Example:</span> Apple</p>
              </div>
            </div>
          </div>
        )

      case "QUIZ":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Question</label>
              <input type="text" value={formData.question} onChange={(e) => handleInputChange("question", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="Quiz question" />
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Option {index + 1}</label>
                  <input type="text" value={option} onChange={(e) => { const newOptions = [...formData.options]; newOptions[index] = e.target.value; handleInputChange("options", newOptions) }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder={`Enter option ${index + 1}`} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Correct Option</label>
              <select value={formData.correctOption} onChange={(e) => handleInputChange("correctOption", Number.parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                {formData.options.map((_, index) => <option key={index} value={index}>Option {index + 1}</option>)}
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-gray-200 p-4 sm:p-6 bg-gray-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{page.title}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Type: {pageType}</p>
          </div>
          <div className="relative">
            <select value={pageType} onChange={(e) => setPageType(e.target.value)} className={`appearance-none px-3 py-2 pr-8 text-xs sm:text-sm font-semibold text-white rounded focus:outline-none focus:ring-2 cursor-pointer ${getPageTypeColor(pageType)} hover:opacity-90`}>
              <option value="INFO">INFO</option>
              <option value="ANIMATION">ANIMATION</option>
              <option value="PRACTICE">PRACTICE</option>
              <option value="QUIZ">QUIZ</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-white pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">{renderPageTypeEditor()}</div>

      <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
        <button onClick={handleSave} className="w-full bg-blue-500 text-white px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  )
}
