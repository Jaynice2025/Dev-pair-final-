"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Code, Users, Target, Zap, Github, ArrowRight, CheckCircle, Star } from 'lucide-react'

function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: <Users size={32} />,
      title: "Find Collaborators",
      description: "Connect with developers who share your interests and complement your skills"
    },
    {
      icon: <Code size={32} />,
      title: "Share Projects",
      description: "Post your projects and find talented developers to help bring them to life"
    },
    {
      icon: <Target size={32} />,
      title: "Track Progress",
      description: "Set milestones, track progress, and celebrate achievements together"
    },
    {
      icon: <Zap size={32} />,
      title: "Real-time Collaboration",
      description: "Stay connected with notifications, comments, and project updates"
    }
  ]

  const benefits = [
    "Build your portfolio with collaborative projects",
    "Learn from experienced developers",
    "Expand your professional network",
    "Gain real-world development experience",
    "Work on diverse and exciting projects"
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Connect. Collaborate. <span className="highlight">Create.</span>
          </h1>
          <p className="hero-subtitle">
            Join the premier platform for developers to find project partners, 
            share ideas, and build amazing software together.
          </p>
          
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-large">
                Go to Dashboard
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Active Developers</div>
            </div>
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Projects Created</div>
            </div>
            <div className="stat">
              <div className="stat-number">2000+</div>
              <div className="stat-label">Collaborations</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="code-window">
            <div className="window-header">
              <div className="window-controls">
                <span className="control red"></span>
                <span className="control yellow"></span>
                <span className="control green"></span>
              </div>
              <span className="window-title">DevPair.js</span>
            </div>
            <div className="code-content">
              <div className="code-line">
                <span className="code-keyword">const</span> 
                <span className="code-variable"> collaboration</span> 
                <span className="code-operator"> = </span>
                <span className="code-function">findPartners</span>
                <span className="code-punctuation">()</span>
              </div>
              <div className="code-line">
                <span className="code-keyword">await</span> 
                <span className="code-variable"> project</span>
                <span className="code-punctuation">.</span>
                <span className="code-function">build</span>
                <span className="code-punctuation">(</span>
                <span className="code-variable">together</span>
                <span className="code-punctuation">)</span>
              </div>
              <div className="code-line">
                <span className="code-function">celebrate</span>
                <span className="code-punctuation">(</span>
                <span className="code-string">'Success!'</span>
                <span className="code-punctuation">)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything you need to collaborate</h2>
            <p>Powerful tools designed to make developer collaboration seamless and productive</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How DevPair Works</h2>
            <p>Get started in minutes and find your next collaboration partner</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Showcase your skills, experience, and what you're passionate about building</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Discover Projects</h3>
                <p>Browse exciting projects or post your own ideas to attract collaborators</p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Start Collaborating</h3>
                <p>Send pairing requests, join teams, and start building amazing software together</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2>Why developers choose DevPair</h2>
              <p>
                Join thousands of developers who are accelerating their careers 
                and building incredible projects through collaboration.
              </p>
              
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index}>
                    <CheckCircle size={20} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {!user && (
                <Link to="/register" className="btn btn-primary">
                  Join DevPair Today
                  <ArrowRight size={20} />
                </Link>
              )}
            </div>

            <div className="benefits-visual">
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <Star size={16} />
                  <p>
                    "DevPair helped me find amazing collaborators for my open source project. 
                    The platform makes it so easy to connect with like-minded developers!"
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <Users size={20} />
                  </div>
                  <div className="author-info">
                    <div className="author-name">Sarah Chen</div>
                    <div className="author-title">Full Stack Developer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to start collaborating?</h2>
            <p>Join DevPair today and connect with developers from around the world</p>
            
            <div className="cta-actions">
              {user ? (
                <Link to="/projects" className="btn btn-primary btn-large">
                  Browse Projects
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-large">
                    Sign Up Free
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/projects" className="btn btn-outline btn-large">
                    Explore Projects
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <Code size={24} />
                <span>DevPair</span>
              </div>
              <p>Connecting developers worldwide</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-section">
                <h4>Platform</h4>
                <Link to="/projects">Browse Projects</Link>
                <Link to="/register">Sign Up</Link>
                <Link to="/login">Sign In</Link>
              </div>
              
              <div className="footer-section">
                <h4>Community</h4>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github size={16} />
                  GitHub
                </a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 DevPair. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
