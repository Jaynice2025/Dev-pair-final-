"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { FolderOpen, Users, CheckCircle, Clock, Bell, Plus, ArrowRight } from "lucide-react"
import axios from "axios"

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])
  const [recentNotifications, setRecentNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, projectsResponse, notificationsResponse] = await Promise.all([
        axios.get("/api/dashboard/stats"),
        axios.get("/api/users/me/projects"),
        axios.get("/api/users/me/notifications"),
      ])

      setStats(statsResponse.data)
      setRecentProjects(projectsResponse.data.slice(0, 3))
      setRecentNotifications(notificationsResponse.data.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.full_name || user?.username}!</h1>
          <p>Here's what's happening with your projects and collaborations.</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          <Plus size={20} />
          New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FolderOpen size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.owned_projects || 0}</h3>
            <p>Your Projects</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.completed_projects || 0}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.collaborations || 0}</h3>
            <p>Collaborations</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats?.pending_requests || 0}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Projects */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <Link to="/my-projects" className="section-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} />
              <h3>No projects yet</h3>
              <p>Create your first project to start collaborating with other developers.</p>
              <Link to="/projects" className="btn btn-primary">
                Create Project
              </Link>
            </div>
          ) : (
            <div className="projects-grid">
              {recentProjects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={`status-badge ${project.status}`}>{project.status}</span>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-meta">
                    <span className="difficulty-badge">{project.difficulty_level}</span>
                    <span className="project-date">{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/projects/${project.id}`} className="btn btn-outline btn-sm">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <Link to="/notifications" className="section-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <h3>No recent activity</h3>
              <p>Your notifications and updates will appear here.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className={`notification-item ${!notification.is_read ? "unread" : ""}`}>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{new Date(notification.created_at).toLocaleDateString()}</span>
                  </div>
                  {!notification.is_read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
