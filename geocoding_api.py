import requests


def get_zipcode_coords(zipcode):
    url = "https://maps.googleapis.com/maps/api/geocode/json"

    payload = {"address": zipcode,
               "key": "AIzaSyBK2MfjfGqyN9RhjvbXtMK369AX5uKGTfw"}

    response = requests.request(
        "GET", url, params=payload).json()
    
    print(response)
    print(response.get("status"))

    result = response.get("results")

    lat = result[0].get("geometry").get("location").get("lat")
    lng = result[0].get("geometry").get("location").get("lng")

    return {"lat": lat, "lng": lng}
