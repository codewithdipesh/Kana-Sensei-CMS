"use client"

import { useState, useEffect, useRef } from "react"
import { Save, ChevronDown, X, Volume2 } from "lucide-react"
import { updateDocument } from "@/lib/firebase"
import KanaSearchSelect from "@/components/kana-search-select"
import {
  applyQuizPreset,
  createDefaultQuizConfig,
  deriveQuizConfigFromPage,
  mergeQuizConfig,
  QUIZ_KINDS,
  QUIZ_PRESETS,
  QUIZ_RESPONSE_MODES,
  QUIZ_SCOPES,
  QUIZ_SOURCE_MODES,
  QUIZ_TARGET_MODES,
} from "@/lib/quiz"

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
    quizConfig: page.quizConfig || deriveQuizConfigFromPage(page),
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
      quizConfig: page.quizConfig || deriveQuizConfigFromPage(page),
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

  const quizConfig = formData.quizConfig || createDefaultQuizConfig()
  const mcqOptions = Array.isArray(quizConfig.legacy?.options) ? quizConfig.legacy.options : ["", "", "", ""]
  const quizSourceNeedsKana = ["kana", "audio", "svg"].includes(quizConfig.source?.modality)
  const quizAnswerNeedsKana = quizConfig.answer?.modality === "kana"
  const deriveKindFromResponseMode = (responseMode) => {
    if (responseMode === "ordering") return "composition"
    if (responseMode === "typing" || responseMode === "drawing") return "production"
    return "recognition"
  }

  const updateQuizConfig = (updates) => {
    setFormData((prev) => ({
      ...prev,
      quizConfig: mergeQuizConfig(prev.quizConfig, updates),
    }))
  }

  const applyQuizPresetToForm = (presetId) => {
    setFormData((prev) => {
      const nextQuiz = applyQuizPreset(prev.quizConfig, presetId)
      return {
        ...prev,
        quizConfig: nextQuiz,
        question: nextQuiz.metadata?.title || prev.question,
        hintText: nextQuiz.metadata?.hint || prev.hintText,
      }
    })
  }

  const handleSave = async () => {
    const errors = []
    if (!formData.title.trim()) errors.push("Page title is required")
    if (["LISTEN", "STROKE", "TRACE", "WRITE"].includes(pageType) && !formData.kanaSelect) {
      errors.push("Select Kana is required")
    }
    if (pageType === "QUIZ") {
      const prompt = quizConfig.metadata?.title || formData.question || formData.title
      if (!prompt.trim()) errors.push("Quiz prompt is required")
      if ((quizSourceNeedsKana || quizAnswerNeedsKana) && !formData.kanaSelect) {
        errors.push("Select Kana is required for this quiz")
      }
      if (quizConfig.kind === "composition") {
        const parts = Array.isArray(quizConfig.composition?.parts) ? quizConfig.composition.parts : []
        if (parts.length === 0) errors.push("Add at least one composition part")
      }
      if (quizConfig.responseMode === "mcq") {
        const options = Array.isArray(quizConfig.legacy?.options) ? quizConfig.legacy.options : []
        const filledOptions = options.filter((option) => String(option || "").trim())
        if (filledOptions.length < 2) errors.push("MCQ quizzes need at least 2 options")
        if (quizConfig.legacy?.correctOption == null) errors.push("Choose the correct option")
      }
      if ((quizConfig.responseMode === "typing" || quizConfig.responseMode === "drawing") && !String(quizConfig.answer?.value || "").trim()) {
        errors.push("Set the expected answer value")
      }
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
        const updatePayload = {
          title: formData.title,
          type: pageType,
          badge: formData.title,
          content: formData.content,
          kanaId: formData.kanaSelect,
          autoPlay: formData.autoPlay,
          hintText: formData.hintText,
          showGuide: formData.showGuide,
          updatedAt: new Date().toISOString(),
        }

        if (pageType === "QUIZ") {
          const nextQuizConfig = mergeQuizConfig(formData.quizConfig || createDefaultQuizConfig(), {
            metadata: {
              title: quizConfig.metadata?.title || formData.question || formData.title,
              hint: quizConfig.metadata?.hint || formData.hintText || "",
              tags: formData.kanaSelect ? ["kana"] : ["legacy"],
            },
            source: {
              refIds: formData.kanaSelect ? [formData.kanaSelect] : [],
            },
            answer: {
              refIds: formData.kanaSelect ? [formData.kanaSelect] : [],
            },
          })

          updatePayload.quizConfig = nextQuizConfig
          updatePayload.question = nextQuizConfig.metadata?.title || formData.question || formData.title
          updatePayload.options = nextQuizConfig.responseMode === "mcq"
            ? nextQuizConfig.legacy?.options || []
            : []
          updatePayload.correctOption = nextQuizConfig.responseMode === "mcq"
            ? nextQuizConfig.legacy?.correctOption || 0
            : 0
        } else {
          updatePayload.question = formData.question
          updatePayload.options = formData.options
          updatePayload.correctOption = formData.correctOption
        }

        await updateDocument(`lessons/${lessonId}/pages`, page.id, updatePayload)
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
          <div className="space-y-5">
            <TitleInput ringClass={ring} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">Preset</label>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (!e.target.value) return
                    applyQuizPresetToForm(e.target.value)
                  }}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                >
                  <option value="">Custom quiz</option>
                  {QUIZ_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>{preset.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Pick a starting shape, then tune the fields below.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Kind</label>
                  <select
                    value={quizConfig.kind}
                    onChange={(e) => {
                      const nextKind = e.target.value
                      const nextResponseMode =
                        nextKind === "composition" ? "ordering" :
                        nextKind === "production" ? "typing" :
                        "mcq"
                      updateQuizConfig({
                        kind: nextKind,
                        responseMode: nextResponseMode,
                      })
                    }}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  >
                    {QUIZ_KINDS.map((kind) => (
                      <option key={kind} value={kind}>{kind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Scope</label>
                  <select
                    value={quizConfig.scope}
                    onChange={(e) => updateQuizConfig({ scope: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  >
                    {QUIZ_SCOPES.map((scope) => (
                      <option key={scope} value={scope}>{scope}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Response</label>
                  <select
                    value={quizConfig.responseMode}
                    onChange={(e) => updateQuizConfig({
                      responseMode: e.target.value,
                      kind: deriveKindFromResponseMode(e.target.value),
                    })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  >
                    {QUIZ_RESPONSE_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Answer</label>
                  <select
                    value={quizConfig.answer?.modality || "romaji"}
                    onChange={(e) => updateQuizConfig({ answer: { modality: e.target.value } })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  >
                    {QUIZ_TARGET_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Prompt</p>
                    <p className="text-xs text-gray-500">What the learner sees first.</p>
                  </div>
                  {quizSourceNeedsKana || quizAnswerNeedsKana ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded">
                      Kana linked
                    </span>
                  ) : null}
                </div>
                <input
                  type="text"
                  value={quizConfig.metadata?.title || ""}
                  onChange={(e) => updateQuizConfig({ metadata: { title: e.target.value } })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  placeholder="Enter the quiz prompt"
                />
                <input
                  type="text"
                  value={quizConfig.metadata?.hint || ""}
                  onChange={(e) => updateQuizConfig({ metadata: { hint: e.target.value } })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  placeholder="Optional hint"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Source modality</label>
                  <select
                    value={quizConfig.source?.modality || "kana"}
                    onChange={(e) => updateQuizConfig({ source: { modality: e.target.value } })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                  >
                    {QUIZ_SOURCE_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">Source preview</label>
                  <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                    {quizConfig.source?.modality === "kana" && selectedKana && (
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">{selectedKana.character}</p>
                        <p>Romaji: {selectedKana.romaji}</p>
                        {selectedKana.audioUrl && <p>Audio available</p>}
                      </div>
                    )}
                    {quizConfig.source?.modality === "audio" && (
                      <p>{selectedKana?.audioUrl ? "Audio from selected kana" : "Pick a kana to attach audio."}</p>
                    )}
                    {quizConfig.source?.modality === "svg" && (
                      <div className="space-y-2">
                        <p>{selectedKana?.svgUrl ? "SVG from selected kana" : "Pick a kana to attach SVG."}</p>
                        {selectedKana?.svgUrl && (
                          <img src={selectedKana.svgUrl} alt="quiz source svg preview" className="max-h-28 object-contain mx-auto" />
                        )}
                      </div>
                    )}
                    {(quizConfig.source?.modality === "romaji" || quizConfig.source?.modality === "text" || quizConfig.source?.modality === "word") && (
                      <input
                        type="text"
                        value={quizConfig.source?.value || ""}
                        onChange={(e) => updateQuizConfig({ source: { value: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Source text"
                      />
                    )}
                  </div>
                </div>
                {(quizSourceNeedsKana || quizAnswerNeedsKana) && (
                  <KanaSelect ringClass={ring} />
                )}
              </div>

              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Answer setup</p>
                  <p className="text-xs text-gray-500">How the learner responds.</p>
                </div>

                {quizConfig.responseMode === "mcq" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Multiple Choice Options</p>
                      <button
                        type="button"
                        onClick={() => {
                          const nextOptions = [...mcqOptions, ""]
                          updateQuizConfig({ legacy: { options: nextOptions } })
                        }}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                    {mcqOptions.map((option, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900 mb-1">Option {index + 1}</label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const nextOptions = [...mcqOptions]
                              nextOptions[index] = e.target.value
                              updateQuizConfig({ legacy: { options: nextOptions } })
                            }}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                        {mcqOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextOptions = mcqOptions.filter((_, i) => i !== index)
                              let nextCorrect = quizConfig.legacy?.correctOption ?? 0
                              if (nextCorrect >= nextOptions.length) {
                                nextCorrect = Math.max(0, nextOptions.length - 1)
                              }
                              updateQuizConfig({ legacy: { options: nextOptions, correctOption: nextCorrect } })
                            }}
                            className="mt-6 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Correct option</label>
                      <select
                        value={quizConfig.legacy?.correctOption ?? 0}
                        onChange={(e) => updateQuizConfig({ legacy: { correctOption: Number.parseInt(e.target.value, 10) } })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                      >
                        {(quizConfig.legacy?.options || []).map((_, index) => (
                          <option key={index} value={index}>Option {index + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Expected answer</label>
                      <input
                        type="text"
                        value={quizConfig.answer?.value || ""}
                        onChange={(e) => updateQuizConfig({ answer: { value: e.target.value } })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                        placeholder="What should the learner produce?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Accepted values</label>
                      <input
                        type="text"
                        value={(quizConfig.answer?.acceptedValues || []).join(", ")}
                        onChange={(e) => updateQuizConfig({ answer: { acceptedValues: e.target.value.split(",").map((value) => value.trim()).filter(Boolean) } })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                        placeholder="comma-separated alternatives"
                      />
                    </div>
                  </div>
                )}

                {quizConfig.responseMode === "ordering" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Composition parts</label>
                      <input
                        type="text"
                        value={(quizConfig.composition?.parts || []).join(", ")}
                        onChange={(e) => updateQuizConfig({
                          composition: {
                            parts: e.target.value.split(",").map((value) => value.trim()).filter(Boolean),
                          },
                        })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                        placeholder="su, shi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Final output</label>
                      <input
                        type="text"
                        value={quizConfig.composition?.output || ""}
                        onChange={(e) => updateQuizConfig({ composition: { output: e.target.value } })}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${ring}`}
                        placeholder="すし"
                      />
                    </div>
                  </div>
                )}

                {quizAnswerNeedsKana && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    This quiz expects a kana answer, so the selected kana will be used as the canonical target.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              <p className="font-semibold">Saved shape</p>
              <p className="mt-1">
                `quizConfig` stores the recipe. `question`, `options`, and `correctOption` stay in sync for legacy MCQ pages.
              </p>
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
