#!/usr/bin/env python3
"""
Database Initialization Script for Render (PostgreSQL)
Run this ONCE after deploying to Render via Shell or render-cli
"""

import os
from app import create_app, db
from app.models import User, WardrobeItem
from werkzeug.security import generate_password_hash

def init_render_database():
    """Initialize Render PostgreSQL database with tables and sample data"""
    app = create_app()

    with app.app_context():
        print("=" * 60)
        print("🚀 RENDER DATABASE INITIALIZATION")
        print("=" * 60)

        # Show database info
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        db_type = 'PostgreSQL' if 'postgresql' in db_uri else 'SQLite'
        print(f"\n📊 Database Type: {db_type}")

        # Create all tables
        print("\n🔧 Creating database tables...")
        db.create_all()
        print("✅ Tables created successfully!")

        # Check if data already exists
        user_count = User.query.count()
        item_count = WardrobeItem.query.count()

        print(f"\n📊 Current database status:")
        print(f"   Users: {user_count}")
        print(f"   Products: {item_count}")

        if item_count > 0:
            print("\n⚠️  Database already contains data.")
            print("   Skipping sample data insertion to avoid duplicates.")
            return

        # Create admin user
        admin = User.query.filter_by(email='admin@stycly.com').first()
        if not admin:
            print("\n👤 Creating admin user...")
            admin = User(
                name='Admin Stycly',
                email='admin@stycly.com',
                password_hash=generate_password_hash('admin123', method='pbkdf2:sha256')
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created!")
        else:
            print("\n✅ Admin user already exists")

        # Create sample products
        print("\n📦 Adding sample products...")
        sample_products = [
            {
                'user_id': admin.id,
                'title': 'Vestito Elegante Rosa',
                'description': 'Bellissimo vestito elegante per bambina, perfetto per cerimonie e occasioni speciali.',
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
                'description': 'Completo elegante per bambino ideale per shooting fotografici e cerimonie.',
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
                'description': 'Vestito vintage in tessuto beige, perfetto per shooting fotografici retrò.',
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
                'description': 'Camicia bianca classica per bambino, perfetta per occasioni formali.',
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
                'description': 'Cappello vintage per completare il look dei tuoi shooting fotografici.',
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
            print(f"   ✅ {item_data['title']}")

        db.session.commit()
        print(f"\n✅ Successfully added {len(sample_products)} sample products!")

        # Final summary
        print("\n" + "=" * 60)
        print("✨ INITIALIZATION COMPLETE!")
        print("=" * 60)
        print(f"📊 Total Users: {User.query.count()}")
        print(f"📦 Total Products: {WardrobeItem.query.count()}")
        print(f"🌐 Public Products: {WardrobeItem.query.filter_by(is_public_for_rent=True).count()}")
        print("\n🔐 Admin Credentials:")
        print("   Email: admin@stycly.com")
        print("   Password: admin123")
        print("\n🌐 Your site is ready! Visit your Render URL to see it live.")
        print("=" * 60)

if __name__ == '__main__':
    init_render_database()
