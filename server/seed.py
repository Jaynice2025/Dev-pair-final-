from app import create_app
from models import db, User, Project, PairingRequest, ProjectCollaborator, Milestone, Notification
from datetime import datetime
import json

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create users
        users_data = [
            {
                'username': 'alice_dev',
                'email': 'alice@example.com',
                'full_name': 'Alice Johnson',
                'bio': 'Full-stack developer passionate about React and Python. Love building scalable web applications.',
                'github_url': 'https://github.com/alice_codes',
                'linkedin_url': 'https://linkedin.com/in/alice-johnson',
                'portfolio_url': 'https://alice-portfolio.dev',
                'skills': 'React, Python, JavaScript, SQL, Node.js, MongoDB',
                'experience_level': 'intermediate',
                'is_available': True
            },
            {
                'username': 'bob_coder',
                'email': 'bob@example.com',
                'full_name': 'Bob Smith',
                'bio': 'Backend specialist with expertise in APIs and microservices. DevOps enthusiast.',
                'github_url': 'https://github.com/bob_backend',
                'linkedin_url': 'https://linkedin.com/in/bob-smith',
                'skills': 'Python, Flask, PostgreSQL, Docker, AWS, Kubernetes',
                'experience_level': 'advanced',
                'is_available': True
            },
            {
                'username': 'charlie_newbie',
                'email': 'charlie@example.com',
                'full_name': 'Charlie Brown',
                'bio': 'Just started my coding journey! Eager to learn and collaborate with experienced developers.',
                'github_url': 'https://github.com/charlie_learns',
                'skills': 'HTML, CSS, JavaScript, Git',
                'experience_level': 'beginner',
                'is_available': True
            },
            {
                'username': 'diana_mobile',
                'email': 'diana@example.com',
                'full_name': 'Diana Rodriguez',
                'bio': 'Mobile app developer specializing in React Native and Flutter. UI/UX design enthusiast.',
                'github_url': 'https://github.com/diana_mobile',
                'portfolio_url': 'https://diana-apps.com',
                'skills': 'React Native, Flutter, Dart, TypeScript, Figma',
                'experience_level': 'advanced',
                'is_available': False
            }
        ]
        
        users = []
        for user_data in users_data:
            user = User(**user_data)
            user.set_password('password123')  # Set a default password
            users.append(user)
            db.session.add(user)
        
        db.session.commit()
        
        # Create projects
        projects_data = [
            {
                'title': 'E-commerce Platform',
                'description': 'Building a modern e-commerce platform with React frontend and Flask backend. Features include user authentication, product catalog, shopping cart, and payment integration.',
                'tech_stack': 'React, Flask, SQLAlchemy, Stripe API, Redis',
                'tags': 'ecommerce, web development, full-stack',
                'difficulty_level': 'advanced',
                'status': 'ongoing',
                'repository_url': 'https://github.com/alice_codes/ecommerce-platform',
                'max_collaborators': 3,
                'owner_id': users[0].id
            },
            {
                'title': 'Task Management App',
                'description': 'Simple yet powerful task management application with real-time collaboration features. Perfect for teams and individuals.',
                'tech_stack': 'React, Node.js, Socket.io, MongoDB',
                'tags': 'productivity, collaboration, real-time',
                'difficulty_level': 'intermediate',
                'status': 'ongoing',
                'repository_url': 'https://github.com/bob_backend/task-manager',
                'demo_url': 'https://task-manager-demo.herokuapp.com',
                'max_collaborators': 2,
                'owner_id': users[1].id
            },
            {
                'title': 'Weather Dashboard',
                'description': 'Interactive weather dashboard displaying current conditions and forecasts. Great beginner project with API integration.',
                'tech_stack': 'HTML, CSS, JavaScript, Weather API',
                'tags': 'beginner-friendly, api, dashboard',
                'difficulty_level': 'beginner',
                'status': 'completed',
                'repository_url': 'https://github.com/charlie_learns/weather-dashboard',
                'demo_url': 'https://charlie-weather.netlify.app',
                'max_collaborators': 2,
                'owner_id': users[2].id
            },
            {
                'title': 'Fitness Tracker Mobile App',
                'description': 'Cross-platform mobile app for tracking workouts, nutrition, and fitness goals. Includes social features and progress analytics.',
                'tech_stack': 'React Native, Firebase, Chart.js',
                'tags': 'mobile, health, fitness, social',
                'difficulty_level': 'advanced',
                'status': 'paused',
                'repository_url': 'https://github.com/diana_mobile/fitness-tracker',
                'max_collaborators': 4,
                'owner_id': users[3].id
            },
            {
                'title': 'Open Source Blog Engine',
                'description': 'Modern, fast, and SEO-friendly blog engine built with Next.js. Supports markdown, themes, and plugin system.',
                'tech_stack': 'Next.js, TypeScript, Tailwind CSS, MDX',
                'tags': 'open-source, blog, cms, seo',
                'difficulty_level': 'intermediate',
                'status': 'ongoing',
                'repository_url': 'https://github.com/alice_codes/blog-engine',
                'max_collaborators': 5,
                'owner_id': users[0].id
            }
        ]
        
        projects = []
        for project_data in projects_data:
            project = Project(**project_data)
            projects.append(project)
            db.session.add(project)
        
        db.session.commit()
        
        # Create pairing requests
        pairing_requests_data = [
            {
                'requester_id': users[1].id,  # Bob requesting to join Alice's e-commerce project
                'project_id': projects[0].id,
                'message': 'Hi Alice! I\'d love to help with the backend API development. I have extensive experience with Flask and can contribute to the payment integration.',
                'status': 'approved',
                'response_message': 'Great! Your backend expertise would be perfect for this project. Welcome aboard!'
            },
            {
                'requester_id': users[2].id,  # Charlie requesting to join Bob's task manager
                'project_id': projects[1].id,
                'message': 'This looks like a great project to learn from! I\'m new to React but eager to contribute and learn.',
                'status': 'pending'
            },
            {
                'requester_id': users[0].id,  # Alice requesting to join Diana's fitness app
                'project_id': projects[3].id,
                'message': 'I\'m interested in mobile development and would love to contribute to the web dashboard component.',
                'status': 'rejected',
                'response_message': 'Thanks for your interest! Currently focusing on mobile-only features, but will reach out for future web components.'
            },
            {
                'requester_id': users[3].id,  # Diana requesting to join Alice's blog engine
                'project_id': projects[4].id,
                'message': 'I\'d like to help with the UI/UX design and mobile responsiveness of the blog themes.',
                'status': 'approved',
                'response_message': 'Perfect! Your design skills would be invaluable for creating beautiful themes.'
            }
        ]
        
        for request_data in pairing_requests_data:
            pairing_request = PairingRequest(**request_data)
            db.session.add(pairing_request)
        
        db.session.commit()
        
        # Create project collaborators for approved requests
        collaborators_data = [
            {
                'user_id': users[1].id,  # Bob collaborating on Alice's e-commerce project
                'project_id': projects[0].id,
                'role': 'contributor'
            },
            {
                'user_id': users[3].id,  # Diana collaborating on Alice's blog engine
                'project_id': projects[4].id,
                'role': 'contributor'
            }
        ]
        
        for collaborator_data in collaborators_data:
            collaborator = ProjectCollaborator(**collaborator_data)
            db.session.add(collaborator)
        
        db.session.commit()
        
        # Create milestones
        milestones_data = [
            {
                'title': 'User Authentication System',
                'description': 'Implement JWT-based authentication with registration, login, and password reset functionality.',
                'project_id': projects[0].id,
                'is_completed': True,
                'completed_at': datetime.utcnow(),
                'due_date': datetime(2024, 2, 15)
            },
            {
                'title': 'Product Catalog API',
                'description': 'Create RESTful API endpoints for product management including CRUD operations and search functionality.',
                'project_id': projects[0].id,
                'is_completed': False,
                'due_date': datetime(2024, 3, 1)
            },
            {
                'title': 'Shopping Cart Implementation',
                'description': 'Build shopping cart functionality with add/remove items, quantity updates, and persistent storage.',
                'project_id': projects[0].id,
                'is_completed': False,
                'due_date': datetime(2024, 3, 15)
            },
            {
                'title': 'Real-time Task Updates',
                'description': 'Implement WebSocket connections for real-time task updates and collaboration features.',
                'project_id': projects[1].id,
                'is_completed': True,
                'completed_at': datetime.utcnow(),
                'due_date': datetime(2024, 1, 30)
            },
            {
                'title': 'User Dashboard',
                'description': 'Create comprehensive user dashboard with task analytics and progress tracking.',
                'project_id': projects[1].id,
                'is_completed': False,
                'due_date': datetime(2024, 2, 28)
            },
            {
                'title': 'Theme System',
                'description': 'Develop a flexible theme system allowing users to customize blog appearance.',
                'project_id': projects[4].id,
                'is_completed': False,
                'due_date': datetime(2024, 4, 1)
            }
        ]
        
        for milestone_data in milestones_data:
            milestone = Milestone(**milestone_data)
            db.session.add(milestone)
        
        db.session.commit()
        
        # Create notifications
        notifications_data = [
            {
                'user_id': users[0].id,  # Alice
                'title': 'New Pairing Request',
                'message': 'Bob Smith wants to collaborate on your E-commerce Platform project.',
                'type': 'pairing_request',
                'is_read': True
            },
            {
                'user_id': users[0].id,  # Alice
                'title': 'Pairing Request Update',
                'message': 'Diana Rodriguez wants to collaborate on your Open Source Blog Engine project.',
                'type': 'pairing_request',
                'is_read': False
            },
            {
                'user_id': users[1].id,  # Bob
                'title': 'Request Approved!',
                'message': 'Your request to join the E-commerce Platform has been approved!',
                'type': 'pairing_request_update',
                'is_read': False
            },
            {
                'user_id': users[2].id,  # Charlie
                'title': 'Milestone Completed',
                'message': 'Weather Dashboard project milestone "API Integration" has been completed.',
                'type': 'milestone',
                'is_read': True
            },
            {
                'user_id': users[3].id,  # Diana
                'title': 'Request Approved!',
                'message': 'Your request to join the Open Source Blog Engine has been approved!',
                'type': 'pairing_request_update',
                'is_read': False
            }
        ]
        
        for notification_data in notifications_data:
            notification = Notification(**notification_data)
            db.session.add(notification)
        
        db.session.commit()
        
        print("Database seeded successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {len(projects)} projects")
        print(f"Created {len(pairing_requests_data)} pairing requests")
        print(f"Created {len(collaborators_data)} collaborations")
        print(f"Created {len(milestones_data)} milestones")
        print(f"Created {len(notifications_data)} notifications")

if __name__ == '__main__':
    seed_data()
