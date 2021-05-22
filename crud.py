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


def get_user_yelphelper_sessions(yelphelper_session_id):
    """Get users_yelphelper_sessions for a yelphelper session."""
    users_yelphelper_sessions = db.session.query(UserYelpHelperSession).filter(
        UserYelpHelperSession.yelphelper_session_id == yelphelper_session_id).all()

    return users_yelphelper_sessions


def get_users_locations(yelphelper_session_id):
    users = get_user_yelphelper_sessions(yelphelper_session_id)
    users_locations = []
    for user in users:
        u = User.query.get(user.user_id)
        if (user.lat and user.lng):
            users_locations.append(
                {"fname": u.fname, "lat": user.lat, "lng": user.lng})
    return users_locations


def get_businesses_locations(yelphelper_session_id):
    businesses = get_businesses_by_yelphelper_session_id(yelphelper_session_id)
    businesses_locations = []
    for b in businesses:
        businesses_locations.append(
            {"alias": b.alias, "lat": b.lat, "lng": b.lng})
    return businesses_locations
