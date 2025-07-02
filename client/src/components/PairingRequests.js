"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Clock, CheckCircle, XCircle, User, Calendar, MessageSquare, Eye, Filter, Search } from "lucide-react"
import axios from "axios"

function PairingRequests() {
  const { user } = useAuth()
  const [sentRequests, setSentRequests] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("sent")
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPairingRequests()
  }, [])

  const fetchPairingRequests = async () => {
    try {
      // Fetch sent requests
      const sentResponse = await axios.get("/api/users/me/pairing-requests")
      setSentRequests(sentResponse.data)

      // Fetch received requests for user's projects
      const projectsResponse = await axios.get("/api/users/me/projects")
      const projects = projectsResponse.data

      let allReceivedRequests = []
      for (const project of projects) {
        try {
          const requestsResponse = await axios.get(`/api/projects/${project.id}/pairing-requests`)
          const projectRequests = requestsResponse.data.requests.map((req) => ({
            ...req,
            project_title: project.title,
          }))
          allReceivedRequests = [...allReceivedRequests, ...projectRequests]
        } catch (error) {
          console.error(`Error fetching requests for project ${project.id}:`, error)
        }
      }

      setReceivedRequests(allReceivedRequests)
    } catch (error) {
      console.error("Error fetching pairing requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestUpdate = async (requestId, status, responseMessage = "") => {
    try {
      await axios.put(`/api/pairing-requests/${requestId}`, {
        status,
        response_message: responseMessage,
      })
      await fetchPairingRequests()
    } catch (error) {
      console.error("Error updating request:", error)
      alert("Error updating request. Please try again.")
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="status-icon pending" />
      case "approved":
        return <CheckCircle size={16} className="status-icon approved" />
      case "rejected":
        return <XCircle size={16} className="status-icon rejected" />
      default:
        return <Clock size={16} className="status-icon" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF9800"
      case "approved":
        return "#4CAF50"
      case "rejected":
        return "#F44336"
      default:
        return "#9E9E9E"
    }
  }

  const filterRequests = (requests) => {
    return requests.filter((request) => {
      const matchesStatus = !statusFilter || request.status === statusFilter
      const matchesSearch =
        !searchTerm ||
        (request.project?.title || request.project_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.requester?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.message || "").toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }

  if (loading) {
    return (
      <div className="pairing-requests-loading">
        <div className="loading-spinner"></div>
        <p>Loading pairing requests...</p>
      </div>
    )
  }

  const filteredSentRequests = filterRequests(sentRequests)
  const filteredReceivedRequests = filterRequests(receivedRequests)

  return (
    <div className="pairing-requests">
      <div className="page-header">
        <div>
          <h1>Pairing Requests</h1>
          <p>Manage your collaboration requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === "sent" ? "active" : ""}`} onClick={() => setActiveTab("sent")}>
          Sent Requests ({sentRequests.length})
        </button>
        <button className={`tab ${activeTab === "received" ? "active" : ""}`} onClick={() => setActiveTab("received")}>
          Received Requests ({receivedRequests.length})
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {(searchTerm || statusFilter) && (
          <button
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("")
            }}
            className="btn btn-outline btn-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="requests-container">
        {activeTab === "sent" ? (
          <div className="requests-list">
            {filteredSentRequests.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={64} />
                <h3>{searchTerm || statusFilter ? "No requests match your filters" : "No sent requests yet"}</h3>
                <p>
                  {searchTerm || statusFilter
                    ? "Try adjusting your search criteria"
                    : "Browse projects and send collaboration requests to get started"}
                </p>
                {!searchTerm && !statusFilter && (
                  <Link to="/projects" className="btn btn-primary">
                    Browse Projects
                  </Link>
                )}
              </div>
            ) : (
              filteredSentRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-project">
                      <h3>{request.project?.title}</h3>
                      <div className="request-status">
                        {getStatusIcon(request.status)}
                        <span className="status-text" style={{ color: getStatusColor(request.status) }}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    <div className="request-date">
                      <Calendar size={16} />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="request-content">
                    <div className="request-message">
                      <h4>Your Message:</h4>
                      <p>{request.message}</p>
                    </div>

                    {request.response_message && (
                      <div className="request-response">
                        <h4>Response:</h4>
                        <p>{request.response_message}</p>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    <Link to={`/projects/${request.project_id}`} className="btn btn-outline btn-sm">
                      <Eye size={16} />
                      View Project
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="requests-list">
            {filteredReceivedRequests.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={64} />
                <h3>{searchTerm || statusFilter ? "No requests match your filters" : "No received requests yet"}</h3>
                <p>
                  {searchTerm || statusFilter
                    ? "Try adjusting your search criteria"
                    : "When others want to collaborate on your projects, their requests will appear here"}
                </p>
              </div>
            ) : (
              filteredReceivedRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-info">
                      <div className="requester-info">
                        <User size={20} />
                        <span className="requester-name">
                          {request.requester?.full_name || request.requester?.username}
                        </span>
                        <span className="requester-username">@{request.requester?.username}</span>
                      </div>
                      <div className="project-name">
                        wants to join: <strong>{request.project_title}</strong>
                      </div>
                    </div>
                    <div className="request-status">
                      {getStatusIcon(request.status)}
                      <span className="status-text" style={{ color: getStatusColor(request.status) }}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="request-content">
                    <div className="request-message">
                      <h4>Message:</h4>
                      <p>{request.message}</p>
                    </div>

                    {request.response_message && (
                      <div className="request-response">
                        <h4>Your Response:</h4>
                        <p>{request.response_message}</p>
                      </div>
                    )}
                  </div>

                  <div className="request-meta">
                    <Calendar size={16} />
                    <span>Requested on {new Date(request.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="request-actions">
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            const response = prompt("Optional response message:")
                            handleRequestUpdate(request.id, "approved", response || "")
                          }}
                          className="btn btn-success btn-sm"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const response = prompt("Optional response message:")
                            handleRequestUpdate(request.id, "rejected", response || "")
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                    <Link to={`/projects/${request.project_id}`} className="btn btn-outline btn-sm">
                      <Eye size={16} />
                      View Project
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PairingRequests
