"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const SessionSchema = Yup.object().shape({
  user_id: Yup.number().required("User is required"),
  project_id: Yup.number().required("Project is required"),
  status: Yup.string()
    .oneOf(["pending", "active", "completed", "cancelled"], "Please select a valid status")
    .required("Status is required"),
  notes: Yup.string().max(1000, "Notes must be less than 1000 characters"),
  duration_minutes: Yup.number().min(0, "Duration cannot be negative").integer("Duration must be a whole number"),
  rating: Yup.number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .integer("Rating must be a whole number"),
})

function PairingSessions() {
  const [sessions, setSessions] = useState([])
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchSessions()
    fetchUsers()
    fetchProjects()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/pairing-sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const response = await fetch("/api/pairing-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        await fetchSessions()
        resetForm()
        setShowForm(false)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred while submitting the form")
    }
    setSubmitting(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffa500"
      case "active":
        return "#4caf50"
      case "completed":
        return "#2196f3"
      case "cancelled":
        return "#f44336"
      default:
        return "#gray"
    }
  }

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.username : "Unknown"
  }

  const getProjectTitle = (projectId) => {
    const project = projects.find((p) => p.id === projectId)
    return project ? project.title : "Unknown"
  }

  return (
    <div className="sessions-page">
      <div className="page-header">
        <h1>Pairing Sessions</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Create New Session"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>Create New Pairing Session</h2>
          <Formik
            initialValues={{
              user_id: "",
              project_id: "",
              status: "pending",
              notes: "",
              duration_minutes: "",
              rating: "",
            }}
            validationSchema={SessionSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="session-form">
                <div className="form-group">
                  <label htmlFor="user_id">Developer</label>
                  <Field as="select" name="user_id" className="form-control">
                    <option value="">Select a developer</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="user_id" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="project_id">Project</label>
                  <Field as="select" name="project_id" className="form-control">
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="project_id" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <Field as="select" name="status" className="form-control">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <Field as="textarea" name="notes" className="form-control" rows="3" />
                  <ErrorMessage name="notes" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="duration_minutes">Duration (minutes)</label>
                  <Field type="number" name="duration_minutes" className="form-control" />
                  <ErrorMessage name="duration_minutes" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="rating">Rating (1-5)</label>
                  <Field type="number" name="rating" className="form-control" min="1" max="5" />
                  <ErrorMessage name="rating" component="div" className="error-message" />
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? "Creating..." : "Create Session"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      <div className="sessions-grid">
        {sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-header">
              <h3>{getProjectTitle(session.project_id)}</h3>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(session.status) }}>
                {session.status}
              </span>
            </div>
            <p className="session-user">
              <strong>Developer:</strong> {getUserName(session.user_id)}
            </p>
            {session.notes && (
              <p className="session-notes">
                <strong>Notes:</strong> {session.notes}
              </p>
            )}
            {session.duration_minutes && (
              <p className="session-duration">
                <strong>Duration:</strong> {session.duration_minutes} minutes
              </p>
            )}
            {session.rating && (
              <p className="session-rating">
                <strong>Rating:</strong> {session.rating}/5 ⭐
              </p>
            )}
            <p className="session-created">
              <strong>Created:</strong> {new Date(session.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PairingSessions
