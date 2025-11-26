"""
Database models for Stycly
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    """User account model"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login_at = db.Column(db.DateTime)
    last_item_insert_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    wardrobe_items = db.relationship('WardrobeItem', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.email}>'


class WardrobeItem(db.Model):
    """Wardrobe item model - clothes available for rent"""
    __tablename__ = 'wardrobe_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # dress, suit, casual, formal, etc.
    size = db.Column(db.String(20))  # XS, S, M, L, XL, etc.
    age_range = db.Column(db.String(50))  # 0-6m, 6-12m, 1-2y, etc.
    color = db.Column(db.String(50))
    daily_price = db.Column(db.Float, nullable=False, default=0.0)
    image_path = db.Column(db.String(255))
    stock = db.Column(db.Integer, default=1)
    is_public_for_rent = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='item', lazy='dynamic')
    
    def __repr__(self):
        return f'<WardrobeItem {self.title}>'


class PasswordResetToken(db.Model):
    """Password reset tokens"""
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    
    user = db.relationship('User', backref='reset_tokens')
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.used and datetime.utcnow() < self.expires_at
    
    def __repr__(self):
        return f'<PasswordResetToken {self.token}>'


class Order(db.Model):
    """Rental order/request"""
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for guest orders
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_total_days(self):
        """Calculate total rental days"""
        return (self.end_date - self.start_date).days + 1
    
    def get_total_price(self):
        """Calculate total estimated price"""
        total = 0
        days = self.get_total_days()
        for item in self.items:
            total += item.daily_price * item.quantity * days
        return total
    
    def __repr__(self):
        return f'<Order {self.id} - {self.email}>'


class OrderItem(db.Model):
    """Items in an order"""
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    wardrobe_item_id = db.Column(db.Integer, db.ForeignKey('wardrobe_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    daily_price = db.Column(db.Float, nullable=False)  # Store price at time of order
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'
