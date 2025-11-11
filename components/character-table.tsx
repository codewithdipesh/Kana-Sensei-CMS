"use client"

import { useState } from "react"

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

const sampleData: Character[] = [
  {
    id: "1998498",
    character: "あ",
    romaji: "a",
    kana_type: "Hiragana",
    svgUrl: "https://example.svg",
    audioUrl: "https://example.svg",
    example_word: "null",
    notes: "null",
  },
  {
    id: "1998499",
    character: "い",
    romaji: "i",
    kana_type: "Hiragana",
    svgUrl: "https://example.svg",
    audioUrl: "https://example.svg",
    example_word: "null",
    notes: "null",
  },
]

interface CharacterTableProps {
  searchQuery: string
  onEdit: (character: Character) => void
}

export default function CharacterTable({ searchQuery, onEdit }: CharacterTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filteredData = sampleData.filter(
    (item) =>
      item.id.includes(searchQuery) || item.character.includes(searchQuery) || item.romaji.includes(searchQuery),
  )

  const handleDelete = (id: string) => {
    // Here you would delete from your backend
    console.log("Deleting character with id:", id)
    setDeleteConfirm(null)
  }

  return (
    <>
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">character</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">romaji</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">kana_type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">svgUrl</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">audioUrl</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">example_word</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">notes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{row.character}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.romaji}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.kana_type}</td>
                <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-xs">{row.svgUrl}</td>
                <td className="px-4 py-3 text-sm text-blue-600 truncate max-w-xs">{row.audioUrl}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.example_word}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.notes}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(row)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(row.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-3">
        {filteredData.map((row) => (
          <div key={row.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs font-semibold">ID</p>
                <p className="text-gray-900 font-medium">{row.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold">character</p>
                <p className="text-gray-900 font-medium text-lg">{row.character}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold">romaji</p>
                <p className="text-gray-900">{row.romaji}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold">kana_type</p>
                <p className="text-gray-900">{row.kana_type}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs font-semibold">svgUrl</p>
                <p className="text-blue-600 text-xs truncate">{row.svgUrl}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs font-semibold">audioUrl</p>
                <p className="text-blue-600 text-xs truncate">{row.audioUrl}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs font-semibold">example_word</p>
                <p className="text-gray-900">{row.example_word}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs font-semibold">notes</p>
                <p className="text-gray-900">{row.notes}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onEdit(row)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors font-medium"
              >
                edit
              </button>
              <button
                onClick={() => setDeleteConfirm(row.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors font-medium"
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation - Added backdrop-blur for consistent blur effect */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Character</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this character? This action cannot be undone.
            </p>
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
