"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Mail, Code, Plus, Star, Trash2 } from "lucide-react"
import { useFormik } from "formik"
import * as Yup from "yup"

interface UserProfile {
  id: number
  name: string
  email: string
  created_at: string
}

interface UserSkill {
  id: number
  skill_name: string
  proficiency_level: number
}

interface Skill {
  id: number
  name: string
}

const profileSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
})

const skillSchema = Yup.object({
  skill_id: Yup.number().positive("Please select a skill").required("Skill is required"),
  proficiency_level: Yup.number()
    .min(1, "Proficiency level must be between 1 and 5")
    .max(5, "Proficiency level must be between 1 and 5")
    .required("Proficiency level is required"),
})

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [userSkills, setUserSkills] = useState<UserSkill[]>([])
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false)

  const profileFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch("http://localhost:5000/api/users/1", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        if (response.ok) {
          await fetchProfile()
        }
      } catch (error) {
        console.error("Error updating profile:", error)
      }
    },
  })

  const skillFormik = useFormik({
    initialValues: {
      skill_id: "",
      proficiency_level: 3,
    },
    validationSchema: skillSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await fetch("http://localhost:5000/api/user-skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            user_id: 1, // Mock user ID
          }),
        })

        if (response.ok) {
          await fetchUserSkills()
          resetForm()
          setIsSkillDialogOpen(false)
        }
      } catch (error) {
        console.error("Error adding skill:", error)
      }
    },
  })

  useEffect(() => {
    fetchProfile()
    fetchUserSkills()
    fetchAvailableSkills()
  }, [])

  useEffect(() => {
    if (profile) {
      profileFormik.setValues({
        name: profile.name,
        email: profile.email,
      })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/1")
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSkills = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/1/skills")
      const data = await response.json()
      setUserSkills(data)
    } catch (error) {
      console.error("Error fetching user skills:", error)
    }
  }

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/skills")
      const data = await response.json()
      setAvailableSkills(data)
    } catch (error) {
      console.error("Error fetching skills:", error)
    }
  }

  const deleteUserSkill = async (userSkillId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-skills/${userSkillId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchUserSkills()
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
    }
  }

  const getProficiencyLabel = (level: number) => {
    const labels = {
      1: "Beginner",
      2: "Novice",
      3: "Intermediate",
      4: "Advanced",
      5: "Expert",
    }
    return labels[level as keyof typeof labels] || "Unknown"
  }

  const getProficiencyColor = (level: number) => {
    if (level <= 2) return "bg-red-100 text-red-800"
    if (level === 3) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Profile</h1>
          <p className="text-gray-600">Manage your profile and skills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileFormik.handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileFormik.values.name}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    placeholder="Enter your full name"
                  />
                  {profileFormik.touched.name && profileFormik.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{profileFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileFormik.values.email}
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    placeholder="Enter your email address"
                  />
                  {profileFormik.touched.email && profileFormik.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{profileFormik.errors.email}</p>
                  )}
                </div>

                <Button type="submit" disabled={profileFormik.isSubmitting}>
                  Update Profile
                </Button>
              </form>

              {profile && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Management */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Technical Skills
                  </CardTitle>
                  <CardDescription>Manage your programming skills and proficiency levels</CardDescription>
                </div>

                <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Skill</DialogTitle>
                      <DialogDescription>
                        Add a new skill to your profile with your proficiency level.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={skillFormik.handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="skill_id">Skill</Label>
                        <Select
                          name="skill_id"
                          value={skillFormik.values.skill_id}
                          onValueChange={(value) => skillFormik.setFieldValue("skill_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSkills
                              .filter((skill) => !userSkills.some((us) => us.skill_name === skill.name))
                              .map((skill) => (
                                <SelectItem key={skill.id} value={skill.id.toString()}>
                                  {skill.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {skillFormik.touched.skill_id && skillFormik.errors.skill_id && (
                          <p className="text-sm text-red-600 mt-1">{skillFormik.errors.skill_id}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="proficiency_level">Proficiency Level</Label>
                        <Select
                          name="proficiency_level"
                          value={skillFormik.values.proficiency_level.toString()}
                          onValueChange={(value) =>
                            skillFormik.setFieldValue("proficiency_level", Number.parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Beginner</SelectItem>
                            <SelectItem value="2">2 - Novice</SelectItem>
                            <SelectItem value="3">3 - Intermediate</SelectItem>
                            <SelectItem value="4">4 - Advanced</SelectItem>
                            <SelectItem value="5">5 - Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        {skillFormik.touched.proficiency_level && skillFormik.errors.proficiency_level && (
                          <p className="text-sm text-red-600 mt-1">{skillFormik.errors.proficiency_level}</p>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsSkillDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={skillFormik.isSubmitting}>
                          Add Skill
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {userSkills.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No skills added yet</p>
                  <Button onClick={() => setIsSkillDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Skill
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userSkills.map((userSkill) => (
                    <div key={userSkill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Code className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{userSkill.skill_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < userSkill.proficiency_level ? "text-yellow-400 fill-current" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="secondary" className={getProficiencyColor(userSkill.proficiency_level)}>
                              {getProficiencyLabel(userSkill.proficiency_level)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => deleteUserSkill(userSkill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
