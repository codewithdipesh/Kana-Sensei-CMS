"use client"

import { useState, useEffect, useRef } from "react"
import { Save, ChevronDown, X, Volume2 } from "lucide-react"
import { updateDocument } from "@/lib/firebase"
import KanaSearchSelect from "@/components/kana-search-select"

const PAGE_TYPES = ["INFO", "LISTEN", "STROKE", "TRACE", "WRITE", "QUIZ"]

// Map legacy types saved before the redesign so old data keeps working.
export function normalizePageType(type) {
  if (type === "ANIMATION") return "STROKE"
  if (type === "PRACTICE") return "TRACE"
  if (!type) return "INFO"
  return type
}

export function getPageTypeColor(type) {
  switch (normalizePageType(type)) {
    case "INFO": return "bg-blue-500"
    case "LISTEN": return "bg-pink-500"
    case "STROKE": return "bg-purple-500"
    case "TRACE": return "bg-green-500"
    case "WRITE": return "bg-emerald-600"
    case "QUIZ": return "bg-yellow-500"
    default: return "bg-gray-500"
  }
}

const ringForType = (type) => {
  switch (normalizePageType(type)) {
    case "LISTEN": return "focus:ring-pink-500"
    case "STROKE": return "focus:ring-purple-500"
    case "TRACE": return "focus:ring-green-500"
    case "WRITE": return "focus:ring-emerald-600"
    case "QUIZ": return "focus:ring-yellow-500"
    default: return "focus:ring-blue-500"
  }
}

export default function PageEditor({ page, onSave, characters = [], lessonId }) {
  const [pageType, setPageType] = useState(normalizePageType(page.type))
  const [formData, setFormData] = useState({
    title: page.title || "",
    content: page.content || "",
    kanaSelect: page.kanaId || "",
    hintText: page.hintText || "",
    autoPlay: page.autoPlay || false,
    showGuide: page.showGuide ?? (normalizePageType(page.type) === "TRACE"),
    question: page.question || "",
    options: page.options || ["", "", "", ""],
    correctOption: page.correctOption || 0,
  })
  const audioRef = useRef(null)

  const selectedKana = characters.find((c) => c.id === formData.kanaSelect)

  useEffect(() => {
    const normalized = normalizePageType(page.type)
    setPageType(normalized)
    setFormData({
      title: page.title || "",
      content: page.content || "",
      kanaSelect: page.kanaId || "",
      hintText: page.hintText || "",
      autoPlay: page.autoPlay || false,
      showGuide: page.showGuide ?? (normalized === "TRACE"),
      question: page.question || "",
      options: page.options || ["", "", "", ""],
      correctOption: page.correctOption || 0,
    })
  }, [page.id])

  // Keep showGuide consistent when the user flips between TRACE and WRITE in the dropdown.
  useEffect(() => {
    if (pageType === "TRACE") setFormData((p) => ({ ...p, showGuide: true }))
    if (pageType === "WRITE") setFormData((p) => ({ ...p, showGuide: false }))
  }, [pageType])

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

  const handleSave = async () => {
    const errors = []
    if (!formData.title.trim()) errors.push("Page title is required")
    if (["LISTEN", "STROKE", "TRACE", "WRITE"].includes(pageType) && !formData.kanaSelect) {
      errors.push("Select Kana is required")
    }
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
    if (confirmSave) {
      try {
        await updateDocument(`lessons/${lessonId}/pages`, page.id, {
          title: formData.title,
          type: pageType,
          badge: formData.title,
          content: formData.content,
          kanaId: formData.kanaSelect,
          autoPlay: formData.autoPlay,
          hintText: formData.hintText,
          showGuide: formData.showGuide,
          question: formData.question,
          options: formData.options,
          correctOption: formData.correctOption,
          updatedAt: new Date().toISOString(),
        })
        alert("Page saved successfully!")
        if (onSave) onSave()
      } catch (err) {
        console.error("Failed to save page:", err)
        alert("Failed to save page")
      }
    }
  }

  const playAudio = () => {
    if (selectedKana?.audioUrl) {
      if (audioRef.current) audioRef.current.pause()
      audioRef.current = new Audio(selectedKana.audioUrl)
      audioRef.current.play()
    }
  }

  const KanaSelect = ({ ringClass }) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">Select Kana</label>
      <KanaSearchSelect
        characters={characters}
        value={formData.kanaSelect}
        onChange={(id) => handleInputChange("kanaSelect", id)}
        ringClass={ringClass}
      />
    </div>
  )

  const TitleInput = ({ ringClass }) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
      <input type="text" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ringClass}`} placeholder="Page title" />
    </div>
  )

  const KanaPreview = ({ accent, showStrokeSvg }) => (
    <div className="bg-gray-100 rounded-lg p-6 text-center">
      <p className="text-4xl font-bold text-gray-900 mb-4">{selectedKana?.character || "Select a kana"}</p>
      {showStrokeSvg && (
        <div className="w-full h-48 bg-white rounded border border-gray-300 flex items-center justify-center overflow-hidden">
          {selectedKana?.svgUrl ? (
            <img src={selectedKana.svgUrl} alt={`${selectedKana.character} stroke order`} className="max-w-full max-h-full object-contain" />
          ) : (
            <p className="text-gray-500 text-sm">SVG Preview - Select a kana to preview</p>
          )}
        </div>
      )}
      <button
        onClick={playAudio}
        disabled={!selectedKana?.audioUrl}
        className={`mt-4 ${accent} text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 mx-auto disabled:bg-gray-300 disabled:cursor-not-allowed`}
      >
        <Volume2 className="w-4 h-4" />
        Play Audio
      </button>
      {selectedKana && (
        <div className="mt-4 text-sm text-gray-600">
          <p><span className="font-semibold">Romaji:</span> {selectedKana.romaji}</p>
          {selectedKana.example_word && <p><span className="font-semibold">Example:</span> {selectedKana.example_word}</p>}
        </div>
      )}
    </div>
  )

  const PracticeCanvasPreview = ({ accent }) => (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-900">Preview</p>
      <div className="relative w-full h-48 bg-white rounded border border-gray-300 flex items-center justify-center overflow-hidden">
        {formData.showGuide && selectedKana?.svgUrl ? (
          <img src={selectedKana.svgUrl} alt="Stroke guide" className="max-w-full max-h-full object-contain opacity-25" />
        ) : (
          <span className="text-gray-300 text-sm">{formData.showGuide ? "Stroke guide will appear here" : "Blank canvas (no guide)"}</span>
        )}
        <p className="absolute text-5xl font-bold text-gray-900 pointer-events-none">{formData.showGuide ? "" : ""}</p>
      </div>
      {selectedKana && (
        <div className="text-sm space-y-1">
          <p><span className="font-semibold">Target:</span> {selectedKana.character} ({selectedKana.romaji})</p>
        </div>
      )}
      {formData.hintText && (
        <p className="text-xs text-gray-600 italic">Hint: {formData.hintText}</p>
      )}
      {selectedKana?.audioUrl && (
        <button onClick={playAudio} className={`mt-2 ${accent} text-white px-3 py-1 rounded text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 mx-auto`}>
          <Volume2 className="w-4 h-4" />
          Play Audio
        </button>
      )}
    </div>
  )

  const renderPageTypeEditor = () => {
    const ring = ringForType(pageType)
    switch (pageType) {
      case "INFO":
        return (
          <div className="space-y-4">
            <TitleInput ringClass={ring} />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Content</label>
              <textarea value={formData.content} onChange={(e) => handleInputChange("content", e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring} h-32 resize-none`} placeholder="Rich text content" />
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

      case "LISTEN":
        return (
          <div className="space-y-4">
            <TitleInput ringClass={ring} />
            <KanaSelect ringClass={ring} />
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={formData.autoPlay} onChange={(e) => handleInputChange("autoPlay", e.target.checked)} className="w-4 h-4 rounded" id="autoplay-listen" />
              <label htmlFor="autoplay-listen" className="text-sm font-medium text-gray-900">Auto Play Audio on Open</label>
            </div>
            <KanaPreview accent="bg-pink-500" showStrokeSvg={false} />
          </div>
        )

      case "STROKE":
        return (
          <div className="space-y-4">
            <TitleInput ringClass={ring} />
            <KanaSelect ringClass={ring} />
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={formData.autoPlay} onChange={(e) => handleInputChange("autoPlay", e.target.checked)} className="w-4 h-4 rounded" id="autoplay-stroke" />
              <label htmlFor="autoplay-stroke" className="text-sm font-medium text-gray-900">Auto Play Animation</label>
            </div>
            <KanaPreview accent="bg-purple-500" showStrokeSvg={true} />
          </div>
        )

      case "TRACE":
      case "WRITE":
        return (
          <div className="space-y-4">
            <TitleInput ringClass={ring} />
            <KanaSelect ringClass={ring} />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Hint Text (Optional)</label>
              <input type="text" value={formData.hintText} onChange={(e) => handleInputChange("hintText", e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`} placeholder="Hint for the user" />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showGuide}
                onChange={(e) => handleInputChange("showGuide", e.target.checked)}
                className="w-4 h-4 rounded"
                id="show-guide"
              />
              <label htmlFor="show-guide" className="text-sm font-medium text-gray-900">
                Show stroke guide {pageType === "TRACE" ? "(recommended for Trace)" : "(off for Write)"}
              </label>
            </div>
            <PracticeCanvasPreview accent={pageType === "TRACE" ? "bg-green-500" : "bg-emerald-600"} />
          </div>
        )

      case "QUIZ":
        return (
          <div className="space-y-4">
            <TitleInput ringClass={ring} />
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Question</label>
              <input type="text" value={formData.question} onChange={(e) => handleInputChange("question", e.target.value)} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`} placeholder="Quiz question" />
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Option {index + 1}</label>
                  <input type="text" value={option} onChange={(e) => { const newOptions = [...formData.options]; newOptions[index] = e.target.value; handleInputChange("options", newOptions) }} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`} placeholder={`Enter option ${index + 1}`} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Correct Option</label>
              <select value={formData.correctOption} onChange={(e) => handleInputChange("correctOption", Number.parseInt(e.target.value))} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}>
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
              {PAGE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
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
