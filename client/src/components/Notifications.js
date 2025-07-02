"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Bell, BellOff, Users, Target, FolderOpen, CheckCircle, Clock } from "lucide-react"
import axios from "axios"

function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, read

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/users/me/notifications")
      setNotifications(response.data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`)
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read)
      await Promise.all(
        unreadNotifications.map((notification) => axios.put(`/api/notifications/${notification.id}/read`)),
      )
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      )
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "pairing_request":
      case "pairing_request_update":
        return <Users size={20} className="notification-icon pairing" />
      case "milestone":
        return <Target size={20} className="notification-icon milestone" />
      case "project_update":
        return <FolderOpen size={20} className="notification-icon project" />
      default:
        return <Bell size={20} className="notification-icon default" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "pairing_request":
      case "pairing_request_update":
        return "#2196F3"
      case "milestone":
        return "#4CAF50"
      case "project_update":
        return "#FF9800"
      default:
        return "#9E9E9E"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.is_read
      case "read":
        return notification.is_read
      default:
        return true
    }
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your project activities</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-outline">
            <CheckCircle size={20} />
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="notification-filters">
        <button className={`filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
          All ({notifications.length})
        </button>
        <button className={`filter-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
          Unread ({unreadCount})
        </button>
        <button className={`filter-tab ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            {filter === "unread" ? (
              <>
                <BellOff size={64} />
                <h3>No unread notifications</h3>
                <p>You're all caught up! New notifications will appear here.</p>
              </>
            ) : filter === "read" ? (
              <>
                <CheckCircle size={64} />
                <h3>No read notifications</h3>
                <p>Notifications you've read will appear here.</p>
              </>
            ) : (
              <>
                <Bell size={64} />
                <h3>No notifications yet</h3>
                <p>When you have project activities, notifications will appear here.</p>
                <Link to="/projects" className="btn btn-primary">
                  Browse Projects
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.is_read ? "unread" : ""}`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="notification-content">
                  <div className="notification-header">
                    <div className="notification-icon-wrapper">{getNotificationIcon(notification.type)}</div>
                    <div className="notification-info">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                    </div>
                    {!notification.is_read && <div className="unread-indicator"></div>}
                  </div>

                  <div className="notification-meta">
                    <div className="notification-time">
                      <Clock size={14} />
                      <span>{new Date(notification.created_at).toLocaleString()}</span>
                    </div>
                    <div className="notification-type" style={{ color: getNotificationColor(notification.type) }}>
                      {notification.type.replace("_", " ")}
                    </div>
                  </div>
                </div>

                {!notification.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification.id)
                    }}
                    className="mark-read-btn"
                    title="Mark as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && (
        <div className="notification-actions">
          <div className="actions-summary">
            <span>Total: {notifications.length} notifications</span>
            <span>Unread: {unreadCount}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications
