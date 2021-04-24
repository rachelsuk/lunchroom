import requests
import os

YELP_KEY = os.environ['YELP_KEY']


def business_search(location, search_term, price=None, min_rating=None):
    url = 'https://api.yelp.com/v3/businesses/search'
    # Use form data from the user to populate any search parameters
    headers = {'Authorization': 'Bearer %s' % YELP_KEY}
    payload = {'term': search_term, 'location': location,
               'price': price, 'min_rating': min_rating}
    # Make a request to the Event Search endpoint to search for events
    res = requests.get(url, params=payload, headers=headers)
    search_results = res.json()
    return search_results['businesses'][10]
