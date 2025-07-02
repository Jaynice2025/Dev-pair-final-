"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Calendar, Code, Plus, Search, Edit, Trash2 } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

interface PairingSession {
  id: number
  title: string
  description: string
  skill_name: string
  creator_name: string
  duration_hours: number
  status: string
  created_at: string
}

interface Skill {
  id: number
  name: string
}

const sessionSchema = Yup.object({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .required("Description is required"),
  skill_id: Yup.number().positive("Please select a skill").required("Skill is required"),
  duration_hours: Yup.number()
    .min(0.5, "Duration must be at least 0.5 hours")
    .max(8, "Duration cannot exceed 8 hours")
    .required("Duration is required"),
})

export default function Sessions() {
  const [sessions, setSessions] = useState<PairingSession[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<PairingSession | null>(null)

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      skill_id: "",
      duration_hours: 2,
    },
    validationSchema: sessionSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const url = editingSession
          ? `http://localhost:5000/api/sessions/${editingSession.id}`
          : "http://localhost:5000/api/sessions"

        const method = editingSession ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            user_id: 1, // Mock user ID
          }),
        })

        if (response.ok) {
          await fetchSessions()
          resetForm()
          setIsCreateDialogOpen(false)
          setEditingSession(null)
        }
      } catch (error) {
        console.error("Error saving session:", error)
      }
    },
  })

  useEffect(() => {
    fetchSessions()
    fetchSkills()
  }, [])

  useEffect(() => {
    if (editingSession) {
      formik.setValues({
        title: editingSession.title,
        description: editingSession.description,
        skill_id: "", // Would need skill_id from backend
        duration_hours: editingSession.duration_hours,
      })
    }
  }, [editingSession])

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error("Error fetching sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSkills = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/skills")
      const data = await response.json()
      setSkills(data)
    } catch (error) {
      console.error("Error fetching skills:", error)
    }
  }

  const deleteSession = async (sessionId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchSessions()
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.skill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.creator_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openCreateDialog = () => {
    setEditingSession(null)
    formik.resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (session: PairingSession) => {
    setEditingSession(session)
    setIsCreateDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pairing Sessions</h1>
            <p className="text-gray-600">Manage and join coding sessions</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingSession ? "Edit Session" : "Create New Session"}</DialogTitle>
                <DialogDescription>
                  {editingSession
                    ? "Update your pairing session details."
                    : "Create a new pairing session for other developers to join."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., React Hooks Deep Dive"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-sm text-red-600 mt-1">{formik.errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Describe what you'll be working on..."
                    rows={3}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <p className="text-sm text-red-600 mt-1">{formik.errors.description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="skill_id">Primary Skill</Label>
                  <Select
                    name="skill_id"
                    value={formik.values.skill_id}
                    onValueChange={(value) => formik.setFieldValue("skill_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id.toString()}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.skill_id && formik.errors.skill_id && (
                    <p className="text-sm text-red-600 mt-1">{formik.errors.skill_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="duration_hours">Duration (hours)</Label>
                  <Input
                    id="duration_hours"
                    name="duration_hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="8"
                    value={formik.values.duration_hours}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.duration_hours && formik.errors.duration_hours && (
                    <p className="text-sm text-red-600 mt-1">{formik.errors.duration_hours}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formik.isSubmitting}>
                    {editingSession ? "Update Session" : "Create Session"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search sessions by title, skill, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? "No sessions match your search" : "No pairing sessions available yet"}
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Badge variant={session.status === "active" ? "default" : "secondary"}>{session.status}</Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{session.skill_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">by {session.creator_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{session.duration_hours}h session</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Join Session
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(session)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteSession(session.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
