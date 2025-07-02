"use client"

import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Bell, Moon, Sun, User, LogOut, Menu, X } from "lucide-react"
import axios from "axios"

function Navigation() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/users/me/notifications")
      setNotifications(response.data)
      setUnreadCount(response.data.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "My Projects", path: "/my-projects" },
    { name: "Pairing Requests", path: "/pairing-requests" },
  ]

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          DevPair
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-menu desktop-menu">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="nav-actions">
          <button
            onClick={toggleDarkMode}
            className="nav-action-btn"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link to="/notifications" className="nav-action-btn notification-btn">
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </Link>

          <div className="user-menu">
            <Link to="/profile" className="nav-action-btn">
              <User size={20} />
              <span className="user-name">{user?.username}</span>
            </Link>
          </div>

          <button onClick={handleLogout} className="nav-action-btn logout-btn">
            <LogOut size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navigation
