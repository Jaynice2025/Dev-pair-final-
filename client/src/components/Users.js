"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"

const UserSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  bio: Yup.string().max(500, "Bio must be less than 500 characters"),
  github_username: Yup.string().matches(
    /^[a-zA-Z0-9-]+$/,
    "GitHub username can only contain letters, numbers, and hyphens",
  ),
  skills: Yup.string().required("Skills are required"),
  experience_level: Yup.string()
    .oneOf(["beginner", "intermediate", "advanced"], "Please select a valid experience level")
    .required("Experience level is required"),
})

function Users() {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        await fetchUsers()
        resetForm()
        setEditingUser(null)
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

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          await fetchUsers()
        }
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setShowForm(false)
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Developers</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Developer"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingUser ? "Edit Developer" : "Add New Developer"}</h2>
          <Formik
            initialValues={{
              username: editingUser?.username || "",
              email: editingUser?.email || "",
              bio: editingUser?.bio || "",
              github_username: editingUser?.github_username || "",
              skills: editingUser?.skills || "",
              experience_level: editingUser?.experience_level || "",
            }}
            validationSchema={UserSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="user-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Field type="text" name="username" className="form-control" />
                  <ErrorMessage name="username" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field type="email" name="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <Field as="textarea" name="bio" className="form-control" rows="3" />
                  <ErrorMessage name="bio" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="github_username">GitHub Username</label>
                  <Field type="text" name="github_username" className="form-control" />
                  <ErrorMessage name="github_username" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="skills">Skills (comma-separated)</label>
                  <Field type="text" name="skills" className="form-control" />
                  <ErrorMessage name="skills" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="experience_level">Experience Level</label>
                  <Field as="select" name="experience_level" className="form-control">
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Field>
                  <ErrorMessage name="experience_level" component="div" className="error-message" />
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? "Submitting..." : editingUser ? "Update" : "Create"}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      <div className="users-grid">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-header">
              <h3>{user.username}</h3>
              <span className={`experience-badge ${user.experience_level}`}>{user.experience_level}</span>
            </div>
            <p className="user-email">{user.email}</p>
            {user.bio && <p className="user-bio">{user.bio}</p>}
            {user.github_username && (
              <p className="user-github">
                GitHub:{" "}
                <a href={`https://github.com/${user.github_username}`} target="_blank" rel="noopener noreferrer">
                  {user.github_username}
                </a>
              </p>
            )}
            <p className="user-skills">
              <strong>Skills:</strong> {user.skills}
            </p>
            <div className="user-actions">
              <button onClick={() => handleEdit(user)} className="btn btn-sm btn-secondary">
                Edit
              </button>
              <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-danger">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Users
