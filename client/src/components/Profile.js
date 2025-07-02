"use client"

import { useState } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAuth } from "../contexts/AuthContext"
import { User, Mail, Github, Linkedin, Globe, Save, Edit } from "lucide-react"

const ProfileSchema = Yup.object().shape({
  full_name: Yup.string().min(2, "Full name must be at least 2 characters").required("Full name is required"),
  bio: Yup.string().max(500, "Bio must be less than 500 characters"),
  github_url: Yup.string()
    .url("Please enter a valid URL")
    .matches(/github\.com/, "Please enter a valid GitHub URL"),
  linkedin_url: Yup.string()
    .url("Please enter a valid URL")
    .matches(/linkedin\.com/, "Please enter a valid LinkedIn URL"),
  portfolio_url: Yup.string().url("Please enter a valid URL"),
  skills: Yup.string().required("Skills are required"),
  experience_level: Yup.string()
    .oneOf(["beginner", "intermediate", "advanced", "expert"], "Please select a valid experience level")
    .required("Experience level is required"),
})

function Profile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await updateProfile(values)

    if (result.success) {
      setUpdateMessage("Profile updated successfully!")
      setIsEditing(false)
      setTimeout(() => setUpdateMessage(""), 3000)
    } else {
      setUpdateMessage(`Error: ${result.error}`)
    }

    setSubmitting(false)
  }

  const skillsArray = user?.skills
    ? user.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : []

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={64} />
        </div>
        <div className="profile-info">
          <h1>{user?.full_name}</h1>
          <p className="username">@{user?.username}</p>
          <span className={`experience-badge ${user?.experience_level}`}>{user?.experience_level}</span>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="btn btn-outline">
          <Edit size={20} />
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {updateMessage && (
        <div className={`alert ${updateMessage.includes("Error") ? "alert-error" : "alert-success"}`}>
          {updateMessage}
        </div>
      )}

      {isEditing ? (
        <div className="profile-form-container">
          <Formik
            initialValues={{
              full_name: user?.full_name || "",
              bio: user?.bio || "",
              github_url: user?.github_url || "",
              linkedin_url: user?.linkedin_url || "",
              portfolio_url: user?.portfolio_url || "",
              skills: user?.skills || "",
              experience_level: user?.experience_level || "",
              is_available: user?.is_available || true,
            }}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="profile-form">
                <div className="form-section">
                  <h3>Basic Information</h3>

                  <div className="form-group">
                    <label htmlFor="full_name">Full Name</label>
                    <Field type="text" name="full_name" className="form-control" placeholder="Enter your full name" />
                    <ErrorMessage name="full_name" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">Bio</label>
                    <Field
                      as="textarea"
                      name="bio"
                      className="form-control"
                      rows="4"
                      placeholder="Tell us about yourself, your interests, and what you're working on..."
                    />
                    <ErrorMessage name="bio" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience_level">Experience Level</label>
                    <Field as="select" name="experience_level" className="form-control">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </Field>
                    <ErrorMessage name="experience_level" component="div" className="error-message" />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Links & Portfolio</h3>

                  <div className="form-group">
                    <label htmlFor="github_url">GitHub URL</label>
                    <Field
                      type="url"
                      name="github_url"
                      className="form-control"
                      placeholder="https://github.com/yourusername"
                    />
                    <ErrorMessage name="github_url" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="linkedin_url">LinkedIn URL</label>
                    <Field
                      type="url"
                      name="linkedin_url"
                      className="form-control"
                      placeholder="https://linkedin.com/in/yourusername"
                    />
                    <ErrorMessage name="linkedin_url" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="portfolio_url">Portfolio URL</label>
                    <Field
                      type="url"
                      name="portfolio_url"
                      className="form-control"
                      placeholder="https://yourportfolio.com"
                    />
                    <ErrorMessage name="portfolio_url" component="div" className="error-message" />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Skills & Availability</h3>

                  <div className="form-group">
                    <label htmlFor="skills">Skills (comma-separated)</label>
                    <Field
                      type="text"
                      name="skills"
                      className="form-control"
                      placeholder="JavaScript, React, Python, Node.js, etc."
                    />
                    <ErrorMessage name="skills" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <Field type="checkbox" name="is_available" />
                      Available for collaboration
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    <Save size={20} />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      ) : (
        <div className="profile-display">
          <div className="profile-section">
            <h3>About</h3>
            <div className="profile-field">
              <Mail size={20} />
              <span>{user?.email}</span>
            </div>
            {user?.bio && (
              <div className="profile-bio">
                <p>{user.bio}</p>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h3>Links</h3>
            <div className="profile-links">
              {user?.github_url && (
                <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="profile-link">
                  <Github size={20} />
                  GitHub
                </a>
              )}
              {user?.linkedin_url && (
                <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="profile-link">
                  <Linkedin size={20} />
                  LinkedIn
                </a>
              )}
              {user?.portfolio_url && (
                <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="profile-link">
                  <Globe size={20} />
                  Portfolio
                </a>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h3>Skills</h3>
            <div className="skills-list">
              {skillsArray.length > 0 ? (
                skillsArray.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="no-skills">No skills added yet</p>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h3>Availability</h3>
            <div className="availability-status">
              <div className={`status-indicator ${user?.is_available ? "available" : "unavailable"}`}></div>
              <span>{user?.is_available ? "Available for collaboration" : "Not available"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
