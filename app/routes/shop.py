"""
Shop routes for Stycly
Handles product catalog, search, and cart operations
"""

from flask import Blueprint, render_template, request, jsonify, session
from app.models import WardrobeItem
from app import db

shop_bp = Blueprint('shop', __name__, url_prefix='/shop')


@shop_bp.route('/products')
def products():
    """Get all public products (for AJAX loading)"""
    items = WardrobeItem.query.filter_by(is_public_for_rent=True).all()
    
    products_data = []
    for item in items:
        products_data.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'category': item.category,
            'size': item.size,
            'age_range': item.age_range,
            'color': item.color,
            'daily_price': item.daily_price,
            'image_path': item.image_path or 'https://via.placeholder.com/300x400?text=No+Image',
            'stock': item.stock
        })
    
    return jsonify(products_data)


@shop_bp.route('/cart/add', methods=['POST'])
def add_to_cart():
    """Add item to cart"""
    data = request.get_json()
    item_id = data.get('item_id')
    
    if not item_id:
        return jsonify({'success': False, 'message': 'Item ID required'}), 400
    
    # Get item from database
    item = WardrobeItem.query.get(item_id)
    if not item or not item.is_public_for_rent:
        return jsonify({'success': False, 'message': 'Item not found'}), 404
    
    # Initialize cart in session if not exists
    if 'cart' not in session:
        session['cart'] = {}
    
    cart = session['cart']
    item_id_str = str(item_id)
    
    # Check stock
    current_quantity = cart.get(item_id_str, 0)
    if current_quantity >= item.stock:
        return jsonify({'success': False, 'message': 'Maximum stock reached'}), 400
    
    # Add to cart
    cart[item_id_str] = current_quantity + 1
    session['cart'] = cart  # Trigger session modification
    session.modified = True
    
    return jsonify({
        'success': True,
        'message': 'Item added to cart',
        'cart_count': sum(cart.values())
    })


@shop_bp.route('/cart/update', methods=['POST'])
def update_cart():
    """Update cart item quantity"""
    data = request.get_json()
    item_id = data.get('item_id')
    quantity = data.get('quantity', 0)
    
    if not item_id:
        return jsonify({'success': False, 'message': 'Item ID required'}), 400
    
    try:
        quantity = int(quantity)
        if quantity < 0:
            quantity = 0
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid quantity'}), 400
    
    # Get item to check stock
    item = WardrobeItem.query.get(item_id)
    if not item:
        return jsonify({'success': False, 'message': 'Item not found'}), 404
    
    if quantity > item.stock:
        return jsonify({'success': False, 'message': f'Only {item.stock} available'}), 400
    
    # Update cart
    if 'cart' not in session:
        session['cart'] = {}
    
    cart = session['cart']
    item_id_str = str(item_id)
    
    if quantity == 0:
        # Remove from cart
        if item_id_str in cart:
            del cart[item_id_str]
    else:
        cart[item_id_str] = quantity
    
    session['cart'] = cart
    session.modified = True
    
    return jsonify({
        'success': True,
        'message': 'Cart updated',
        'cart_count': sum(cart.values())
    })


@shop_bp.route('/cart/remove', methods=['POST'])
def remove_from_cart():
    """Remove item from cart"""
    data = request.get_json()
    item_id = data.get('item_id')
    
    if not item_id:
        return jsonify({'success': False, 'message': 'Item ID required'}), 400
    
    if 'cart' not in session:
        session['cart'] = {}
    
    cart = session['cart']
    item_id_str = str(item_id)
    
    if item_id_str in cart:
        del cart[item_id_str]
        session['cart'] = cart
        session.modified = True
    
    return jsonify({
        'success': True,
        'message': 'Item removed from cart',
        'cart_count': sum(cart.values())
    })


@shop_bp.route('/cart/get')
def get_cart():
    """Get cart contents with item details"""
    cart = session.get('cart', {})
    
    if not cart:
        return jsonify({'items': [], 'total_items': 0})
    
    cart_items = []
    total_items = 0
    
    for item_id_str, quantity in cart.items():
        item = WardrobeItem.query.get(int(item_id_str))
        if item:
            cart_items.append({
                'id': item.id,
                'title': item.title,
                'size': item.size,
                'age_range': item.age_range,
                'daily_price': item.daily_price,
                'image_path': item.image_path or 'https://via.placeholder.com/100x100?text=No+Image',
                'quantity': quantity,
                'stock': item.stock
            })
            total_items += quantity
    
    return jsonify({
        'items': cart_items,
        'total_items': total_items
    })


@shop_bp.route('/cart/clear', methods=['POST'])
def clear_cart():
    """Clear entire cart"""
    session['cart'] = {}
    session.modified = True
    
    return jsonify({
        'success': True,
        'message': 'Cart cleared'
    })
