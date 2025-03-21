import pytest
from flask import Flask, session
from config import app, db
from werkzeug.security import generate_password_hash
from models import Users  # Replace with your app's imports

@pytest.fixture
def test_client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            # Create a test user
            hashed_password = generate_password_hash('testpassword')
            test_user = Users(username='testuser', password_hash=hashed_password, role='claimer', email='test@test.com')
            db.session.add(test_user)
            db.session.commit()
        yield client
        with app.app_context():
            db.session.remove()
            db.drop_all()

def test_login_success(test_client):
    response = test_client.post('/login', json={'username': 'testuser', 'password': 'testpassword'})
    assert response.status_code == 200
    assert response.json['message'] == 'Login successful'
    with test_client.session_transaction() as sess:
        assert 'user_id' in sess
        assert 'role' in sess

def test_login_invalid_username(test_client):
    response = test_client.post('/login', json={'username': 'invaliduser', 'password': 'testpassword'})
    assert response.status_code == 401
    assert response.json['message'] == 'Invalid username or password'
    with test_client.session_transaction() as sess:
        assert 'user_id' not in sess