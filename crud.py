"""CRUD operations."""

from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score, connect_to_db


def get_user_by_email(email):
    """Get user by email."""

    user = db.session.query(User).filter(User.email == email).first()

    return user


def get_businesses_by_yelphelper_session_id(yelpehelper_session_id):
    """Get businesses by yelphelper session id."""

    yelphelper_session = YelpHelperSession.query.get(yelpehelper_session_id)
    yelphelper_session_businesses = yelphelper_session.businesses

    return yelphelper_session_businesses
