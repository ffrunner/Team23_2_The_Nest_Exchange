from flask import request, jsonify, session
from werkzeug.security import check_password_hash
from config import app, db

class TestTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(255))

with app.app_context():
    db.create_all() 

@app.route('/test_db_connection')
def test_db_connection():
    try:
        result = TestTable.query.first()
        if result:
            return jsonify({'message': 'Database connection successful', 'data': result.data})
        else:
            return jsonify({'message': 'Database connection successful, but table is empty.'})
    except Exception as e:
        return jsonify({'message': 'Database connection failed', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 