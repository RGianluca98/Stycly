"""
Utility functions for Stycly
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from functools import wraps
from flask import session, redirect, url_for, flash, current_app
from datetime import datetime

def login_required(f):
    """Decorator to require login for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


def send_email(to_email, subject, html_body, plain_body=None):
    """
    Send email using SMTP
    
    Args:
        to_email: recipient email address
        subject: email subject
        html_body: HTML content of email
        plain_body: plain text version (optional, will use html_body if not provided)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Get email configuration from Flask app config
        mail_server = current_app.config.get('MAIL_SERVER')
        mail_port = current_app.config.get('MAIL_PORT')
        mail_use_tls = current_app.config.get('MAIL_USE_TLS')
        mail_username = current_app.config.get('MAIL_USERNAME')
        mail_password = current_app.config.get('MAIL_PASSWORD')
        mail_sender = current_app.config.get('MAIL_DEFAULT_SENDER')
        
        # Check if email is configured
        if not all([mail_server, mail_username, mail_password]):
            current_app.logger.warning('Email not configured. Email would be sent to: ' + to_email)
            current_app.logger.info(f'Subject: {subject}')
            current_app.logger.info(f'Body: {html_body}')
            return True  # Return True in development even if not configured
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = mail_sender
        msg['To'] = to_email
        
        # Attach plain text and HTML versions
        if plain_body:
            part1 = MIMEText(plain_body, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(html_body, 'html')
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(mail_server, mail_port) as server:
            if mail_use_tls:
                server.starttls()
            server.login(mail_username, mail_password)
            server.send_message(msg)
        
        return True
    
    except Exception as e:
        current_app.logger.error(f'Error sending email: {str(e)}')
        return False


def send_order_confirmation_email(order):
    """Send order confirmation email to customer"""
    subject = f'Stycly - Rental Request Confirmation #{order.id}'
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #3A4C69; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #3A4C69; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #F2F4F7; padding: 30px; border-radius: 0 0 8px 8px; }}
            .button {{ background: #7DB2E0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
            .item {{ background: white; padding: 15px; margin: 10px 0; border-radius: 6px; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>STYCLY</h1>
                <p>Children's Clothes Rental</p>
            </div>
            <div class="content">
                <h2>Thank you for your rental request!</h2>
                <p>Dear {order.name},</p>
                <p>We've received your rental request and will contact you shortly with a personalized quote.</p>
                
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> #{order.id}</p>
                <p><strong>Rental Period:</strong> {order.start_date.strftime('%B %d, %Y')} - {order.end_date.strftime('%B %d, %Y')} ({order.get_total_days()} days)</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Phone:</strong> {order.phone or 'Not provided'}</p>
                
                <h3>Items Requested:</h3>
                {''.join([f'<div class="item"><strong>{item.item.title}</strong><br>Quantity: {item.quantity} | Daily Price: €{item.daily_price:.2f}</div>' for item in order.items])}
                
                <p><strong>Estimated Total:</strong> €{order.get_total_price():.2f}</p>
                
                {f'<p><strong>Notes:</strong> {order.notes}</p>' if order.notes else ''}
                
                <p>We'll review your request and get back to you within 24 hours with availability confirmation and final pricing.</p>
                
                <div class="footer">
                    <p>© 2025 Stycly - Sustainable Kids Fashion Rental</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(order.email, subject, html_body)


def send_order_notification_email(order):
    """Send order notification to internal orders email"""
    subject = f'New Rental Request #{order.id} - {order.name}'
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #3A4C69; }}
            .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #7DB2E0; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background: #F2F4F7; padding: 30px; }}
            .item {{ background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #7DB2E0; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            th {{ background: #3A4C69; color: white; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 New Rental Request</h1>
            </div>
            <div class="content">
                <h2>Order #{order.id}</h2>
                <p><strong>Received:</strong> {order.created_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                
                <h3>Customer Information:</h3>
                <table>
                    <tr><td><strong>Name:</strong></td><td>{order.name}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>{order.email}</td></tr>
                    <tr><td><strong>Phone:</strong></td><td>{order.phone or 'Not provided'}</td></tr>
                </table>
                
                <h3>Rental Details:</h3>
                <table>
                    <tr><td><strong>Start Date:</strong></td><td>{order.start_date.strftime('%B %d, %Y')}</td></tr>
                    <tr><td><strong>End Date:</strong></td><td>{order.end_date.strftime('%B %d, %Y')}</td></tr>
                    <tr><td><strong>Total Days:</strong></td><td>{order.get_total_days()} days</td></tr>
                </table>
                
                <h3>Items Requested:</h3>
                {''.join([f'<div class="item"><strong>{item.item.title}</strong> (ID: {item.wardrobe_item_id})<br>Size: {item.item.size} | Age: {item.item.age_range}<br>Quantity: {item.quantity} | Daily Price: €{item.daily_price:.2f} | Subtotal: €{item.daily_price * item.quantity * order.get_total_days():.2f}</div>' for item in order.items])}
                
                <h3>Pricing Summary:</h3>
                <table>
                    <tr><td><strong>Estimated Total:</strong></td><td><strong>€{order.get_total_price():.2f}</strong></td></tr>
                </table>
                
                {f'<h3>Customer Notes:</h3><p>{order.notes}</p>' if order.notes else ''}
                
                <p><em>Please review this request and contact the customer within 24 hours.</em></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    orders_email = current_app.config.get('ORDERS_EMAIL')
    return send_email(orders_email, subject, html_body)


def send_password_reset_email(user, reset_url):
    """Send password reset email"""
    subject = 'Stycly - Password Reset Request'
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #3A4C69; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #3A4C69; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #F2F4F7; padding: 30px; border-radius: 0 0 8px 8px; }}
            .button {{ background: #7DB2E0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>STYCLY</h1>
                <p>Password Reset Request</p>
            </div>
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello {user.name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <a href="{reset_url}" class="button">Reset Password</a>
                
                <p>This link will expire in 1 hour.</p>
                
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                
                <div class="footer">
                    <p>© 2025 Stycly - Sustainable Kids Fashion Rental</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user.email, subject, html_body)


def allowed_file(filename):
    """Check if file extension is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
