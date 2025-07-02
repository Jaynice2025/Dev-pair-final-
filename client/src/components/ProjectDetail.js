"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  User,
  Calendar,
  Github,
  Globe,
  Users,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Send,
  Target,
} from "lucide-react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import axios from "axios"

const PairingRequestSchema = Yup.object().shape({
  message: Yup.string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters")
    .required("Message is required"),
})

const MilestoneSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  description: Yup.string().max(500, "Description must be less than 500 characters"),
  due_date: Yup.date().min(new Date(), "Due date must be in the future"),
})

const CommentSchema = Yup.object().shape({
  content: Yup.string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters")
    .required("Comment is required"),
})

function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPairingForm, setShowPairingForm] = useState(false)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [hasExistingRequest, setHasExistingRequest] = useState(false)
  const [isCollaborator, setIsCollaborator] = useState(false)

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const fetchProjectData = async () => {
    try {
      const [projectResponse, milestonesResponse, commentsResponse] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/projects/${id}/milestones`),
        axios.get(`/api/projects/${id}/comments`),
      ])

      setProject(projectResponse.data)
      setMilestones(milestonesResponse.data)
      setComments(commentsResponse.data)

      // Check if user has existing pairing request
      if (user) {
        try {
          const requestsResponse = await axios.get("/api/users/me/pairing-requests")
          const existingRequest = requestsResponse.data.find((req) => req.project_id === Number.parseInt(id))
          setHasExistingRequest(!!existingRequest)
        } catch (error) {
          console.error("Error checking pairing requests:", error)
        }

        // Check if user is a collaborator
        const isOwner = projectResponse.data.owner_id === user.id
        const collaborator = projectResponse.data.collaborators?.find((c) => c.user_id === user.id)
        setIsCollaborator(isOwner || !!collaborator)
      }
    } catch (error) {
      console.error("Error fetching project data:", error)
      if (error.response?.status === 404) {
        navigate("/projects")
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePairingRequest = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(`/api/projects/${id}/pairing-requests`, values)
      setHasExistingRequest(true)
      setShowPairingForm(false)
      resetForm()
      alert("Pairing request sent successfully!")
    } catch (error) {
      console.error("Error sending pairing request:", error)
      alert("Error sending pairing request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleMilestoneSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(`/api/projects/${id}/milestones`, values)
      await fetchProjectData()
      setShowMilestoneForm(false)
      resetForm()
    } catch (error) {
      console.error("Error creating milestone:", error)
      alert("Error creating milestone. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(`/api/projects/${id}/comments`, values)
      await fetchProjectData()
      resetForm()
    } catch (error) {
      console.error("Error posting comment:", error)
      alert("Error posting comment. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMilestoneComplete = async (milestoneId, isCompleted) => {
    try {
      await axios.put(`/api/milestones/${milestoneId}`, {
        is_completed: !isCompleted,
      })
      await fetchProjectData()
    } catch (error) {
      console.error("Error updating milestone:", error)
    }
  }

  const deleteMilestone = async (milestoneId) => {
    if (window.confirm("Are you sure you want to delete this milestone?")) {
      try {
        await axios.delete(`/api/milestones/${milestoneId}`)
        await fetchProjectData()
      } catch (error) {
        console.error("Error deleting milestone:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading project details...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="project-not-found">
        <h2>Project not found</h2>
        <Link to="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    )
  }

  const techStack = project.tech_stack ? project.tech_stack.split(",").map((t) => t.trim()) : []
  const tags = project.tags ? project.tags.split(",").map((t) => t.trim()) : []
  const isOwner = user && project.owner_id === user.id
  const completedMilestones = milestones.filter((m) => m.is_completed).length
  const progressPercentage = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0

  return (
    <div className="project-detail">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-title-section">
          <h1>{project.title}</h1>
          <div className="project-badges">
            <span className={`status-badge ${project.status}`}>{project.status}</span>
            <span className={`difficulty-badge ${project.difficulty_level}`}>{project.difficulty_level}</span>
          </div>
        </div>

        <div className="project-actions">
          {isOwner && (
            <Link to={`/projects/${id}/edit`} className="btn btn-outline">
              <Edit size={20} />
              Edit Project
            </Link>
          )}

          {user && !isOwner && !hasExistingRequest && (
            <button onClick={() => setShowPairingForm(true)} className="btn btn-primary">
              <Users size={20} />
              Request to Join
            </button>
          )}

          {hasExistingRequest && <span className="request-status">Request Sent</span>}
        </div>
      </div>

      {/* Project Info */}
      <div className="project-content">
        <div className="project-main">
          <div className="project-description">
            <h3>About this project</h3>
            <p>{project.description}</p>
          </div>

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="tech-stack-section">
              <h3>Tech Stack</h3>
              <div className="tech-stack">
                {techStack.map((tech, index) => (
                  <span key={index} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="tags-section">
              <h3>Tags</h3>
              <div className="tags">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="project-links">
            {project.repository_url && (
              <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="project-link">
                <Github size={20} />
                Repository
              </a>
            )}
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="project-link">
                <Globe size={20} />
                Live Demo
              </a>
            )}
          </div>

          {/* Milestones */}
          <div className="milestones-section">
            <div className="section-header">
              <h3>Milestones</h3>
              {isCollaborator && (
                <button onClick={() => setShowMilestoneForm(true)} className="btn btn-outline btn-sm">
                  <Plus size={16} />
                  Add Milestone
                </button>
              )}
            </div>

            {milestones.length > 0 && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                <span className="progress-text">
                  {completedMilestones}/{milestones.length} completed ({Math.round(progressPercentage)}%)
                </span>
              </div>
            )}

            <div className="milestones-list">
              {milestones.map((milestone) => (
                <div key={milestone.id} className={`milestone-item ${milestone.is_completed ? "completed" : ""}`}>
                  <div className="milestone-content">
                    <div className="milestone-header">
                      <h4>{milestone.title}</h4>
                      {isCollaborator && (
                        <div className="milestone-actions">
                          <button
                            onClick={() => toggleMilestoneComplete(milestone.id, milestone.is_completed)}
                            className={`btn btn-sm ${milestone.is_completed ? "btn-outline" : "btn-primary"}`}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => deleteMilestone(milestone.id)} className="btn btn-sm btn-danger">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    {milestone.description && <p>{milestone.description}</p>}
                    {milestone.due_date && (
                      <div className="milestone-due-date">
                        <Clock size={16} />
                        Due: {new Date(milestone.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {milestones.length === 0 && (
              <div className="empty-state">
                <Target size={48} />
                <p>No milestones yet</p>
                {isCollaborator && (
                  <button onClick={() => setShowMilestoneForm(true)} className="btn btn-primary">
                    Add First Milestone
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="comments-section">
            <h3>Discussion</h3>

            {user && (
              <Formik initialValues={{ content: "" }} validationSchema={CommentSchema} onSubmit={handleCommentSubmit}>
                {({ isSubmitting }) => (
                  <Form className="comment-form">
                    <Field
                      as="textarea"
                      name="content"
                      placeholder="Add a comment..."
                      className="form-control"
                      rows="3"
                    />
                    <ErrorMessage name="content" component="div" className="error-message" />
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
                      <Send size={16} />
                      {isSubmitting ? "Posting..." : "Post Comment"}
                    </button>
                  </Form>
                )}
              </Formik>
            )}

            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-author">
                    <User size={20} />
                    <span>{comment.author?.username}</span>
                    <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>No comments yet</p>
                <p>Start the discussion!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="project-sidebar">
          <div className="project-owner">
            <h4>Project Owner</h4>
            <div className="owner-info">
              <User size={24} />
              <div>
                <p className="owner-name">{project.owner?.full_name || project.owner?.username}</p>
                <p className="owner-username">@{project.owner?.username}</p>
              </div>
            </div>
          </div>

          <div className="project-stats">
            <h4>Project Stats</h4>
            <div className="stat-item">
              <Calendar size={16} />
              <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="stat-item">
              <Users size={16} />
              <span>Max {project.max_collaborators} collaborators</span>
            </div>
            <div className="stat-item">
              <Target size={16} />
              <span>{milestones.length} milestones</span>
            </div>
          </div>

          {project.collaborators && project.collaborators.length > 0 && (
            <div className="collaborators">
              <h4>Collaborators</h4>
              <div className="collaborators-list">
                {project.collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="collaborator-item">
                    <User size={20} />
                    <span>{collaborator.user?.username}</span>
                    <span className="role-badge">{collaborator.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pairing Request Modal */}
      {showPairingForm && (
        <div className="modal-overlay" onClick={() => setShowPairingForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Request to Join Project</h3>
            <Formik
              initialValues={{ message: "" }}
              validationSchema={PairingRequestSchema}
              onSubmit={handlePairingRequest}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label>Message to project owner</label>
                    <Field
                      as="textarea"
                      name="message"
                      placeholder="Tell the project owner why you'd like to join and what you can contribute..."
                      className="form-control"
                      rows="4"
                    />
                    <ErrorMessage name="message" component="div" className="error-message" />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowPairingForm(false)} className="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                      {isSubmitting ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Milestone Form Modal */}
      {showMilestoneForm && (
        <div className="modal-overlay" onClick={() => setShowMilestoneForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Milestone</h3>
            <Formik
              initialValues={{ title: "", description: "", due_date: "" }}
              validationSchema={MilestoneSchema}
              onSubmit={handleMilestoneSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <label>Title</label>
                    <Field type="text" name="title" placeholder="Milestone title" className="form-control" />
                    <ErrorMessage name="title" component="div" className="error-message" />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      placeholder="Describe what needs to be accomplished..."
                      className="form-control"
                      rows="3"
                    />
                    <ErrorMessage name="description" component="div" className="error-message" />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <Field type="date" name="due_date" className="form-control" />
                    <ErrorMessage name="due_date" component="div" className="error-message" />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowMilestoneForm(false)} className="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                      {isSubmitting ? "Creating..." : "Create Milestone"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
