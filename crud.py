"""CRUD operations."""

from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score, connect_to_db
from sqlalchemy.sql import func
from sqlalchemy import desc


def get_user_by_email(email):
    """Get user by email."""

    user = db.session.query(User).filter(User.email == email).first()

    return user


def get_businesses_by_yelphelper_session_id(yelphelper_session_id):
    """Get businesses by yelphelper session id."""

    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    yelphelper_session_businesses = yelphelper_session.businesses

    return yelphelper_session_businesses


def get_ordered_total_scores(yelphelper_session_id):
    """Get businesses' total scores ordered for a yelphelper session."""
    ordered_total_scores = db.session.query(func.sum(Score.score).label("total_score"), Score.business_id.label(
        "business_id")).filter(Score.yelphelper_session_id == yelphelper_session_id).group_by(Score.business_id).order_by(desc(func.sum(Score.score))).all()

    return ordered_total_scores
