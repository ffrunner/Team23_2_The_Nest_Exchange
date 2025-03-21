import psycopg2

def test_postgres_connection(db_uri):
    try:
        connection = psycopg2.connect(db_uri)
        connection.close()
        return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

db_uri = "postgresql://postgres:Team23_2@database-1.cjm0e6m6u6vm.us-east-2.rds.amazonaws.com:5432/postgres"

if test_postgres_connection(db_uri):
    print("PostgreSQL connection successful!")
else:
    print("PostgreSQL connection failed.")