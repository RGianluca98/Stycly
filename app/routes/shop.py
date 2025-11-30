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
    import json
    items = WardrobeItem.query.filter_by(is_public_for_rent=True).all()

    # Get current cart to calculate available stock
    cart = session.get('cart', {})

    products_data = []
    for item in items:
        # Calculate available stock (total stock - quantity in cart)
        quantity_in_cart = cart.get(str(item.id), 0)
        available_stock = (item.stock or 0) - quantity_in_cart

        # Only show items with available stock > 0
        if available_stock <= 0:
            continue

        # Parse image_paths JSON array
        image_paths = []
        if item.image_paths:
            try:
                image_paths = json.loads(item.image_paths)
            except:
                pass

        products_data.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'destination': item.destination,
            'category': item.category,
            'size': item.size,
            'age_range': item.age_range,
            'color': item.color,
            'condition': item.condition,
            'image_paths': image_paths,
            'stock': available_stock  # Send available stock, not total stock
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
    import json
    from flask import url_for
    cart = session.get('cart', {})

    if not cart:
        return jsonify({'items': [], 'total_items': 0})

    cart_items = []
    total_items = 0

    for item_id_str, quantity in cart.items():
        item = WardrobeItem.query.get(int(item_id_str))
        if item:
            # Get first image from image_paths JSON array
            image_path = 'https://via.placeholder.com/100x100?text=No+Image'
            if item.image_paths:
                try:
                    image_paths = json.loads(item.image_paths)
                    if image_paths and len(image_paths) > 0:
                        # Convert relative path to full URL
                        image_path = url_for('static', filename=image_paths[0])
                except:
                    pass

            cart_items.append({
                'id': item.id,
                'title': item.title,
                'size': item.size,
                'age_range': item.age_range,
                'image_path': image_path,
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


@shop_bp.route('/filters')
def get_filters():
    """Get available filter options based on actual data"""
    # Get all public items
    items = WardrobeItem.query.filter_by(is_public_for_rent=True).all()

    # Collect unique values for each filter
    categories = set()
    destinations = set()
    sizes = set()
    age_ranges = set()
    colors = set()
    conditions = set()

    for item in items:
        if item.category:
            categories.add(item.category)
        if item.destination:
            destinations.add(item.destination)
        if item.size:
            sizes.add(item.size)
        if item.age_range:
            age_ranges.add(item.age_range)
        if item.color:
            colors.add(item.color)
        if item.condition:
            conditions.add(item.condition)

    return jsonify({
        'categories': sorted(list(categories)),
        'destinations': sorted(list(destinations)),
        'sizes': sorted(list(sizes)),
        'age_ranges': sorted(list(age_ranges)),
        'colors': sorted(list(colors)),
        'conditions': sorted(list(conditions))
    })
