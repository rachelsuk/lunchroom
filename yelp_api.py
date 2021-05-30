import requests
import os

YELP_KEY = os.environ['YELP_KEY']


def business_search(lat, lng, search_term=None, price=None, min_rating=None):
    url = 'https://api.yelp.com/v3/businesses/search'
    # Use form data from the user to populate any search parameters
    headers = {'Authorization': 'Bearer %s' % YELP_KEY}
    payload = {'term': search_term, 'latitude': lat, 'longitude': lng,
               'price': price, 'limit': 50}
    # Make a request to the Business Search endpoint to search for businesses
    res = requests.get(url, params=payload, headers=headers)
    search_results = res.json()
    return search_results['businesses'][:10]


def business_details(yelp_id):
    url = f'https://api.yelp.com/v3/businesses/{yelp_id}'
    headers = {'Authorization': 'Bearer %s' % YELP_KEY}
    res = requests.get(url, headers=headers)
    business_details = res.json()
    return business_details
