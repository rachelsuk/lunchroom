# TODO: CHROME EXTENSION: Save yelp restaurants

"""Server for YelpHelper"""

from flask import Flask, render_template, request, redirect, url_for, flash, session
import model
import crud
from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score, SearchCriteria, SavedBusiness
import yelp_api
import geocoding_api
import distance_matrix_api
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


@app.route('/check-login.json')
def check_login():
    logged_in = False
    if 'user_id' in session:
        logged_in = True
    return {'logged_in': logged_in}


@app.route('/new-user.json', methods=['POST'])
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


@app.route('/process-login.json', methods=['POST'])
def process_login():
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


@app.route('/process-logout')
def process_logout():
    """Logout a user."""
    session.clear()
    return "user has been logged out."


@app.route('/start-session')
def start_session():
    """Start a yelphelper session."""
    date = datetime.today()
    # create yelphelper session
    yelphelper_session = YelpHelperSession(date=date)
    db.session.add(yelphelper_session)
    db.session.commit()
    return redirect(f'/invite/{yelphelper_session.yelphelper_session_id}')


@app.route('/invite/<yelphelper_session_id>')
def invite(yelphelper_session_id):
    # store yelphelper session id in flask session
    session['yelphelper_session_id'] = yelphelper_session_id
    if 'user_id' in session:
        # add user to YelpHelperSession by creating UserYelpHelperSession object (middle table)
        user_id = session['user_id']
        user_yelphelper_session = UserYelpHelperSession.query.filter_by(
            user_id=user_id, yelphelper_session_id=session['yelphelper_session_id']).first()
        if not user_yelphelper_session:
            host_exists = UserYelpHelperSession.query.filter_by(
                yelphelper_session_id=session['yelphelper_session_id']).first()
            if not host_exists:
                user_yelphelper_session = UserYelpHelperSession(
                    user_id=user_id, yelphelper_session_id=session['yelphelper_session_id'], is_host=True)
            else:
                user_yelphelper_session = UserYelpHelperSession(
                    user_id=user_id, yelphelper_session_id=session['yelphelper_session_id'])
            db.session.add(user_yelphelper_session)
            db.session.commit()
    return render_template('invite.html')


@app.route('/check-host.json')
def check_host():
    yelphelper_session_id = session['yelphelper_session_id']
    user_id = session['user_id']
    user_yelphelper_session = UserYelpHelperSession.query.filter_by(
        user_id=user_id, yelphelper_session_id=yelphelper_session_id).first()
    is_host = user_yelphelper_session.is_host
    return {'is_host': is_host}


@app.route('/add-user-location', methods=['POST'])
def add_user_location():
    user_lat = request.form.get('lat')
    user_lng = request.form.get('lng')
    user_id = session['user_id']
    yelphelper_session_id = session['yelphelper_session_id']
    user_yelphelper_session = UserYelpHelperSession.query.filter(
        UserYelpHelperSession.user_id == user_id, UserYelpHelperSession.yelphelper_session_id == yelphelper_session_id).first()
    user_yelphelper_session.lat = user_lat
    user_yelphelper_session.lng = user_lng
    db.session.add(user_yelphelper_session)
    db.session.commit()
    return {"msg": "success"}


@app.route('/find-zipcode-coords.json')
def find_zipcode_coords():
    zipcode = request.args.get('zipcode')
    coords = geocoding_api.get_zipcode_coords(zipcode)
    return {"coords": coords}


@app.route('/add-search-criteria.json', methods=['POST'])
def add_search_criteria():
    yelphelper_session_id = session['yelphelper_session_id']
    user_id = session['user_id']

    # pull form data from POST request
    search_term = request.form.get("search_term")
    price = request.form.get("price")

    # create SearchCriteria object using form data and save to database
    search_criteria = SearchCriteria(
        yelphelper_session_id=yelphelper_session_id, user_id=user_id, term=search_term, price=price)
    db.session.add(search_criteria)
    db.session.commit()

    return {"msg": "success"}


@app.route('/waiting-room-start')
def waiting_room_start():
    return render_template('waiting_room_start.html')


@app.route('/start-quiz.json', methods=['GET', 'POST'])
def start_quiz():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    if request.method == 'POST':
        yelphelper_session.started = True
        db.session.add(yelphelper_session)
        db.session.commit()
    return {"started": yelphelper_session.started}


@app.route('/retrieve-users-locations.json')
def retrieve_users_locations():
    yelphelper_session_id = session['yelphelper_session_id']
    users_locations = crud.get_users_locations(yelphelper_session_id)

    return {"users_locations": users_locations}


@app.route('/check-distance.json')
def check_distance():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    max_distance = float(request.args.get('max-distance'))

    users_locations = crud.get_users_locations(yelphelper_session_id)
    response = distance_matrix_api.check_distance(
        users_locations, max_distance)
    if response["msg"] == "success":
        yelphelper_session.max_distance = max_distance
        db.session.add(yelphelper_session)
        db.session.commit()

    return response


@app.route('/retrieve-businesses.json', methods=['POST'])
def retrieve_businesses():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    users_locations = crud.get_users_locations(yelphelper_session_id)
    center_point = distance_matrix_api.find_center_point(users_locations)
    print(
        f'center point: {center_point.get("lat")}, {center_point.get("lng")}')
    max_distance = yelphelper_session.max_distance
    search_criterias = yelphelper_session.search_criterias
    yelp_api_responses = {}
    longest_list = 0
    for search_criteria in search_criterias:
        businesses = yelp_api.business_search(
            center_point.get("lat"), center_point.get("lng"), search_criteria.term, search_criteria.price)
        businesses_locations = []
        for business in businesses:
            businesses_locations.append({"lat": business.get("coordinates").get(
                "latitude"), "lng": business.get("coordinates").get("longitude")})
        indices_to_remove = distance_matrix_api.check_below_max_distance(
            users_locations, businesses_locations, max_distance)
        for index in sorted(list(indices_to_remove), reverse=True):
            del businesses[index]
        yelp_api_responses[search_criteria.search_criteria_id] = businesses
        if len(businesses) > longest_list:
            longest_list = len(businesses)
        print(yelp_api_responses)

    existing_businesses_count = len(yelphelper_session.businesses)
    businesses_left = 10 - existing_businesses_count
    index = 0
    msg = "success"
    print(f'starting business count: {businesses_left}')
    print(yelphelper_session.businesses)
    while businesses_left > 0:
        if index >= longest_list:
            msg = "fail"
            businesses_left = 0
        for api_response in yelp_api_responses.values():
            try:
                print(api_response)
                print(f'index {index}')
                business = api_response[index]
                alias = business.get("alias")
                business_already_added = db.session.query(Business).filter_by(
                    yelphelper_session=yelphelper_session, alias=alias).first()
                if not business_already_added:
                    name = business.get("name")
                    image_url = business.get("image_url")
                    url = business.get("url")
                    review_count = business.get("review_count")
                    yelp_rating = business.get("rating")
                    price = len(business.get("price"))
                    address = business.get("location").get("display_address")
                    lat = business.get("coordinates").get("latitude")
                    lng = business.get("coordinates").get("longitude")
                    new_business = Business(alias=alias, name=name, image_url=image_url,
                                            url=url, review_count=review_count,
                                            yelp_rating=yelp_rating, price=price,
                                            address=address,
                                            lat=lat, lng=lng,
                                            yelphelper_session_id=yelphelper_session_id)
                    db.session.add(new_business)
                    db.session.commit()
                    businesses_left -= 1
            except IndexError:
                pass
            if businesses_left <= 0:
                break
            print(f'business count: {businesses_left}')
        index += 1
    return {'msg': msg}


@app.route('/quiz')
def quiz():
    return render_template('quiz.html')


@app.route('/save-distances.json', methods=['POST'])
def save_distances():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    users_locations = crud.get_users_locations(yelphelper_session_id)
    businesses_locations = crud.get_businesses_locations(yelphelper_session_id)
    distance_response = distance_matrix_api.return_distances(
        users_locations, businesses_locations)
    yelphelper_session.distance_matrix = distance_response
    db.session.add(yelphelper_session)
    db.session.commit()
    return {'msg': 'success'}


@app.route('/get-distances.json')
def get_distances():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    msg = 'fail'
    if yelphelper_session.distance_matrix:
        msg = 'success'
    return {'msg': msg, 'distance_matrix': yelphelper_session.distance_matrix}


@app.route('/businesses.json')
def businesses_data():
    yelphelper_session_businesses = crud.get_businesses_by_yelphelper_session_id(
        session['yelphelper_session_id'])
    businesses_list = []
    for b in yelphelper_session_businesses:
        businesses_list.append(
            {"alias": b.alias, "name": b.name, "yelp_rating": b.yelp_rating,
             "review_count": b.review_count, "image_url": b.image_url, "url": b.url,
             "lat": b.lat, "lng": b.lng})
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


@app.route('/waiting-room-end')
def waiting_room_end():
    return render_template('waiting_room_end.html')


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
    yelphelper_session_id = session['yelphelper_session_id']
    ordered_total_scores = crud.get_ordered_total_scores(
        yelphelper_session_id)
    total_scores = []
    for total_score in ordered_total_scores:
        b = Business.query.get(total_score.business_id)
        total_scores.append({"alias": b.alias, "name": b.name, "yelp_rating": b.yelp_rating,
                            "review_count": b.review_count, "image_url": b.image_url, "url": b.url, "total_score": total_score.total_score,
                             "lat": b.lat, "lng": b.lng})

    return {"total_scores": total_scores}


@app.route('/profile')
def profile_page():
    if 'user_id' in session:
        return render_template('profile.html')
    else:
        return redirect('/')


@app.route('/get-saved-businesses.json')
def get_saved_businesses():
    user_id = session['user_id']
    saved_businesses = crud.get_saved_businesses(user_id)
    businesses_data = []
    for saved_business in saved_businesses:
        b = saved_business.business
        businesses_data.append(
            {"saved_business_id": saved_business.saved_business_id, "alias": b.alias, "url": b.url, "name": b.name, "image_url": b.image_url, "address": b.address})
    return {"saved_businesses": businesses_data}


@app.route('/add-to-saved-businesses.json', methods=['POST'])
def add_to_saved_businesses():
    business_alias = request.form.get('business-alias')
    user_id = session['user_id']
    yelphelper_session_id = session['yelphelper_session_id']
    business = db.session.query(Business).filter(
        Business.alias == business_alias, Business.yelphelper_session_id == yelphelper_session_id).first()
    saved_businesses = crud.get_saved_businesses(user_id)
    for saved_business in saved_businesses:
        b = saved_business.business
        if b.alias == business.alias:
            return {"msg": "already entered"}

    saved_business = SavedBusiness(
        user_id=user_id, business_id=business.business_id)
    db.session.add(saved_business)
    db.session.commit()

    return {"msg": "success"}


@app.route('/remove-saved-business.json', methods=['POST'])
def remove_saved_business():
    saved_business_id = request.form.get('saved-business-id')
    SavedBusiness.query.filter_by(saved_business_id=saved_business_id).delete()
    db.session.commit()

    return {"msg": "success"}


if __name__ == '__main__':
    model.connect_to_db(app)
    app.run(debug=True, host='0.0.0.0')
