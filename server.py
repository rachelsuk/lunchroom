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
import itertools

app = Flask(__name__)
app.secret_key = os.environ['APP_KEY']


@app.route('/')
def homepage():
    return render_template('index.html')


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
    return render_template('invite.html')


@app.route('/add-user-to-yelphelper-session.json', methods=['POST'])
def add_user_to_session():
    yelphelper_session_id = session['yelphelper_session_id']
    if 'user_id' in session:
        # add user to YelpHelperSession by creating UserYelpHelperSession object (middle table)
        user_id = session['user_id']
        user_yelphelper_session = UserYelpHelperSession.query.filter_by(
            user_id=user_id, yelphelper_session_id=yelphelper_session_id).first()
        if not user_yelphelper_session:
            host_exists = UserYelpHelperSession.query.filter_by(
                yelphelper_session_id=yelphelper_session_id).first()
            if not host_exists:
                user_yelphelper_session = UserYelpHelperSession(
                    user_id=user_id, yelphelper_session_id=yelphelper_session_id, is_host=True)
            else:
                user_yelphelper_session = UserYelpHelperSession(
                    user_id=user_id, yelphelper_session_id=yelphelper_session_id)
            db.session.add(user_yelphelper_session)
            db.session.commit()
    return {'msg': 'success'}


@app.route('/invite/<yelphelper_session_id>/criteria-form')
def critera_form(yelphelper_session_id):
    return render_template('criteria_form.html')


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
    user_id = session['user_id']
    yelphelper_session_id = session['yelphelper_session_id']
    user_yelphelper_session = UserYelpHelperSession.query.filter(
        UserYelpHelperSession.user_id == user_id, UserYelpHelperSession.yelphelper_session_id == yelphelper_session_id).first()
    user_yelphelper_session.in_waiting_room = True
    db.session.add(user_yelphelper_session)
    db.session.commit()

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
    user_id = session['user_id']
    yelphelper_session_id = session['yelphelper_session_id']
    users_locations = crud.get_users_locations(yelphelper_session_id, user_id)

    return {"users_locations": users_locations}


@app.route('/initial-check-duration.json')
def initial_check_duration():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    max_duration = float(request.args.get('max-duration'))

    users_locations = crud.get_users_locations(yelphelper_session_id)
    response = distance_matrix_api.check_duration(
        users_locations, max_duration)
    yelphelper_session.min_max_duration = response.get("min_max_duration")
    db.session.add(yelphelper_session)
    db.session.commit()

    return response


@app.route('/check-duration.json')
def check_duration():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    min_max_duration = yelphelper_session.min_max_duration
    max_duration = float(request.args.get('max-duration'))
    if max_duration >= min_max_duration:
        yelphelper_session.max_duration = max_duration
        db.session.add(yelphelper_session)
        db.session.commit()
        msg = "success"
    else:
        msg = "fail"

    return {'msg': msg}


@app.route('/retrieve-businesses.json', methods=['POST'])
def retrieve_businesses():
    yelphelper_session_id = session['yelphelper_session_id']
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    users_locations = crud.get_users_locations(yelphelper_session_id)
    center_point = distance_matrix_api.find_center_point(users_locations)
    max_duration = yelphelper_session.max_duration
    search_criterias = yelphelper_session.search_criterias
    yelp_api_responses = []
    for search_criteria in search_criterias:
        businesses = yelp_api.business_search(
            center_point.get("lat"), center_point.get("lng"), search_criteria.term, search_criteria.price)
        yelp_api_responses.append(businesses)

    all_businesses = list(
        map(list, itertools.zip_longest(* yelp_api_responses, fillvalue=None)))

    all_businesses = sum(all_businesses, [])
    all_businesses = [x for x in all_businesses if x is not None]

    if len(search_criterias) == 0:
        businesses = yelp_api.business_search(
            center_point.get("lat"), center_point.get("lng"), 'food')
        all_businesses = businesses

    if len(all_businesses) >= 25:
        businesses_batch = all_businesses[:25]
        all_businesses[:25] = []
    else:
        businesses_batch = all_businesses
        all_businesses = []

    businesses_locations = []
    for business in businesses_batch:
        businesses_locations.append({"lat": business.get("coordinates").get(
            "latitude"), "lng": business.get("coordinates").get("longitude")})

    distance_matrix_response = distance_matrix_api.return_distances(
        businesses_locations, users_locations)

    # print(distance_matrix_response)
    existing_businesses_count = len(yelphelper_session.businesses)
    businesses_left = 10 - existing_businesses_count
    msg = "success"
    while businesses_left > 0:
        for index, business in enumerate(businesses_batch):
            alias = business.get("alias")
            # fetch all of this at once - database query are expensive. reduce amount of time query database.
            business_already_added = db.session.query(Business).filter_by(
                yelphelper_session=yelphelper_session, alias=alias).first()
            if not business_already_added:
                meet_duration_criteria = distance_matrix_api.check_below_max_duration(
                    distance_matrix_response, index, max_duration)
                if meet_duration_criteria:
                    name = business.get("name")
                    yelp_id = business.get("id")
                    image_url = business.get("image_url")
                    url = business.get("url")
                    review_count = business.get("review_count")
                    yelp_rating = business.get("rating")
                    if business.get("price"):
                        price = len(business.get("price"))
                    else:
                        price = None
                    address = business.get("location").get("display_address")
                    lat = business.get("coordinates").get("latitude")
                    lng = business.get("coordinates").get("longitude")
                    new_business = Business(yelp_id=yelp_id, alias=alias, name=name, image_url=image_url,
                                            url=url, review_count=review_count,
                                            yelp_rating=yelp_rating, price=price,
                                            address=address,
                                            lat=lat, lng=lng,
                                            yelphelper_session_id=yelphelper_session_id)
                    db.session.add(new_business)
                    db.session.commit()
                    businesses_left -= 1
                    print(businesses_left)
            if businesses_left <= 0:
                break
        if businesses_left <= 0:
            break
        elif len(all_businesses) >= 25:
            businesses_batch = all_businesses[:25]
            all_businesses[:25] = []
        elif 25 > len(all_businesses) > 0:
            businesses_batch = all_businesses
            all_businesses = []
        else:
            msg = "fail"
            break

        businesses_locations = []
        for business in businesses_batch:
            businesses_locations.append({"lat": business.get("coordinates").get(
                "latitude"), "lng": business.get("coordinates").get("longitude")})

        distance_matrix_response = distance_matrix_api.return_distances(
            businesses_locations, users_locations)

    return {'msg': msg}


# @app.route('/retrieve-businesses-1.json', methods=['POST'])
# def retrieve_businesses_1():
#     yelphelper_session_id = session['yelphelper_session_id']
#     yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
#     users_locations = crud.get_users_locations(yelphelper_session_id)
#     center_point = distance_matrix_api.find_center_point(users_locations)
#     max_duration = yelphelper_session.max_duration
#     search_criterias = yelphelper_session.search_criterias
#     yelp_api_responses = {}
#     longest_list = 0
#     for search_criteria in search_criterias:
#         businesses = yelp_api.business_search(
#             center_point.get("lat"), center_point.get("lng"), search_criteria.term, search_criteria.price)
#         businesses_locations = []
#         for business in businesses:
#             businesses_locations.append({"lat": business.get("coordinates").get(
#                 "latitude"), "lng": business.get("coordinates").get("longitude")})
#         indices_to_remove = distance_matrix_api.check_below_max_duration(
#             users_locations, businesses_locations, max_duration)
#         for index in sorted(list(indices_to_remove), reverse=True):
#             del businesses[index]
#         yelp_api_responses[search_criteria.search_criteria_id] = businesses
#         if len(businesses) > longest_list:
#             longest_list = len(businesses)

#     if len(search_criterias) == 0:
#         businesses = yelp_api.business_search(
#             center_point.get("lat"), center_point.get("lng"))
#         businesses_locations = []
#         for business in businesses:
#             businesses_locations.append({"lat": business.get("coordinates").get(
#                 "latitude"), "lng": business.get("coordinates").get("longitude")})
#         indices_to_remove = distance_matrix_api.check_below_max_duration(
#             users_locations, businesses_locations, max_duration)
#         for index in sorted(list(indices_to_remove), reverse=True):
#             del businesses[index]
#         yelp_api_responses[1] = businesses
#         if len(businesses) > longest_list:
#             longest_list = len(businesses)

#     existing_businesses_count = len(yelphelper_session.businesses)
#     businesses_left = 10 - existing_businesses_count
#     index = 0
#     msg = "success"
#     while businesses_left > 0:
#         if index >= longest_list:
#             msg = "fail"
#             businesses_left = 0
#         for api_response in yelp_api_responses.values():
#             try:
#                 business = api_response[index]
#                 alias = business.get("alias")
#                 business_already_added = db.session.query(Business).filter_by(
#                     yelphelper_session=yelphelper_session, alias=alias).first()
#                 if not business_already_added:
#                     name = business.get("name")
#                     yelp_id = business.get("id")
#                     image_url = business.get("image_url")
#                     url = business.get("url")
#                     review_count = business.get("review_count")
#                     yelp_rating = business.get("rating")
#                     if business.get("price"):
#                         price = len(business.get("price"))
#                     else:
#                         price = None
#                     address = business.get("location").get("display_address")
#                     lat = business.get("coordinates").get("latitude")
#                     lng = business.get("coordinates").get("longitude")
#                     new_business = Business(yelp_id=yelp_id, alias=alias, name=name, image_url=image_url,
#                                             url=url, review_count=review_count,
#                                             yelp_rating=yelp_rating, price=price,
#                                             address=address,
#                                             lat=lat, lng=lng,
#                                             yelphelper_session_id=yelphelper_session_id)
#                     db.session.add(new_business)
#                     db.session.commit()
#                     businesses_left -= 1
#             except IndexError:
#                 pass
#             if businesses_left <= 0:
#                 break
#         index += 1
#     return {'msg': msg}


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
            {"alias": b.alias, "yelp_id": b.yelp_id, "name": b.name, "yelp_rating": b.yelp_rating,
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
    yelphelper_session = YelpHelperSession.query.get(yelphelper_session_id)
    ordered_total_scores = crud.get_ordered_total_scores(
        yelphelper_session_id)
    total_scores = []
    for total_score in ordered_total_scores:
        b = Business.query.get(total_score.business_id)
        total_scores.append({"alias": b.alias, "yelp_id": b.yelp_id, "name": b.name, "yelp_rating": b.yelp_rating,
                            "review_count": b.review_count, "image_url": b.image_url, "url": b.url, "total_score": total_score.total_score,
                             "lat": b.lat, "lng": b.lng})
    users_locations = crud.get_users_locations(yelphelper_session_id)
    distance_matrix_response = distance_matrix_api.return_distances(
        users_locations, total_scores)
    yelphelper_session.distance_matrix = distance_matrix_response
    db.session.add(yelphelper_session)
    db.session.commit()

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
            {"saved_business_id": saved_business.saved_business_id, "alias": b.alias, "yelp_id": b.yelp_id, "url": b.url, "name": b.name, "image_url": b.image_url, "address": b.address})
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


@app.route('/add-saved-business-to-yp-session.json', methods=['POST'])
def add_saved_business_to_yp_session():
    yelphelper_session_id = session['yelphelper_session_id']
    saved_business_id = request.form.get('saved-business-id')
    saved_business = SavedBusiness.query.get(saved_business_id)
    yelp_id = saved_business.business.yelp_id
    business = yelp_api.business_details(yelp_id)
    yp_session_businesses = crud.get_businesses_by_yelphelper_session_id(
        yelphelper_session_id)
    msg = 'success'
    for session_business in yp_session_businesses:
        if session_business.alias == business['alias']:
            msg = 'already added'
    if msg == 'success':
        alias = business.get("alias")
        name = business.get("name")
        yelp_id = business.get("id")
        image_url = business.get("image_url")
        url = business.get("url")
        review_count = business.get("review_count")
        yelp_rating = business.get("rating")
        price = len(business.get("price"))
        address = business.get("location").get("display_address")
        lat = business.get("coordinates").get("latitude")
        lng = business.get("coordinates").get("longitude")
        new_business = Business(yelp_id=yelp_id, alias=alias, name=name, image_url=image_url,
                                url=url, review_count=review_count,
                                yelp_rating=yelp_rating, price=price,
                                address=address,
                                lat=lat, lng=lng,
                                yelphelper_session_id=yelphelper_session_id)
        db.session.add(new_business)
        db.session.commit()
    return {"msg": msg}


@app.route('/get-user-data.json')
def get_user_data():
    user_id = session['user_id']
    user = User.query.get(user_id)
    fname = user.fname
    lname = user.lname
    phone = user.phone
    email = user.email
    password = user.password

    return {"fname": fname, "lname": lname, "phone": phone, "email": email, "password": password}


@app.route('/edit-user-data.json', methods=['POST'])
def edit_user_data():
    user_id = session['user_id']
    user = User.query.get(user_id)
    user.fname = request.form.get('fname')
    user.lname = request.form.get('lname')
    user.email = request.form.get('email')
    user.phone = request.form.get('phone')
    db.session.add(user)
    db.session.commit()
    return {"msg": "success", "user": {'fname': user.fname, 'lname': user.lname, 'email': user.email, 'phone': user.phone, 'password': user.password}}


if __name__ == '__main__':
    model.connect_to_db(app)
    app.run(debug=True)
