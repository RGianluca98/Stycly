# Stycly - Children's Clothes Rental Platform

A complete, professional e-commerce web application for renting children's clothes, built with Flask, SQLAlchemy, and vanilla JavaScript.

## 🎨 Features

- **User Authentication**: Secure registration, login, password reset with email verification
- **Private Wardrobe**: Users can add, edit, and manage their clothing items
- **Public Catalog**: Browse and search available items with filters
- **Shopping Cart**: Add items, manage quantities, proceed to checkout
- **Rental Requests**: Complete rental booking system with date selection
- **Email Notifications**: Automated order confirmations and admin notifications
- **Responsive Design**: Mobile-first, beautiful UI with custom brand colors
- **Account Management**: Delete wardrobe or entire account functionality

## 📁 Project Structure

```
stycly/
├── app/
│   ├── __init__.py              # Application factory
│   ├── models.py                # Database models
│   ├── utils.py                 # Utility functions (email, decorators)
│   ├── routes/
│   │   ├── auth.py             # Authentication routes
│   │   ├── main.py             # Homepage and static pages
│   │   ├── wardrobe.py         # Wardrobe management
│   │   ├── shop.py             # Product catalog and cart
│   │   ├── orders.py           # Rental requests and orders
│   │   └── api.py              # AJAX API endpoints
│   ├── templates/
│   │   ├── base.html           # Base template with navigation
│   │   ├── index.html          # Main single-page layout
│   │   ├── login.html          # Login page
│   │   ├── register.html       # Registration page
│   │   ├── forgot_password.html
│   │   ├── reset_password.html
│   │   └── order_confirmation.html
│   └── static/
│       ├── css/
│       │   └── style.css       # Main stylesheet
│       ├── js/
│       │   ├── main.js         # Navigation, cart, general functionality
│       │   ├── products.js     # Product catalog and filtering
│       │   └── wardrobe.js     # Wardrobe management
│       └── uploads/            # User-uploaded images
├── run.py                       # Application entry point
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🚀 Installation and Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A Gmail account or SMTP server for email functionality (optional for development)

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd stycly

# Or simply extract the project folder
cd stycly
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
# On Windows: notepad .env
# On macOS/Linux: nano .env
```

**Required configurations in `.env`:**

```env
# Generate a secret key (run this in Python):
# python -c 'import secrets; print(secrets.token_hex(32))'
SECRET_KEY=your-generated-secret-key-here

# Database (SQLite for local development)
DATABASE_URI=sqlite:///stycly.db

# Email configuration (optional for development)
# For Gmail, enable "App Passwords" in your Google Account settings
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
ORDERS_EMAIL=orders@stycly.com

# Flask settings
FLASK_ENV=development
FLASK_DEBUG=True
```

### Step 5: Run the Application

```bash
python run.py
```

The application will start at `http://localhost:5000`

### Step 6: Create Your First Account

1. Open your browser and go to `http://localhost:5000`
2. Click "Login" → "Sign up"
3. Create an account
4. Start adding items to your wardrobe!

## 📧 Email Configuration

### For Development (Without Email)

The app will work without email configured. Email content will be logged to the console instead of being sent.

### For Production (With Real Email)

1. **Gmail**: 
   - Enable 2-factor authentication on your Google account
   - Generate an App Password: Google Account → Security → 2-Step Verification → App passwords
   - Use the generated password in `MAIL_PASSWORD`

2. **Other SMTP Servers**:
   - Update `MAIL_SERVER`, `MAIL_PORT`, and credentials in `.env`

## 🗄️ Database

### Local Development (SQLite)

The app uses SQLite by default, which creates a file `stycly.db` in your project directory. No additional setup required.

### Switching to PostgreSQL (Production)

1. Install PostgreSQL and create a database:

```sql
CREATE DATABASE stycly;
CREATE USER stycly_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE stycly TO stycly_user;
```

2. Update `.env`:

```env
DATABASE_URI=postgresql://stycly_user:your-password@localhost:5432/stycly
```

3. Install PostgreSQL driver:

```bash
pip install psycopg2-binary
```

4. The database tables will be created automatically on first run.

## 🌐 Deployment

### Deploying to a Web Host

1. **Choose a hosting provider** (e.g., Heroku, DigitalOcean, AWS, PythonAnywhere)

2. **Set up PostgreSQL database** on your hosting provider

3. **Configure environment variables** on the hosting platform (same as `.env` file)

4. **Update `requirements.txt`** if needed:

```bash
pip freeze > requirements.txt
```

5. **Set up WSGI server** (e.g., Gunicorn):

```bash
pip install gunicorn
gunicorn run:app
```

6. **Configure static files** - Ensure `/static/uploads/` directory is writable

### Example: Heroku Deployment

```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create stycly-app

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set MAIL_USERNAME=your-email
# ... set all other variables

# Deploy
git push heroku main

# Initialize database
heroku run python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

## 🎨 Customization

### Brand Colors

Edit `/app/static/css/style.css`:

```css
:root {
  --col-primario: #3A4C69;      /* Primary dark color */
  --col-secondario: #F2F4F7;    /* Light background */
  --col-accent: #7DB2E0;        /* Accent blue */
  --col-hover: #1468e5;         /* Hover state */
  --col-warm-beige: #E8D4C0;    /* Warm accent */
  --col-accent-yellow: #F7D774;  /* Yellow accent */
}
```

### Content

- **Hero Section**: Edit `/app/templates/index.html` - search for "Hero Section"
- **About Us**: Edit `/app/templates/index.html` - search for "About Section"
- **Contact Info**: Edit `/app/templates/base.html` - search for "Footer"

## 🔐 Security Considerations

- **Never commit `.env` file** to version control
- **Change SECRET_KEY** in production
- **Use strong passwords** for database and email
- **Enable HTTPS** in production
- **Regular backups** of database
- **Keep dependencies updated**: `pip install --upgrade -r requirements.txt`

## 🐛 Troubleshooting

### Database Errors

```bash
# Reset database (WARNING: Deletes all data)
rm stycly.db
python run.py  # Will recreate database
```

### Port Already in Use

```bash
# Change port in run.py
app.run(debug=True, port=5001)  # Use different port
```

### Import Errors

```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

### Email Not Sending

- Check SMTP credentials in `.env`
- Verify "App Password" is generated (for Gmail)
- Check console logs for error messages

## 📝 Key Files to Modify for Deployment

1. **Database Configuration**: Update `DATABASE_URI` in `.env`
2. **Email Settings**: Update SMTP settings in `.env`
3. **Secret Key**: Generate new `SECRET_KEY` for production
4. **Debug Mode**: Set `FLASK_DEBUG=False` in production
5. **Allowed Hosts**: Add your domain to any security configurations

## 🎯 Next Steps / Enhancements

- Add payment processing integration (Stripe, PayPal)
- Implement admin dashboard for order management
- Add image optimization and CDN support
- Implement real-time availability calendar
- Add user reviews and ratings
- Email marketing integration
- Multi-language support
- Advanced analytics and reporting

## 📄 License

This project is created for Stycly - Children's Fashion Rental Platform.

## 🤝 Support

For issues, questions, or contributions, please contact the development team.

---

**Happy Renting! 🎉**
