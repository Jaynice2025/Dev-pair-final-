"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchCurrentUser()
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }
  }, [darkMode])

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data)
      setDarkMode(response.data.dark_mode || false)
    } catch (error) {
      console.error("Error fetching current user:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      })

      const { access_token, refresh_token, user: userData } = response.data

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      setUser(userData)
      setDarkMode(userData.dark_mode || false)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData)

      const { access_token, refresh_token, user: newUser } = response.data

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      setUser(newUser)
      setDarkMode(newUser.dark_mode || false)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      delete axios.defaults.headers.common["Authorization"]
      setUser(null)
      setDarkMode(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/api/users/me", profileData)
      setUser(response.data)
      setDarkMode(response.data.dark_mode || false)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Profile update failed",
      }
    }
  }

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode
    try {
      await axios.put("/api/users/me", { dark_mode: newDarkMode })
      setDarkMode(newDarkMode)
      setUser((prev) => ({ ...prev, dark_mode: newDarkMode }))
    } catch (error) {
      console.error("Error updating dark mode:", error)
    }
  }

  const value = {
    user,
    loading,
    darkMode,
    login,
    register,
    logout,
    updateProfile,
    toggleDarkMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
