"""
API routes for Stycly
AJAX endpoints for frontend functionality
"""

from flask import Blueprint, jsonify, session
from datetime import datetime
from app import db
from app.models import User
from app.utils import login_required

api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/user/last-insert')
@login_required
def get_last_insert():
    """Get user's last item insert time"""
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    
    if user and user.last_item_insert_at:
        last_insert = user.last_item_insert_at.strftime('%B %d, %Y at %I:%M %p')
    else:
        last_insert = None
    
    return jsonify({'last_insert': last_insert})
