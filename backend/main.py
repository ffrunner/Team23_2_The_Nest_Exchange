from flask import request, jsonify, session
from werkzeug.security import check_password_hash
from config import app, db
from models import Users

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required'}), 400

    user = Users.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        session['user_id'] = user.id  # Store user ID in session
        session['role'] = user.role # store the user role in session
        return jsonify({'message': 'Login successful', 'role': user.role}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    """Handles user logout."""
    session.pop('user_id', None)  # Remove user ID from session
    session.pop('role', None) # remove role from session
    return jsonify({'message': 'Logout successful'}), 200

# Example route requiring login
def login_required(f):
    """Decorator to require login for a route."""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Login required'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Example route requiring a specific role
def role_required(role):
    """Decorator to require a specific role for a route."""
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if 'role' not in session or session['role'] != role:
                return jsonify({'message': 'Unauthorized. Role required: ' + role}), 403
            return f(*args, **kwargs)
        decorated_function.__name__ = f.__name__
        return decorated_function
    return decorator

@app.route('/protected', methods=['GET'])
@login_required
def protected_route():
    """Example protected route."""
    user = Users.query.get(session['user_id'])
    return jsonify({'message': f'Hello, {user.username}! This is a protected route.'}), 200

@app.route('/lister-only', methods=['GET'])
@login_required
@role_required('lister')
def lister_route():
    """Example lister-only route."""
    return jsonify({'message': 'This route is only for listers.'}), 200

print("Flask app starting")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
