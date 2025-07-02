"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Search, Filter, Plus, User, Calendar, Code, ExternalLink } from "lucide-react"
import axios from "axios"

function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProjects()
  }, [searchTerm, statusFilter, difficultyFilter, currentPage])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "12",
      })

      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter) params.append("status", statusFilter)
      if (difficultyFilter) params.append("difficulty", difficultyFilter)

      const response = await axios.get(`/api/projects?${params}`)
      setProjects(response.data.projects)
      setTotalPages(response.data.pages)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (filterType, value) => {
    if (filterType === "status") {
      setStatusFilter(value)
    } else if (filterType === "difficulty") {
      setDifficultyFilter(value)
    }
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setDifficultyFilter("")
    setCurrentPage(1)
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case "beginner":
        return "#4CAF50"
      case "intermediate":
        return "#FF9800"
      case "advanced":
        return "#F44336"
      default:
        return "#9E9E9E"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return "#2196F3"
      case "completed":
        return "#4CAF50"
      case "paused":
        return "#FF9800"
      default:
        return "#9E9E9E"
    }
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Discover Projects</h1>
          <p>Find exciting projects to collaborate on</p>
        </div>
        {user && (
          <Link to="/my-projects" className="btn btn-primary">
            <Plus size={20} />
            Create Project
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search projects by title, description, or tech stack..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={difficultyFilter}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="filter-select"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {(searchTerm || statusFilter || difficultyFilter) && (
            <button onClick={clearFilters} className="btn btn-outline btn-sm">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="project-card-skeleton"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <Code size={64} />
          <h3>No projects found</h3>
          <p>Try adjusting your search criteria or create a new project.</p>
          {user && (
            <Link to="/my-projects" className="btn btn-primary">
              Create Your First Project
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <h3>{project.title}</h3>
                  <div className="project-badges">
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(project.status) }}>
                      {project.status}
                    </span>
                    <span
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(project.difficulty_level) }}
                    >
                      {project.difficulty_level}
                    </span>
                  </div>
                </div>

                <p className="project-description">{project.description}</p>

                {project.tech_stack && (
                  <div className="tech-stack">
                    {project.tech_stack
                      .split(",")
                      .slice(0, 3)
                      .map((tech, index) => (
                        <span key={index} className="tech-tag">
                          {tech.trim()}
                        </span>
                      ))}
                    {project.tech_stack.split(",").length > 3 && (
                      <span className="tech-tag more">+{project.tech_stack.split(",").length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="project-meta">
                  <div className="project-owner">
                    <User size={16} />
                    <span>{project.owner?.username || "Unknown"}</span>
                  </div>
                  <div className="project-date">
                    <Calendar size={16} />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="project-actions">
                  <Link to={`/projects/${project.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn btn-outline"
              >
                Previous
              </button>

              <div className="page-numbers">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Projects
