from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import re

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

db = SQLAlchemy(metadata=metadata)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    bio = db.Column(db.Text)
    github_url = db.Column(db.String(200))
    linkedin_url = db.Column(db.String(200))
    portfolio_url = db.Column(db.String(200))
    skills = db.Column(db.Text)  # JSON string of skills array
    experience_level = db.Column(db.String(20), nullable=False, default='beginner')
    avatar_url = db.Column(db.String(200))
    
    # Settings
    is_available = db.Column(db.Boolean, default=True)
    dark_mode = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owned_projects = db.relationship('Project', foreign_keys='Project.owner_id', backref='owner', lazy=True, cascade='all, delete-orphan')
    pairing_requests = db.relationship('PairingRequest', foreign_keys='PairingRequest.requester_id', backref='requester', lazy=True, cascade='all, delete-orphan')
    project_collaborations = db.relationship('ProjectCollaborator', backref='user', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy=True, cascade='all, delete-orphan')
    
    serialize_rules = ('-password_hash', '-owned_projects.owner', '-pairing_requests.requester', '-project_collaborations.user', '-notifications.user', '-comments.author')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @validates('email')
    def validate_email(self, key, email):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError('Invalid email format')
        return email
    
    @validates('experience_level')
    def validate_experience_level(self, key, level):
        valid_levels = ['beginner', 'intermediate', 'advanced', 'expert']
        if level not in valid_levels:
            raise ValueError(f'Experience level must be one of: {", ".join(valid_levels)}')
        return level
    
    def __repr__(self):
        return f'<User {self.username}>'

class Project(db.Model, SerializerMixin):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    tech_stack = db.Column(db.Text)  # JSON string of technologies
    tags = db.Column(db.Text)  # JSON string of tags
    difficulty_level = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='ongoing')  # ongoing, completed, paused
    repository_url = db.Column(db.String(200))
    demo_url = db.Column(db.String(200))
    is_public = db.Column(db.Boolean, default=True)
    max_collaborators = db.Column(db.Integer, default=5)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    pairing_requests = db.relationship('PairingRequest', backref='project', lazy=True, cascade='all, delete-orphan')
    milestones = db.relationship('Milestone', backref='project', lazy=True, cascade='all, delete-orphan')
    collaborators = db.relationship('ProjectCollaborator', backref='project', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='project', lazy=True, cascade='all, delete-orphan')
    
    serialize_rules = ('-owner.owned_projects', '-pairing_requests.project', '-milestones.project', '-collaborators.project', '-comments.project')
    
    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['ongoing', 'completed', 'paused']
        if status not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return status
    
    @validates('difficulty_level')
    def validate_difficulty_level(self, key, level):
        valid_levels = ['beginner', 'intermediate', 'advanced']
        if level not in valid_levels:
            raise ValueError(f'Difficulty level must be one of: {", ".join(valid_levels)}')
        return level
    
    def __repr__(self):
        return f'<Project {self.title}>'

class PairingRequest(db.Model, SerializerMixin):
    __tablename__ = 'pairing_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    response_message = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    
    serialize_rules = ('-requester.pairing_requests', '-project.pairing_requests')
    
    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['pending', 'approved', 'rejected']
        if status not in valid_statuses:
            raise ValueError(f'Status must be one of: {", ".join(valid_statuses)}')
        return status
    
    def __repr__(self):
        return f'<PairingRequest {self.requester.username} -> {self.project.title}>'

class ProjectCollaborator(db.Model, SerializerMixin):
    __tablename__ = 'project_collaborators'
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), default='contributor')  # admin, contributor
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    
    # Unique constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'project_id', name='unique_user_project_collaboration'),)
    
    serialize_rules = ('-user.project_collaborations', '-project.collaborators')
    
    @validates('role')
    def validate_role(self, key, role):
        valid_roles = ['admin', 'contributor']
        if role not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return role
    
    def __repr__(self):
        return f'<ProjectCollaborator {self.user.username} -> {self.project.title}>'

class Milestone(db.Model, SerializerMixin):
    __tablename__ = 'milestones'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    is_completed = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    
    serialize_rules = ('-project.milestones',)
    
    def __repr__(self):
        return f'<Milestone {self.title}>'

class Notification(db.Model, SerializerMixin):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # pairing_request, milestone, project_update, etc.
    is_read = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    serialize_rules = ('-user.notifications',)
    
    def __repr__(self):
        return f'<Notification {self.title}>'

class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    is_edited = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    
    serialize_rules = ('-author.comments', '-project.comments')
    
    def __repr__(self):
        return f'<Comment by {self.author.username}>'
