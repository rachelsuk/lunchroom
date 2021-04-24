"""Server for YelpHelper"""

from flask import Flask, render_template, request, redirect, url_for, flash, session
import model
import crud
from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score
import yelp_api
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = os.environ['APP_KEY']


@app.route('/')
def homepage():
    return render_template('index.html')


@app.route('/new-user', methods=['POST'])
def register_user():
    """Create a new user."""
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    phone = request.form.get('phone')
    email = request.form.get('email')
    password = request.form.get('password')

    if crud.get_user_by_email(email):
        flash('An account with that email already exists. Please try again.')
    else:
        new_user = User(fname=fname, lname=lname, phone=phone,
                        email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        flash('Your account was created successfully. You can now login')

    return redirect('/')


@app.route('/login', methods=['POST'])
def login():
    """Login a user."""
    email = request.form.get('email')
    password = request.form.get('password')
    user = crud.get_user_by_email(email)
    if user:
        if user.password == password:
            session['user_id'] = user.user_id
            flash('Logged in!')
        else:
            flash('Incorrect password')
    else:
        flash('User does not exist.')

    return redirect('/')


@app.route('/form')
def form():
    return render_template('form.html')


@app.route('/yelphelpersession-setup', methods=["POST"])
def yelphelper_session_setup():
    """Set up a yelphelper session"""

    # pull form data from POST request
    date = datetime.today()
    search_term = request.form.get("search_term")
    location = request.form.get("location")
    price = int(request.form.get("price"))

    # create YelpHelperSession object using form data and save to database
    yelphelper_session = YelpHelperSession(date=date, location=location, term=search_term,
                                           price=price)
    db.session.add(yelphelper_session)
    db.session.commit()

    # store yelphelper session id in flask session
    session['yelphelper_session_id'] = yelphelper_session.yelphelper_session_id

    # add user to YelpHelperSession by creating UserYelpHelperSession object (middle table)
    user_id = session['user_id']
    user_yelphelper_session = UserYelpHelperSession(
        user_id=user_id, yelphelper_session_id=yelphelper_session.yelphelper_session_id)
    db.session.add(user_yelphelper_session)

    # connect to yelp API and get 10 restaurants that fit form data criteria
    businesses = yelp_api.business_search(
        location, search_term, price)

    # loop through each restaurant
    for business in businesses:
        # pull business data from json and save to database
        alias = business.get("alias")
        name = business.get("name")
        image_url = business.get("image_url")
        url = business.get("url")
        review_count = int(business.get("review_count"))
        yelp_rating = int(business.get("rating"))
        price = len(business.get("price"))
        address = business.get("location").get("display_address")
        distance = int(business.get("distance"))
        new_business = Business(alias=alias, name=name, image_url=image_url,
                                url=url, review_count=review_count,
                                yelp_rating=yelp_rating, price=price,
                                address=address, distance=distance, yelphelper_session_id=yelphelper_session.yelphelper_session_id)
        db.session.add(new_business)
    db.session.commit()

    return redirect('/quiz')


@app.route('/quiz')
def quiz():
    user_id = session['user_id']
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    businesses = yelphelper_session.businesses
    return render_template('quiz.html', businesses=businesses)


if __name__ == '__main__':
    model.connect_to_db(app)
    app.run(debug=True, host='0.0.0.0')
