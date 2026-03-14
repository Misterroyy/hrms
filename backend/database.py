import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv
import os

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "hrms_lite"),
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="hrms_pool",
    pool_size=10,
    **DB_CONFIG
)


def get_connection():
    return connection_pool.get_connection()


def get_db():
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()
