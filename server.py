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
    if 'user_id' in session:
        return redirect('/form')
    return render_template('index_react.html')


@app.route('/new-user')
def new_user():
    return render_template('new_user.html')


@app.route('/new-user', methods=['POST'])
def register_user():
    """Create a new user."""
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    phone = request.form.get('phone')
    email = request.form.get('email')
    password = request.form.get('password')

    if crud.get_user_by_email(email):
        message = 'An account with that email already exists. Please try again.'
    else:
        new_user = User(fname=fname, lname=lname, phone=phone,
                        email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        session['user_id'] = new_user.user_id
        message = 'success'

    return {'message': message}


@app.route('/login', methods=['POST'])
def login():
    """Login a user."""
    email = request.form.get('email')
    password = request.form.get('password')
    user = crud.get_user_by_email(email)
    if user:
        if user.password == password:
            session['user_id'] = user.user_id
            message = "success"
        else:
            message = "wrong password"
    else:
        message = "user does not exist"

    return {'message': message}


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
                                address=address, distance=distance, yelphelper_session_id=yelphelper_session.yelphelper_session_id)
        db.session.add(new_business)
    db.session.commit()

    return redirect(f'/invite/{yelphelper_session.yelphelper_session_id}')


@app.route('/invite/<yelphelper_session_id>')
def invite(yelphelper_session_id):
    # store yelphelper session id in flask session
    # NEED TO FIND ANOTHER WAY TO ACCESS YELPHELPER SESSION?
    session['yelphelper_session_id'] = yelphelper_session_id
    return render_template('invite.html')


@app.route('/yelphelper-session-participants.json', methods=['GET', 'POST'])
def participants_data():
    yelphelper_session = YelpHelperSession.query.get(
        int(session['yelphelper_session_id']))
    logged_in = False
    if 'user_id' in session:
        logged_in = True
        # add user to YelpHelperSession by creating UserYelpHelperSession object (middle table)
        user_id = session['user_id']
        user_yelphelper_session = UserYelpHelperSession.query.filter_by(
            user_id=user_id, yelphelper_session_id=session['yelphelper_session_id']).first()
        if not user_yelphelper_session:
            user_yelphelper_session = UserYelpHelperSession(
                user_id=user_id, yelphelper_session_id=yelphelper_session.yelphelper_session_id)
            db.session.add(user_yelphelper_session)
            db.session.commit()
    participants = yelphelper_session.users
    participant_list = []
    for p in participants:
        participant_list.append({"fname": p.fname})
    if request.method == 'POST':
        yelphelper_session.started = True
        db.session.add(yelphelper_session)
        db.session.commit()
    return {"participants": participant_list, "logged_in": logged_in, "started": yelphelper_session.started}


@app.route('/quiz')
def quiz():
    return render_template('quiz_react.html')


@app.route('/businesses.json')
def businesses_data():
    yelphelper_session_businesses = crud.get_businesses_by_yelphelper_session_id(
        session['yelphelper_session_id'])
    businesses_list = []
    for b in yelphelper_session_businesses:
        businesses_list.append(
            {"alias": b.alias, "name": b.name, "yelp_rating": b.yelp_rating, "review_count": b.review_count, "image_url": b.image_url, "url": b.url})
    return {"businesses": businesses_list}


@app.route('/save-score', methods=['POST'])
def save_score():
    business_index = int(request.form.get('business-index'))
    score = int(request.form.get('score'))
    yelphelper_session_businesses = crud.get_businesses_by_yelphelper_session_id(
        session['yelphelper_session_id'])
    business = yelphelper_session_businesses[business_index]
    new_score = Score(business=business, user_id=session['user_id'],
                      yelphelper_session_id=session['yelphelper_session_id'], score=score)
    db.session.add(new_score)
    db.session.commit()
    return "score has been added."


@app.route('/user-completed', methods=['POST'])
def user_completed():
    user_id = session['user_id']
    yelphelper_session_id = session['yelphelper_session_id']
    user_yelphelper_session = UserYelpHelperSession.query.filter(
        UserYelpHelperSession.user_id == user_id, UserYelpHelperSession.yelphelper_session_id == yelphelper_session_id).first()
    user_yelphelper_session.completed = True
    db.session.add(user_yelphelper_session)
    db.session.commit()
    return "user has been updated."


@app.route('/check-all-completed', methods=['POST'])
def check_all_completed():
    yelphelper_session_id = session['yelphelper_session_id']
    all_completed = True
    for user in (crud.get_user_yelphelper_sessions(yelphelper_session_id)):
        if not user.completed:
            all_completed = False
            break
    if all_completed:
        yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
        yelphelper_session.completed = True
        db.session.add(yelphelper_session)
        db.session.commit()
    return {"all_completed": all_completed}


@app.route('/result')
def show_result():
    return render_template('result.html')


@app.route('/results.json')
def calculate_results():
    ordered_total_scores = crud.get_ordered_total_scores(
        session['yelphelper_session_id'])
    total_scores = []
    for total_score in ordered_total_scores:
        b = Business.query.get(total_score.business_id)
        total_scores.append({"alias": b.alias, "name": b.name, "yelp_rating": b.yelp_rating,
                            "review_count": b.review_count, "image_url": b.image_url, "url": b.url, "total_score": total_score.total_score})
    return {"total_scores": total_scores}


if __name__ == '__main__':
    model.connect_to_db(app)
    app.run(debug=True, host='0.0.0.0')
