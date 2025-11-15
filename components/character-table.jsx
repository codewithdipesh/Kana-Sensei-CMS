"use client"

import { useEffect, useState } from "react"
import { subscribeCollection, deleteDocument } from "@/lib/firebase"

export default function CharacterTable({ searchQuery, onEdit }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [items, setItems] = useState([])

  useEffect(() => {
    const unsub = subscribeCollection(
      "characters",
      (docs) => setItems(docs),
      { orderBy: { field: "character", direction: "asc" } }
    )
    return () => unsub()
  }, [])

  const q = (searchQuery ?? "").toString().trim().toLowerCase()
  const filteredData = items.filter((item) => {
    if (!q) return true
    return (
      String(item.id || "").toLowerCase().includes(q) ||
      String(item.character || "").toLowerCase().includes(q) ||
      String(item.romaji || "").toLowerCase().includes(q)
    )
  })

  const handleDelete = async (id) => {
    try {
      await deleteDocument("characters", id)
      setDeleteConfirm(null)
    } catch (err) {
      console.error("Failed to delete character", err)
      alert("Delete failed: " + (err?.message || String(err)))
    }
  }

  return (
    <>
      {/* Desktop table view — show on md and larger */}
      <div className="hidden md:flex bg-white rounded-lg border border-gray-200 w-full">
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Char</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Romaji</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">SVG</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Audio</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Example</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Notes</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{row.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 font-bold whitespace-nowrap">{row.character}</td>
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{row.romaji}</td>
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{row.kana_type}</td>
                    <td className="px-3 py-2 text-xs text-blue-600 truncate max-w-xs">{row.svgUrl}</td>
                    <td className="px-3 py-2 text-xs text-blue-600 truncate max-w-xs">{row.audioUrl}</td>
                    <td className="px-3 py-2 text-xs text-gray-900 whitespace-nowrap">{row.example_word}</td>
                    <td className="px-3 py-2 text-xs text-gray-900 truncate max-w-xs">{row.notes}</td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEdit(row)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                          aria-label={`Edit ${row.character}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(row.id)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                          aria-label={`Delete ${row.character}`}
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-3 py-4 text-center text-gray-500 text-sm">
                    No characters found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile card view — show below md */}
      <div className="md:hidden space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map((row) => (
            <div key={row.id} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">ID</p>
                    <p className="text-gray-900 font-medium text-sm">{row.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Character</p>
                    <p className="text-gray-900 font-bold text-lg">{row.character}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Romaji</p>
                    <p className="text-gray-900">{row.romaji}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Type</p>
                    <p className="text-gray-900">{row.kana_type}</p>
                  </div>
                </div>
                {row.example_word && (
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Example</p>
                    <p className="text-gray-900 text-sm">{row.example_word}</p>
                  </div>
                )}
                {row.notes && (
                  <div>
                    <p className="text-gray-500 text-xs font-semibold">Notes</p>
                    <p className="text-gray-900 text-sm">{row.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3 sm:mt-4">
                <button
                  onClick={() => onEdit(row)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs sm:text-sm hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(row.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs sm:text-sm hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
            No characters found
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Character</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this character? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                aria-label="Confirm delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
