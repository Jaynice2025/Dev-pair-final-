from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity, get_jwt
from models import db, User, Project, PairingRequest, ProjectCollaborator, Milestone, Notification, Comment
from config import config
import os
import json
from datetime import datetime

def create_app(config_name=None):
    app = Flask(__name__)
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app.config.from_object(config[config_name])
    
    db.init_app(app)
    migrate = Migrate(app, db)
    CORS(app)
    jwt = JWTManager(app)
    
    # JWT token blacklist (in production, use Redis)
    blacklisted_tokens = set()
    
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload['jti'] in blacklisted_tokens
    
    # Helper function to create notifications
    def create_notification(user_id, title, message, notification_type):
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type
        )
        db.session.add(notification)
    
    # Authentication routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
            # Check if user already exists
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 400
            
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            
            user = User(
                username=data['username'],
                email=data['email'],
                full_name=data['full_name'],
                experience_level=data.get('experience_level', 'beginner')
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            
            return jsonify({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            user = User.query.filter_by(username=data['username']).first()
            
            if user and user.check_password(data['password']):
                access_token = create_access_token(identity=user.id)
                refresh_token = create_refresh_token(identity=user.id)
                
                return jsonify({
                    'access_token': access_token,
                    'refresh_token': refresh_token,
                    'user': user.to_dict()
                })
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
                
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/auth/logout', methods=['POST'])
    @jwt_required()
    def logout():
        jti = get_jwt()['jti']
        blacklisted_tokens.add(jti)
        return jsonify({'message': 'Successfully logged out'})
    
    @app.route('/api/auth/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh():
        current_user_id = get_jwt_identity()
        new_token = create_access_token(identity=current_user_id)
        return jsonify({'access_token': new_token})
    
    @app.route('/api/auth/me', methods=['GET'])
    @jwt_required()
    def get_current_user():
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        return jsonify(user.to_dict())
    
    # User profile routes
    @app.route('/api/users/<int:user_id>', methods=['GET'])
    def get_user_profile(user_id):
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict())
    
    @app.route('/api/users/me', methods=['PUT'])
    @jwt_required()
    def update_profile():
        try:
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            data = request.get_json()
            
            # Update allowed fields
            allowed_fields = ['full_name', 'bio', 'github_url', 'linkedin_url', 'portfolio_url', 'skills', 'experience_level', 'is_available', 'dark_mode']
            for field in allowed_fields:
                if field in data:
                    setattr(user, field, data[field])
            
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(user.to_dict())
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    # Projects routes
    @app.route('/api/projects', methods=['GET'])
    def get_projects():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        difficulty = request.args.get('difficulty', '')
        
        query = Project.query.filter_by(is_public=True)
        
        if search:
            query = query.filter(Project.title.contains(search) | Project.description.contains(search))
        
        if status:
            query = query.filter_by(status=status)
        
        if difficulty:
            query = query.filter_by(difficulty_level=difficulty)
        
        projects = query.order_by(Project.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'projects': [project.to_dict() for project in projects.items],
            'total': projects.total,
            'pages': projects.pages,
            'current_page': page
        })
    
    @app.route('/api/projects', methods=['POST'])
    @jwt_required()
    def create_project():
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            
            project = Project(
                title=data['title'],
                description=data['description'],
                tech_stack=data.get('tech_stack', ''),
                tags=data.get('tags', ''),
                difficulty_level=data['difficulty_level'],
                repository_url=data.get('repository_url', ''),
                demo_url=data.get('demo_url', ''),
                max_collaborators=data.get('max_collaborators', 5),
                owner_id=current_user_id
            )
            
            db.session.add(project)
            db.session.commit()
            
            return jsonify(project.to_dict()), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/projects/<int:project_id>', methods=['GET'])
    def get_project(project_id):
        project = Project.query.get_or_404(project_id)
        return jsonify(project.to_dict())
    
    @app.route('/api/projects/<int:project_id>', methods=['PUT'])
    @jwt_required()
    def update_project(project_id):
        try:
            current_user_id = get_jwt_identity()
            project = Project.query.get_or_404(project_id)
            
            if project.owner_id != current_user_id:
                return jsonify({'error': 'Unauthorized'}), 403
            
            data = request.get_json()
            allowed_fields = ['title', 'description', 'tech_stack', 'tags', 'difficulty_level', 'status', 'repository_url', 'demo_url', 'max_collaborators', 'is_public']
            
            for field in allowed_fields:
                if field in data:
                    setattr(project, field, data[field])
            
            project.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(project.to_dict())
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/projects/<int:project_id>', methods=['DELETE'])
    @jwt_required()
    def delete_project(project_id):
        current_user_id = get_jwt_identity()
        project = Project.query.get_or_404(project_id)
        
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(project)
        db.session.commit()
        
        return '', 204
    
    @app.route('/api/users/me/projects', methods=['GET'])
    @jwt_required()
    def get_my_projects():
        current_user_id = get_jwt_identity()
        projects = Project.query.filter_by(owner_id=current_user_id).order_by(Project.created_at.desc()).all()
        return jsonify([project.to_dict() for project in projects])
    
    # Pairing requests routes
    @app.route('/api/projects/<int:project_id>/pairing-requests', methods=['GET'])
    @jwt_required()
    def get_project_pairing_requests(project_id):
        current_user_id = get_jwt_identity()
        project = Project.query.get_or_404(project_id)
        
        if project.owner_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        requests = PairingRequest.query.filter_by(project_id=project_id).order_by(
            PairingRequest.created_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'requests': [req.to_dict() for req in requests.items],
            'total': requests.total,
            'pages': requests.pages,
            'current_page': page
        })
    
    @app.route('/api/projects/<int:project_id>/pairing-requests', methods=['POST'])
    @jwt_required()
    def create_pairing_request(project_id):
        try:
            current_user_id = get_jwt_identity()
            project = Project.query.get_or_404(project_id)
            
            # Check if user already has a request for this project
            existing_request = PairingRequest.query.filter_by(
                requester_id=current_user_id,
                project_id=project_id
            ).first()
            
            if existing_request:
                return jsonify({'error': 'You already have a request for this project'}), 400
            
            data = request.get_json()
            pairing_request = PairingRequest(
                requester_id=current_user_id,
                project_id=project_id,
                message=data.get('message', '')
            )
            
            db.session.add(pairing_request)
            
            # Create notification for project owner
            create_notification(
                project.owner_id,
                'New Pairing Request',
                f'{pairing_request.requester.username} wants to collaborate on {project.title}',
                'pairing_request'
            )
            
            db.session.commit()
            
            return jsonify(pairing_request.to_dict()), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/pairing-requests/<int:request_id>', methods=['PUT'])
    @jwt_required()
    def update_pairing_request(request_id):
        try:
            current_user_id = get_jwt_identity()
            pairing_request = PairingRequest.query.get_or_404(request_id)
            
            # Only project owner can update request status
            if pairing_request.project.owner_id != current_user_id:
                return jsonify({'error': 'Unauthorized'}), 403
            
            data = request.get_json()
            pairing_request.status = data['status']
            pairing_request.response_message = data.get('response_message', '')
            pairing_request.updated_at = datetime.utcnow()
            
            # If approved, add user as collaborator
            if data['status'] == 'approved':
                collaborator = ProjectCollaborator(
                    user_id=pairing_request.requester_id,
                    project_id=pairing_request.project_id,
                    role='contributor'
                )
                db.session.add(collaborator)
            
            # Create notification for requester
            status_message = {
                'approved': 'Your pairing request has been approved!',
                'rejected': 'Your pairing request has been rejected.'
            }
            
            create_notification(
                pairing_request.requester_id,
                'Pairing Request Update',
                status_message.get(data['status'], 'Your pairing request status has been updated.'),
                'pairing_request_update'
            )
            
            db.session.commit()
            
            return jsonify(pairing_request.to_dict())
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/users/me/pairing-requests', methods=['GET'])
    @jwt_required()
    def get_my_pairing_requests():
        current_user_id = get_jwt_identity()
        requests = PairingRequest.query.filter_by(requester_id=current_user_id).order_by(
            PairingRequest.created_at.desc()
        ).all()
        return jsonify([req.to_dict() for req in requests])
    
    # Milestones routes
    @app.route('/api/projects/<int:project_id>/milestones', methods=['GET'])
    def get_project_milestones(project_id):
        milestones = Milestone.query.filter_by(project_id=project_id).order_by(Milestone.created_at.asc()).all()
        return jsonify([milestone.to_dict() for milestone in milestones])
    
    @app.route('/api/projects/<int:project_id>/milestones', methods=['POST'])
    @jwt_required()
    def create_milestone(project_id):
        try:
            current_user_id = get_jwt_identity()
            project = Project.query.get_or_404(project_id)
            
            # Check if user is owner or collaborator
            is_collaborator = ProjectCollaborator.query.filter_by(
                user_id=current_user_id,
                project_id=project_id
            ).first()
            
            if project.owner_id != current_user_id and not is_collaborator:
                return jsonify({'error': 'Unauthorized'}), 403
            
            data = request.get_json()
            milestone = Milestone(
                title=data['title'],
                description=data.get('description', ''),
                project_id=project_id,
                due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
            )
            
            db.session.add(milestone)
            db.session.commit()
            
            return jsonify(milestone.to_dict()), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/milestones/<int:milestone_id>', methods=['PUT'])
    @jwt_required()
    def update_milestone(milestone_id):
        try:
            current_user_id = get_jwt_identity()
            milestone = Milestone.query.get_or_404(milestone_id)
            
            # Check if user is owner or collaborator
            is_collaborator = ProjectCollaborator.query.filter_by(
                user_id=current_user_id,
                project_id=milestone.project_id
            ).first()
            
            if milestone.project.owner_id != current_user_id and not is_collaborator:
                return jsonify({'error': 'Unauthorized'}), 403
            
            data = request.get_json()
            allowed_fields = ['title', 'description', 'is_completed', 'due_date']
            
            for field in allowed_fields:
                if field in data:
                    if field == 'due_date' and data[field]:
                        setattr(milestone, field, datetime.fromisoformat(data[field]))
                    elif field == 'is_completed' and data[field] and not milestone.is_completed:
                        milestone.is_completed = True
                        milestone.completed_at = datetime.utcnow()
                    else:
                        setattr(milestone, field, data[field])
            
            milestone.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify(milestone.to_dict())
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    @app.route('/api/milestones/<int:milestone_id>', methods=['DELETE'])
    @jwt_required()
    def delete_milestone(milestone_id):
        current_user_id = get_jwt_identity()
        milestone = Milestone.query.get_or_404(milestone_id)
        
        # Check if user is owner or collaborator
        is_collaborator = ProjectCollaborator.query.filter_by(
            user_id=current_user_id,
            project_id=milestone.project_id
        ).first()
        
        if milestone.project.owner_id != current_user_id and not is_collaborator:
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.session.delete(milestone)
        db.session.commit()
        
        return '', 204
    
    # Notifications routes
    @app.route('/api/users/me/notifications', methods=['GET'])
    @jwt_required()
    def get_notifications():
        current_user_id = get_jwt_identity()
        notifications = Notification.query.filter_by(user_id=current_user_id).order_by(
            Notification.created_at.desc()
        ).all()
        return jsonify([notification.to_dict() for notification in notifications])
    
    @app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
    @jwt_required()
    def mark_notification_read(notification_id):
        current_user_id = get_jwt_identity()
        notification = Notification.query.get_or_404(notification_id)
        
        if notification.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify(notification.to_dict())
    
    # Comments routes
    @app.route('/api/projects/<int:project_id>/comments', methods=['GET'])
    def get_project_comments(project_id):
        comments = Comment.query.filter_by(project_id=project_id).order_by(Comment.created_at.asc()).all()
        return jsonify([comment.to_dict() for comment in comments])
    
    @app.route('/api/projects/<int:project_id>/comments', methods=['POST'])
    @jwt_required()
    def create_comment(project_id):
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            
            comment = Comment(
                content=data['content'],
                author_id=current_user_id,
                project_id=project_id
            )
            
            db.session.add(comment)
            db.session.commit()
            
            return jsonify(comment.to_dict()), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    
    # Dashboard stats
    @app.route('/api/dashboard/stats', methods=['GET'])
    @jwt_required()
    def get_dashboard_stats():
        current_user_id = get_jwt_identity()
        
        # User's projects stats
        owned_projects = Project.query.filter_by(owner_id=current_user_id).count()
        completed_projects = Project.query.filter_by(owner_id=current_user_id, status='completed').count()
        
        # Collaboration stats
        collaborations = ProjectCollaborator.query.filter_by(user_id=current_user_id).count()
        
        # Pairing requests stats
        pending_requests = PairingRequest.query.filter_by(requester_id=current_user_id, status='pending').count()
        approved_requests = PairingRequest.query.filter_by(requester_id=current_user_id, status='approved').count()
        
        # Unread notifications
        unread_notifications = Notification.query.filter_by(user_id=current_user_id, is_read=False).count()
        
        return jsonify({
            'owned_projects': owned_projects,
            'completed_projects': completed_projects,
            'collaborations': collaborations,
            'pending_requests': pending_requests,
            'approved_requests': approved_requests,
            'unread_notifications': unread_notifications
        })
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
