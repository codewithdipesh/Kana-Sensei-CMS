"use client"

import { BookOpen, Menu, Lightbulb, Users, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

export default function Sidebar({ onClose }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    // perform sign out and redirect to /login
    try {
      ;(async () => {
        const { signOutUser } = await import("@/lib/firebase")
        await signOutUser()
        router.push("/login")
      })()
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-8 border-b border-gray-800">
          <div className="text-3xl font-bold">あ</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem icon={Menu} label="All Characters" href="/" active={isActive("/")} onClick={onClose} />
          <NavItem
            icon={BookOpen}
            label="Lessons"
            href="/lessons-list"
            active={isActive("/lessons-list") || isActive("/lessons")}
            onClick={onClose}
          />
          <NavItem
            icon={Users}
            label="Chapters"
            href="/chapters-list"
            active={isActive("/chapters-list") || isActive("/chapters")}
            onClick={onClose}
          />
          <NavItem icon={Lightbulb} label="Kanji" href="/kanji" active={isActive("/kanji")} onClick={onClose} />
        </nav>

        {/* Logout */}
        <div className="px-4 py-20 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function NavItem({ icon: Icon, label, href, active = false, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        active ? "bg-blue-600 text-white font-semibold" : "text-gray-400 hover:text-white hover:bg-gray-800"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
