"use client"

import { useState, useMemo } from "react"
import { X, Plus, Trash2, GripVertical } from "lucide-react"
import { addDocument } from "@/lib/firebase"
import { getPageTypeColor } from "@/components/page-editor"

const STEP_TYPES = ["INFO", "LISTEN", "STROKE", "TRACE", "WRITE", "QUIZ"]

const PRESETS = {
  "Full kana flow": ["LISTEN", "STROKE", "TRACE", "WRITE", "QUIZ"],
  "Listen + Stroke": ["LISTEN", "STROKE"],
  "Practice only": ["TRACE", "WRITE"],
}

const stepLabel = (type) => {
  switch (type) {
    case "LISTEN": return "Listen"
    case "STROKE": return "Stroke"
    case "TRACE": return "Trace"
    case "WRITE": return "Write"
    case "QUIZ": return "Quiz"
    case "INFO": return "Info"
    default: return type
  }
}

const needsKana = (type) => ["LISTEN", "STROKE", "TRACE", "WRITE"].includes(type)

export default function AddPagesModal({ open, onClose, lessonId, characters, currentPageCount, onAdded }) {
  const [kanaId, setKanaId] = useState("")
  const [steps, setSteps] = useState(["LISTEN", "STROKE", "TRACE", "WRITE", "QUIZ"])
  const [submitting, setSubmitting] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)

  const selectedKana = useMemo(
    () => characters.find((c) => c.id === kanaId),
    [characters, kanaId]
  )

  if (!open) return null

  const stepsNeedingKana = steps.filter(needsKana).length
  const kanaRequired = stepsNeedingKana > 0

  const reset = () => {
    setKanaId("")
    setSteps(["LISTEN", "STROKE", "TRACE", "WRITE", "QUIZ"])
    setSubmitting(false)
  }

  const handleClose = () => {
    if (submitting) return
    reset()
    onClose()
  }

  const addStep = () => setSteps((s) => [...s, "LISTEN"])
  const removeStep = (i) => setSteps((s) => s.filter((_, idx) => idx !== i))
  const changeStep = (i, value) => setSteps((s) => s.map((t, idx) => (idx === i ? value : t)))

  const onDragStart = (i) => setDragIndex(i)
  const onDragOver = (e) => e.preventDefault()
  const onDrop = (i) => {
    if (dragIndex === null || dragIndex === i) return
    setSteps((s) => {
      const copy = [...s]
      const [moved] = copy.splice(dragIndex, 1)
      copy.splice(i, 0, moved)
      return copy
    })
    setDragIndex(null)
  }

  const applyPreset = (name) => setSteps([...PRESETS[name]])

  const handleConfirm = async () => {
    if (steps.length === 0) {
      alert("Add at least one step.")
      return
    }
    if (kanaRequired && !kanaId) {
      alert("Select a kana — required for Listen / Stroke / Trace / Write steps.")
      return
    }

    setSubmitting(true)
    try {
      const baseOrder = currentPageCount
      const kanaLabel = selectedKana?.character || ""
      const now = new Date().toISOString()

      // Sequential to keep order monotonic; small N (typically 1-6 steps).
      for (let i = 0; i < steps.length; i++) {
        const type = steps[i]
        const title = needsKana(type) && kanaLabel
          ? `${kanaLabel} — ${stepLabel(type)}`
          : `${stepLabel(type)} ${baseOrder + i + 1}`
        await addDocument(`lessons/${lessonId}/pages`, {
          order: baseOrder + i + 1,
          title,
          type,
          badge: title,
          content: "",
          kanaId: needsKana(type) ? kanaId : "",
          autoPlay: type === "LISTEN" || type === "STROKE",
          hintText: "",
          showGuide: type === "TRACE",
          question: "",
          options: ["", "", "", ""],
          correctOption: 0,
          createdAt: now,
          updatedAt: now,
        })
      }

      reset()
      onClose()
      if (onAdded) onAdded(steps.length)
    } catch (err) {
      console.error("Failed to add pages:", err)
      alert("Failed to add pages")
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Add pages</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors" disabled={submitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Kana {kanaRequired ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(not needed for current steps)</span>}
            </label>
            <select
              value={kanaId}
              onChange={(e) => setKanaId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a kana...</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.character} ({char.romaji}) - {char.kana_type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">Page sequence</label>
              <span className="text-xs text-gray-500">Drag to reorder</span>
            </div>
            <div className="space-y-2">
              {steps.map((type, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragOver={onDragOver}
                  onDrop={() => onDrop(i)}
                  className={`flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg ${dragIndex === i ? "opacity-50" : ""}`}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded w-7 text-center">{i + 1}</span>
                  <span className={`text-xs font-semibold text-white px-2 py-1 rounded ${getPageTypeColor(type)}`}>{type}</span>
                  <select
                    value={type}
                    onChange={(e) => changeStep(i, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STEP_TYPES.map((t) => (
                      <option key={t} value={t}>{stepLabel(t)}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeStep(i)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Remove"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {steps.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-3">No steps. Add one below.</p>
              )}
            </div>
            <button
              onClick={addStep}
              className="mt-3 w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              type="button"
            >
              <Plus className="w-4 h-4" />
              Add step
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => applyPreset(name)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                  type="button"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || steps.length === 0}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {submitting ? "Adding..." : `Add ${steps.length} page${steps.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  )
}
