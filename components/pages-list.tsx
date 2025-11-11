"use client"

import { useState } from "react"

interface Page {
  id: number
  order: number
  title: string
  type: string
  badge: string
}

interface PagesListProps {
  pages: Page[]
  selectedPage: Page | null
  onSelectPage: (page: Page) => void
  onDeletePage: (id: number) => void
  onMoveUp: (id: number) => void
  onMoveDown: (id: number) => void
  getPageTypeColor: (type: string) => string
}

export default function PagesList({
  pages,
  selectedPage,
  onSelectPage,
  onDeletePage,
  onMoveUp,
  onMoveDown,
  getPageTypeColor,
}: PagesListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => (
              <tr
                key={page.id}
                onClick={() => onSelectPage(page)}
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedPage?.id === page.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{page.order}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`text-xs font-semibold text-white px-2 py-1 rounded ${getPageTypeColor(page.type)}`}>
                    {page.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{page.title}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteConfirm(page.id)
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-3">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => onSelectPage(page)}
            className={`bg-white rounded-lg border p-4 cursor-pointer transition-all ${
              selectedPage?.id === page.id ? "border-blue-500 border-2 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <p className="text-gray-500 text-xs font-semibold">Order</p>
                <p className="text-gray-900 font-medium">{page.order}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold">Type</p>
                <span
                  className={`text-xs font-semibold text-white px-2 py-1 rounded inline-block ${getPageTypeColor(page.type)}`}
                >
                  {page.type}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 text-xs font-semibold">Title</p>
                <p className="text-gray-900 font-medium">{page.title}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setDeleteConfirm(page.id)
              }}
              className="w-full px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors font-medium"
            >
              delete
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Page</h3>
            <p className="text-gray-600 mb-6">Enter password to confirm deletion of this page (password: verify123)</p>
            <input
              type="password"
              placeholder="Enter password"
              id="deletePassword"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const password = (document.getElementById("deletePassword") as HTMLInputElement)?.value
                  if (password === "verify123") {
                    onDeletePage(deleteConfirm)
                    setDeleteConfirm(null)
                  } else {
                    alert("Incorrect password")
                  }
                }}
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
