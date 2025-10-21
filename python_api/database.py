"""
Database connection and utilities
"""
import mysql.connector
from mysql.connector import Error
from contextlib import contextmanager
from typing import Optional
from config import settings

class DatabaseConnection:
    """Database connection manager"""
    
    @staticmethod
    def get_connection():
        """Create and return a database connection"""
        try:
            connection = mysql.connector.connect(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                database=settings.DB_NAME,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci',
                autocommit=False
            )
            
            if connection.is_connected():
                return connection
            else:
                raise Error("Failed to connect to database")
                
        except Error as e:
            print(f"Database connection error: {e}")
            raise
    
    @staticmethod
    @contextmanager
    def get_cursor(dictionary=True):
        """Context manager for database cursor"""
        connection = None
        cursor = None
        try:
            connection = DatabaseConnection.get_connection()
            cursor = connection.cursor(dictionary=dictionary)
            yield cursor
            connection.commit()
        except Error as e:
            if connection:
                connection.rollback()
            print(f"Database error: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

def get_db_connection():
    """Get database connection (compatibility function)"""
    return DatabaseConnection.get_connection()

def test_database_connection():
    """Test database connection"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT VERSION() as version")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return {"success": True, "version": result['version']}
    except Exception as e:
        return {"success": False, "error": str(e)}

