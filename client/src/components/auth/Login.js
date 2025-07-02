"use client"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAuth } from "../../contexts/AuthContext"

const LoginSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
})

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const result = await login(values.username, values.password)

    if (result.success) {
      navigate("/dashboard")
    } else {
      setFieldError("password", result.error)
    }

    setSubmitting(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your DevPair account</p>
        </div>

        <Formik initialValues={{ username: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <Field type="text" name="username" className="form-control" placeholder="Enter your username" />
                <ErrorMessage name="username" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field type="password" name="password" className="form-control" placeholder="Enter your password" />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-full">
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
