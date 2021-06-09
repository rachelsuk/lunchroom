import requests
from math import pi, cos, sin, atan2, sqrt


def return_distances(origins, destinations):
    orig_str = create_locations_string(origins)
    dest_str = create_locations_string(destinations)

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"

    payload = {"units": "imperial", "origins": orig_str, "destinations": dest_str,
               "departure_time": "now", "key": "AIzaSyBK2MfjfGqyN9RhjvbXtMK369AX5uKGTfw"}

    response = requests.request(
        "GET", url, params=payload).json()

    return response


def create_locations_string(locations):
    first = locations[0]
    first_lat = first.get("lat")
    first_lng = first.get("lng")

    locations_str = f'{first_lat},{first_lng}'

    if len(locations) > 1:
        for location in locations[1:]:
            lat = location.get("lat")
            lng = location.get("lng")
            locations_str += f'|{lat},{lng}'
    return locations_str


def check_duration(users_locations, max_duration):
    response = return_distances(users_locations, users_locations)
    rows = response.get("rows")

    msg = "success"

    min_max_duration = (rows[0].get('elements'))[
        0].get("duration").get("value")

    for row in rows:
        elements = row.get("elements")
        for element in elements:
            seconds = element.get("duration").get("value")
            minutes = seconds/60
            if max_duration < (minutes/2):
                msg = "fail"
            if (minutes/2) > min_max_duration:
                min_max_duration = minutes/2

    return {"msg": msg, "min_max_duration": min_max_duration}


def check_below_max_duration(users_locations, businesses_locations, max_duration):
    response = return_distances(users_locations, businesses_locations)
    rows = response.get("rows")
    indices_to_remove = set()
    for row in rows:
        elements = row.get("elements")
        for index, element in enumerate(elements):
            meters = element.get("duration").get("value")
            minutes = seconds/60
            if max_duration < minutes:
                print(f'{minutes} minutes. deleting index {index}')
                indices_to_remove.add(index)
    return indices_to_remove


def convert_meters_to_miles(meters):
    return meters * 0.000621371


def find_center_point(users_locations):
    x = 0
    y = 0
    z = 0

    for user in users_locations:
        lat = user.get("lat") * pi / 180
        lng = user.get("lng") * pi / 180
        x += (cos(lat) * cos(lng))
        y += (cos(lat) * sin(lng))
        z += sin(lat)

    avg_x = x / len(users_locations)
    avg_y = y / len(users_locations)
    avg_z = z / len(users_locations)

    center_lng = (atan2(avg_y, avg_x) * 180 / pi)
    center_hyp = sqrt(avg_x * avg_x + avg_y * avg_y)
    center_lat = (atan2(avg_z, center_hyp) * 180 / pi)

    return {"lat": center_lat, "lng": center_lng}
