"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Plus, Edit, Trash2, Eye, Users, Calendar, Code, ExternalLink, Github, Globe, Target, CheckCircle, Clock, Search } from 'lucide-react'
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import axios from "axios"

const ProjectSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be less than 200 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters")
    .required("Description is required"),
  tech_stack: Yup.string().required("Tech stack is required"),
  difficulty_level: Yup.string()
    .oneOf(["beginner", "intermediate", "advanced"], "Please select a valid difficulty level")
    .required("Difficulty level is required"),
  status: Yup.string()
    .oneOf(["ongoing", "completed", "paused"], "Please select a valid status")
    .required("Status is required"),
  max_collaborators: Yup.number()
    .min(1, "Must allow at least 1 collaborator")
    .max(10, "Cannot exceed 10 collaborators")
    .required("Max collaborators is required")
})

function MyProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchMyProjects()
  }, [])

  const fetchMyProjects = async () => {
    try {
      const response = await axios.get('/api/users/me/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingProject) {
        await axios.put(`/api/projects/${editingProject.id}`, values)
      } else {
        await axios.post('/api/projects', values)
      }
      
      await fetchMyProjects()
      setShowForm(false)
      setEditingProject(null)
      resetForm()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Error saving project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/projects/${projectId}`)
        await fetchMyProjects()
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Error deleting project. Please try again.')
      }
    }
  }

  const openCreateForm = () => {
    setEditingProject(null)
    setShowForm(true)
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.tech_stack && project.tech_stack.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="my-projects-loading">
        <div className="loading-spinner"></div>
        <p>Loading your projects...</p>
      </div>
    )
  }

  return (
    <div className="my-projects">
      <div className="page-header">
        <div>
          <h1>My Projects</h1>
          <p>Manage your development projects and collaborations</p>
        </div>
        <button onClick={openCreateForm} className="btn btn-primary">
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search your projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <Code size={64} />
          <h3>{searchTerm ? 'No projects match your search' : 'No projects yet'}</h3>
          <p>
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first project to start collaborating with other developers'
            }
          </p>
          {!searchTerm && (
            <button onClick={openCreateForm} className="btn btn-primary">
              <Plus size={20} />
              Create Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <div className="project-badges">
                  <span className={`status-badge ${project.status}`}>{project.status}</span>
                  <span className={`difficulty-badge ${project.difficulty_level}`}>
                    {project.difficulty_level}
                  </span>
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              {project.tech_stack && (
                <div className="tech-stack">
                  {project.tech_stack.split(',').slice(0, 3).map((tech, index) => (
                    <span key={index} className="tech-tag">{tech.trim()}</span>
                  ))}
                  {project.tech_stack.split(',').length > 3 && (
                    <span className="tech-tag more">
                      +{project.tech_stack.split(',').length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="project-stats">
                <div className="stat-item">
                  <Users size={16} />
                  <span>{project.collaborators?.length || 0}/{project.max_collaborators}</span>
                </div>
                <div className="stat-item">
                  <Target size={16} />
                  <span>{project.milestones?.length || 0} milestones</span>
                </div>
                <div className="stat-item">
                  <Calendar size={16} />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="project-links">
                {project.repository_url && (
                  <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="project-link">
                    <Github size={16} />
                  </a>
                )}
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="project-link">
                    <Globe size={16} />
                  </a>
                )}
              </div>

              <div className="project-actions">
                <Link to={`/projects/${project.id}`} className="btn btn-outline btn-sm">
                  <Eye size={16} />
                  View
                </Link>
                <button onClick={() => handleEdit(project)} className="btn btn-outline btn-sm">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => handleDelete(project.id)} className="btn btn-danger btn-sm">
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            
            <Formik
              initialValues={{
                title: editingProject?.title || '',
                description: editingProject?.description || '',
                tech_stack: editingProject?.tech_stack || '',
                tags: editingProject?.tags || '',
                difficulty_level: editingProject?.difficulty_level || '',
                status: editingProject?.status || 'ongoing',
                repository_url: editingProject?.repository_url || '',
                demo_url: editingProject?.demo_url || '',
                max_collaborators: editingProject?.max_collaborators || 3,
                is_public: editingProject?.is_public !== false
              }}
              validationSchema={ProjectSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="project-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project Title</label>
                      <Field
                        type="text"
                        name="title"
                        placeholder="Enter project title"
                        className="form-control"
                      />
                      <ErrorMessage name="title" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label>Status</label>
                      <Field as="select" name="status" className="form-control">
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="paused">Paused</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="error-message" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      placeholder="Describe your project, its goals, and what you're looking for in collaborators..."
                      className="form-control"
                      rows="4"
                    />
                    <ErrorMessage name="description" component="div" className="error-message" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tech Stack (comma-separated)</label>
                      <Field
                        type="text"
                        name="tech_stack"
                        placeholder="React, Node.js, MongoDB, etc."
                        className="form-control"
                      />
                      <ErrorMessage name="tech_stack" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label>Tags (comma-separated)</label>
                      <Field
                        type="text"
                        name="tags"
                        placeholder="web development, open source, etc."
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Difficulty Level</label>
                      <Field as="select" name="difficulty_level" className="form-control">
                        <option value="">Select difficulty</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </Field>
                      <ErrorMessage name="difficulty_level" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label>Max Collaborators</label>
                      <Field
                        type="number"
                        name="max_collaborators"
                        min="1"
                        max="10"
                        className="form-control"
                      />
                      <ErrorMessage name="max_collaborators" component="div" className="error-message" />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Repository URL</label>
                      <Field
                        type="url"
                        name="repository_url"
                        placeholder="https://github.com/username/repo"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label>Demo URL</label>
                      <Field
                        type="url"
                        name="demo_url"
                        placeholder="https://your-demo.com"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <Field type="checkbox" name="is_public" />
                      Make this project public (visible to all users)
                    </label>
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)} 
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                      {isSubmitting 
                        ? (editingProject ? 'Updating...' : 'Creating...') 
                        : (editingProject ? 'Update Project' : 'Create Project')
                      }
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

export default MyProjects
