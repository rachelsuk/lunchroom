import requests


def return_distances(origins, destinations):
    orig_str = create_locations_string(origins)
    dest_str = create_locations_string(destinations)

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"

    payload = {"units": "imperial", "origins": orig_str, "destinations": dest_str,
               "key": "AIzaSyBK2MfjfGqyN9RhjvbXtMK369AX5uKGTfw"}

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


def check_distance(users_locations, max_distance):
    response = return_distances(users_locations, users_locations)
    rows = response.get("rows")
    print(rows)

    msg = "success"

    min_max_distance = (rows[0].get('elements'))[
        0].get("distance").get("value")

    for row in rows:
        elements = row.get("elements")
        for element in elements:
            meters = element.get("distance").get("value")
            miles = convert_meters_to_miles(meters)
            if max_distance < (miles/2):
                msg = "fail"
            if (miles/2) > min_max_distance:
                min_max_distance = miles/2

    return {"msg": msg, "min_max_distance": min_max_distance}


def check_below_max_distance(users_locations, businesses_locations, max_distance):
    response = return_distances(users_locations, users_locations)
    rows = response.get("rows")
    indices_to_remove = []
    for row in rows:
        elements = row.get("elements")
        for index, element in enumerate(elements):
            meters = element.get("distance").get("value")
            miles = convert_meters_to_miles(meters)
            if max_distance < miles:
                indices_to_remove.append(index)
    return indices_to_remove


def convert_meters_to_miles(meters):
    return meters * 0.000621371
