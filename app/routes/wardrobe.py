"""
Wardrobe management routes for Stycly
Handles user's private wardrobe operations
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from app import db
from app.models import User, WardrobeItem
from app.utils import login_required, allowed_file

wardrobe_bp = Blueprint('wardrobe', __name__, url_prefix='/wardrobe')


@wardrobe_bp.route('/')
@login_required
def index():
    """View user's wardrobe"""
    user_id = session.get('user_id')
    items = WardrobeItem.query.filter_by(user_id=user_id).order_by(WardrobeItem.created_at.desc()).all()
    return render_template('wardrobe.html', items=items)


@wardrobe_bp.route('/add', methods=['POST'])
@login_required
def add_item():
    """Add new item to wardrobe"""
    user_id = session.get('user_id')
    
    # Get form data
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    category = request.form.get('category', '').strip()
    size = request.form.get('size', '').strip()
    age_range = request.form.get('age_range', '').strip()
    color = request.form.get('color', '').strip()
    daily_price = request.form.get('daily_price', '0')
    stock = request.form.get('stock', '1')
    is_public = request.form.get('is_public') == 'on'
    
    # Validation
    errors = []
    
    if not title:
        errors.append('Title is required.')
    
    try:
        daily_price = float(daily_price)
        if daily_price < 0:
            errors.append('Daily price must be positive.')
    except ValueError:
        errors.append('Invalid daily price.')
        daily_price = 0.0
    
    try:
        stock = int(stock)
        if stock < 0:
            errors.append('Stock must be positive.')
    except ValueError:
        errors.append('Invalid stock value.')
        stock = 1
    
    # Handle image upload
    image_path = None
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid collisions
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            from flask import current_app
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            image_path = f'uploads/{filename}'
    
    if errors:
        for error in errors:
            flash(error, 'danger')
        return redirect(url_for('main.index') + '#wardrobe')
    
    # Create new wardrobe item
    item = WardrobeItem(
        user_id=user_id,
        title=title,
        description=description,
        category=category,
        size=size,
        age_range=age_range,
        color=color,
        daily_price=daily_price,
        stock=stock,
        image_path=image_path,
        is_public_for_rent=is_public
    )
    
    try:
        db.session.add(item)
        
        # Update user's last_item_insert_at
        user = User.query.get(user_id)
        user.last_item_insert_at = datetime.utcnow()
        
        db.session.commit()
        flash('Item added to your wardrobe successfully!', 'success')
    
    except Exception as e:
        db.session.rollback()
        flash('An error occurred while adding the item.', 'danger')
    
    return redirect(url_for('main.index') + '#wardrobe')


@wardrobe_bp.route('/edit/<int:item_id>', methods=['POST'])
@login_required
def edit_item(item_id):
    """Edit wardrobe item"""
    user_id = session.get('user_id')
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()
    
    if not item:
        flash('Item not found.', 'danger')
        return redirect(url_for('main.index') + '#wardrobe')
    
    # Update fields
    item.title = request.form.get('title', '').strip()
    item.description = request.form.get('description', '').strip()
    item.category = request.form.get('category', '').strip()
    item.size = request.form.get('size', '').strip()
    item.age_range = request.form.get('age_range', '').strip()
    item.color = request.form.get('color', '').strip()
    
    try:
        item.daily_price = float(request.form.get('daily_price', 0))
    except ValueError:
        item.daily_price = 0.0
    
    try:
        item.stock = int(request.form.get('stock', 1))
    except ValueError:
        item.stock = 1
    
    item.is_public_for_rent = request.form.get('is_public') == 'on'
    item.updated_at = datetime.utcnow()
    
    # Handle image upload if provided
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"{timestamp}_{filename}"
            
            from flask import current_app
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            item.image_path = f'uploads/{filename}'
    
    try:
        db.session.commit()
        flash('Item updated successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('An error occurred while updating the item.', 'danger')
    
    return redirect(url_for('main.index') + '#wardrobe')


@wardrobe_bp.route('/delete/<int:item_id>', methods=['POST'])
@login_required
def delete_item(item_id):
    """Delete wardrobe item"""
    user_id = session.get('user_id')
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()
    
    if not item:
        flash('Item not found.', 'danger')
        return redirect(url_for('main.index') + '#wardrobe')
    
    try:
        db.session.delete(item)
        db.session.commit()
        flash('Item deleted successfully.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('An error occurred while deleting the item.', 'danger')
    
    return redirect(url_for('main.index') + '#wardrobe')


@wardrobe_bp.route('/delete-all', methods=['POST'])
@login_required
def delete_wardrobe():
    """Delete all user's wardrobe items"""
    user_id = session.get('user_id')
    
    try:
        WardrobeItem.query.filter_by(user_id=user_id).delete()
        
        # Reset last_item_insert_at
        user = User.query.get(user_id)
        user.last_item_insert_at = None
        
        db.session.commit()
        flash('All wardrobe items deleted successfully.', 'success')
    except Exception as e:
        db.session.rollback()
        flash('An error occurred while deleting wardrobe.', 'danger')
    
    return redirect(url_for('main.index') + '#wardrobe')


@wardrobe_bp.route('/delete-account', methods=['POST'])
@login_required
def delete_account():
    """Delete user account and all associated data"""
    user_id = session.get('user_id')
    
    try:
        user = User.query.get(user_id)
        
        # SQLAlchemy cascade will handle deletion of wardrobe items and orders
        db.session.delete(user)
        db.session.commit()
        
        # Clear session
        session.clear()
        
        flash('Your account has been deleted successfully.', 'info')
        return redirect(url_for('main.index'))
    
    except Exception as e:
        db.session.rollback()
        flash('An error occurred while deleting your account.', 'danger')
        return redirect(url_for('main.index') + '#wardrobe')
