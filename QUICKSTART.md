# Stycly - Quick Start Guide

Get up and running in 5 minutes!

## 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

## 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Generate a secret key
python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))" >> .env
```

**Note**: Email is optional for development. The app will work without it and log emails to console.

## 3. Run the Application

```bash
python run.py
```

## 4. Open Your Browser

Go to: **http://localhost:5000**

## 5. Create an Account

1. Click "Login" → "Sign up"
2. Fill in your details
3. Start exploring!

---

## What You Can Do

### As a User:
- Browse the product catalog
- Search and filter items by size, age, category
- Add items to your cart
- Submit rental requests with custom dates
- Manage your private wardrobe
- Add your own items for rent

### Testing Features:
1. **Register** - Create a new account
2. **Login** - Access your account
3. **Add Items** - Go to "Private Wardrobe" and add clothing items
4. **Browse Catalog** - Your items will appear in the public catalog
5. **Shopping Cart** - Add items to cart, adjust quantities
6. **Rental Request** - Complete the rental form
7. **Email Notifications** - Check console for email content (if email not configured)

---

## Default Credentials

There are no default admin credentials. Create your first account through the registration page.

---

## Troubleshooting

**Can't install requirements?**
```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Port 5000 already in use?**

Edit `run.py` and change:
```python
app.run(debug=True, port=5001)  # Use a different port
```

**Database errors?**

Delete the database file and restart:
```bash
rm stycly.db
python run.py
```

---

## Next Steps

See **README.md** for:
- Complete deployment instructions
- Production configuration
- PostgreSQL setup
- Email configuration
- Security best practices

Happy coding! 🚀
