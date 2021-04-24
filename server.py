"""Server for YelpHelper"""

from flask import Flask, render_template, request, redirect, url_for
import model
from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score
import yelp_api
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = os.environ['APP_KEY']


@app.route('/')
def homepage():
    return render_template('index.html')


@app.route('/login')
def login():
    return render_template('login.html')


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
                                address=address, distance=distance, session_id=yelphelper_session.session_id)
        db.session.add(new_business)
    db.session.commit()

    return "yelphelper session setup"


if __name__ == '__main__':
    model.connect_to_db(app)
    app.run(debug=True, host='0.0.0.0')
