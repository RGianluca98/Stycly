"""
Main routes for Stycly
Handles homepage and static content sections
"""

from flask import Blueprint, render_template, request, flash
from app.utils import send_email
from flask import current_app

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    """Homepage - single page with all sections"""
    return render_template('index.html')


@main_bp.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission"""
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    message = request.form.get('message', '').strip()
    
    if not all([name, email, message]):
        flash('Please fill in all fields.', 'danger')
        return render_template('index.html')
    
    # Send contact email
    subject = f'Stycly Contact Form - {name}'
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #3A4C69; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background: #F2F4F7; border-radius: 8px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Message:</strong></p>
            <p>{message}</p>
        </div>
    </body>
    </html>
    """
    
    orders_email = current_app.config.get('ORDERS_EMAIL')
    send_email(orders_email, subject, html_body)
    
    flash('Thank you for your message! We will get back to you soon.', 'success')
    return render_template('index.html')
