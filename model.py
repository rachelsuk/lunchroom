from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
from datetime import date

# https://stackabuse.com/using-sqlalchemy-with-flask-and-postgresql/
# https://hackersandslackers.com/flask-sqlalchemy-database-models/
# https://docs.sqlalchemy.org/en/13/orm/tutorial.html

app = Flask(__name__)
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    fname = db.Column(db.Text, nullable=False)
    lname = db.Column(db.Text, nullable=False)
    phone = db.Column(db.Text, nullable=False)
    email = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"<User {self.fname} {self.lname}>"


class YelpHelperSession(db.Model):
    __tablename__ = 'yelphelper_sessions'

    yelphelper_session_id = db.Column(
        db.Integer, autoincrement=True, primary_key=True)
    date = db.Column(db.Text, nullable=False)
    started = db.Column(db.Boolean, default=False)
    completed = db.Column(db.Boolean, default=False)
    max_distance = db.Column(db.Float)
    distance_matrix = db.Column(JSON)
    users = db.relationship("User",
                            secondary="users_yelphelper_sessions",
                            backref="yelphelper_sessions")

    def __repr__(self):
        return f"<YelpHelper Session {self.date}>"


class SearchCriteria(db.Model):
    __tablename__ = 'search_criterias'

    search_criteria_id = db.Column(
        db.Integer, autoincrement=True, primary_key=True)
    yelphelper_session_id = db.Column(db.Integer, db.ForeignKey(
        'yelphelper_sessions.yelphelper_session_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    term = db.Column(db.Text)
    price = db.Column(db.Integer)

    yelphelper_session = db.relationship(
        'YelpHelperSession', backref='search_criterias')

    def __repr__(self):
        return f"<Search Critera '{self.term}' for yelphelper session {self.yelphelper_session_id}>"


class UserYelpHelperSession(db.Model):
    __tablename__ = 'users_yelphelper_sessions'

    user_yelphelper_session_id = db.Column(
        db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    yelphelper_session_id = db.Column(db.Integer, db.ForeignKey(
        'yelphelper_sessions.yelphelper_session_id'))
    completed = db.Column(db.Boolean, default=False)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    is_host = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<User {self.user_id} YelpHelper Session {self.yelphelper_session_id}>"

    # type: distance based or location based.


class Business(db.Model):
    __tablename__ = 'businesses'

    business_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    alias = db.Column(db.Text)
    name = db.Column(db.Text)
    image_url = db.Column(db.Text)
    url = db.Column(db.Text)
    review_count = db.Column(db.Integer)
    yelp_rating = db.Column(db.Integer)
    price = db.Column(db.Integer)
    address = db.Column(db.Text)
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    yelphelper_session_id = db.Column(db.Integer, db.ForeignKey(
        'yelphelper_sessions.yelphelper_session_id'))

    yelphelper_session = db.relationship(
        'YelpHelperSession', backref='businesses')

    def __repr__(self):
        return f"<Business {self.name} for yelphelper session {self.yelphelper_session_id}>"


class Score(db.Model):
    __tablename__ = 'scores'

    score_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    business_id = db.Column(
        db.Integer, db.ForeignKey('businesses.business_id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    yelphelper_session_id = db.Column(db.Integer, db.ForeignKey(
        'yelphelper_sessions.yelphelper_session_id'))
    score = db.Column(db.Integer)

    business = db.relationship('Business', backref='scores')
    user = db.relationship('User', backref='scores')
    yelphelper_session = db.relationship('YelpHelperSession', backref='scores')

    def __repr__(self):
        return f"<Rating by user {self.user_id} for business {self.business_id} during yelphelper session {self.yelphelper_session_id}>"


class SavedBusiness(db.Model):
    __tablename__ = 'saved_businesses'
    saved_business_id = db.Column(
        db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    business_id = db.Column(
        db.Integer, db.ForeignKey('businesses.business_id'))
    business = db.relationship('Business')


def connect_to_db(app):
    """Connect the database to our Flask app."""

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///yelphelper'
    app.config["SQLALCHEMY_ECHO"] = False
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)

    print('Connected to the db!')


if __name__ == '__main__':
    from server import app

    connect_to_db(app)
    db.create_all()
