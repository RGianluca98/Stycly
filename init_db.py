#!/usr/bin/env python3
"""
Database Initialization Script
Creates database tables and populates with sample data for testing
"""

import os
from app import create_app, db
from app.models import User, WardrobeItem
from werkzeug.security import generate_password_hash

def init_database():
    """Initialize database with tables and sample data"""
    app = create_app()

    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("✅ Tables created successfully!")

        # Check if data already exists
        if WardrobeItem.query.first():
            print("⚠️  Database already contains data. Skipping sample data insertion.")
            print(f"   Current products count: {WardrobeItem.query.count()}")
            return

        # Create sample admin user if not exists
        admin = User.query.filter_by(email='admin@stycly.com').first()
        if not admin:
            print("\nCreating admin user...")
            admin = User(
                name='Admin Stycly',
                email='admin@stycly.com',
                password_hash=generate_password_hash('admin123', method='pbkdf2:sha256')
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created!")
            print("   Email: admin@stycly.com")
            print("   Password: admin123")
        else:
            print("\n✅ Admin user already exists")

        # Create sample products
        print("\nAdding sample products...")
        sample_products = [
            {
                'user_id': admin.id,
                'title': 'Vestito Elegante Rosa',
                'description': 'Bellissimo vestito elegante per bambina, perfetto per cerimonie e occasioni speciali. Tessuto di alta qualità con dettagli in pizzo.',
                'destination': 'Bambina',
                'category': 'Camicie',
                'size': 'M (4-5A)',
                'age_range': '4-5 anni',
                'color': 'Pink',
                'condition': 'Excellent',
                'stock': 1,
                'is_public_for_rent': True,
                'image_paths': '[]'
            },
            {
                'user_id': admin.id,
                'title': 'Completo Elegante Blu',
                'description': 'Completo elegante per bambino composto da camicia bianca e pantaloni blu. Ideale per shooting fotografici e cerimonie.',
                'destination': 'Bambino',
                'category': 'Bambino',
                'size': 'L (6-7A)',
                'age_range': '6-7 anni',
                'color': 'Blue',
                'condition': 'Like New',
                'stock': 2,
                'is_public_for_rent': True,
                'image_paths': '[]'
            },
            {
                'user_id': admin.id,
                'title': 'Vestito Vintage Beige',
                'description': 'Vestito vintage in tessuto beige, perfetto per shooting fotografici retrò. Dettagli unici e cuciture artigianali.',
                'destination': 'Bambina',
                'category': 'Camicie',
                'size': 'S (2-3A)',
                'age_range': '2-3 anni',
                'color': 'Beige',
                'condition': 'Vintage',
                'stock': 1,
                'is_public_for_rent': True,
                'image_paths': '[]'
            },
            {
                'user_id': admin.id,
                'title': 'Camicia Bianca Formale',
                'description': 'Camicia bianca classica per bambino, perfetta per occasioni formali. Tessuto di cotone di alta qualità.',
                'destination': 'Bambino',
                'category': 'Camicie',
                'size': 'M (4-5A)',
                'age_range': '4-5 anni',
                'color': 'White',
                'condition': 'New without Tags',
                'stock': 3,
                'is_public_for_rent': True,
                'image_paths': '[]'
            },
            {
                'user_id': admin.id,
                'title': 'Accessorio Props - Cappello',
                'description': 'Cappello vintage per completare il look dei tuoi shooting fotografici. Perfetto per bambini e bambine.',
                'destination': 'Stycly props',
                'category': 'Props',
                'size': 'Unica',
                'age_range': '2-8 anni',
                'color': 'Brown',
                'condition': 'Good',
                'stock': 2,
                'is_public_for_rent': True,
                'image_paths': '[]'
            }
        ]

        for item_data in sample_products:
            item = WardrobeItem(**item_data)
            db.session.add(item)
            print(f"   ✅ Added: {item_data['title']}")

        db.session.commit()
        print(f"\n✅ Successfully added {len(sample_products)} sample products!")

        # Display summary
        print("\n" + "="*50)
        print("DATABASE INITIALIZATION COMPLETE")
        print("="*50)
        print(f"📊 Total Users: {User.query.count()}")
        print(f"📦 Total Products: {WardrobeItem.query.count()}")
        print(f"🌐 Public Products: {WardrobeItem.query.filter_by(is_public_for_rent=True).count()}")
        print("\n🚀 You can now start the app with: python run.py")
        print("🌐 Then visit: http://127.0.0.1:5000")

if __name__ == '__main__':
    init_database()
