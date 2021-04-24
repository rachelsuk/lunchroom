"""CRUD operations."""

from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score, connect_to_db


def get_user_by_email(email):
    """Get user by email."""

    user = db.session.query(User).filter(User.email == email).first()

    return user
