"use client"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAuth } from "../../contexts/AuthContext"

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .required("Username is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  full_name: Yup.string().min(2, "Full name must be at least 2 characters").required("Full name is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  experience_level: Yup.string()
    .oneOf(["beginner", "intermediate", "advanced", "expert"], "Please select a valid experience level")
    .required("Experience level is required"),
})

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const { confirmPassword, ...userData } = values
    const result = await register(userData)

    if (result.success) {
      navigate("/dashboard")
    } else {
      if (result.error.includes("username")) {
        setFieldError("username", result.error)
      } else if (result.error.includes("email")) {
        setFieldError("email", result.error)
      } else {
        setFieldError("password", result.error)
      }
    }

    setSubmitting(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Join DevPair</h1>
          <p>Create your account and start collaborating</p>
        </div>

        <Formik
          initialValues={{
            username: "",
            email: "",
            full_name: "",
            password: "",
            confirmPassword: "",
            experience_level: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <Field type="text" name="username" className="form-control" placeholder="Choose a username" />
                <ErrorMessage name="username" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field type="email" name="email" className="form-control" placeholder="Enter your email" />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <Field type="text" name="full_name" className="form-control" placeholder="Enter your full name" />
                <ErrorMessage name="full_name" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="experience_level">Experience Level</label>
                <Field as="select" name="experience_level" className="form-control">
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </Field>
                <ErrorMessage name="experience_level" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field type="password" name="password" className="form-control" placeholder="Create a password" />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirm your password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
              </div>

              <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-full">
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
