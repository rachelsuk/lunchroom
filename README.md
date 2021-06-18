# LunchRoom

LunchRoom is a web application built with React and Flask to help groups of users decide where to eat based on their
locations and food preferences.

## Project Background :bento:

So you want to finally meet up with a couple of your friends for lunch now that COVID-19 restrictions have lowered. You live in San Jose, one of your friends live in Fremont and the other lives in Palo Alto. You're craving japanese food, your friend wants tacos and the other specifically wants Mendocino Farms. Everyone is only willing to drive 20 minutes to the restaurant. Two questions are probably going through your head. One - which area should we eat in? And two - what should we eat?

LunchRoom is a streamlined application that simplifies this decision making process. The app gathers data from the users about their locations and food preferences, and finds optimal restaurants within the desired driving distance using the Google Maps Platform and Yelp Fusion APIs. Users are provided with information about the restaurants (e.g. number of stars/reviews on Yelp, distance from each user) and asked to rate how much they want to eat at each restaurant. Ratings are then aggregated and the results are displayed to the users.

## Tech Stack :computer:

- Javascript -- React
- Python -- Flask, SqlAlchemy
- Database -- PostgreSQL
- Styling -- HTML/CSS, Bootstrap
- Other Frameworks and APIs -- Google Maps Platform APIs (Maps Javascript API, Distance Matrix API, Geocoding API), Yelp
  Fusion API

## Feature Highlights :bulb:

- Gathers information about users' locations and food preferences

  <!-- ![GIF of routine entry](static/img/docs/routine.gif) -->

- Host inputs the maximum driving distance
  <!-- ![GIF of dashboard](static/img/docs/dashboard.gif) -->

- Users rate each restaurant

  <!-- ![GIF of sunburst](static/img/docs/sunburst.gif) -->

- Results are displayed to the users

  <!-- ![GIF of sunburst](static/img/docs/sunburst.gif) -->

## Quickstart :clipboard:

After cloning the repo in your virtualenv, install dependencies:

`$ pip3 install -r requirements.txt`

Sign up to use the [Yelp Fusion API](https://www.yelp.com/fusion) and [Google Maps Platform APIs](https://developers.google.com/maps).

Save your Yelp Fusion API key and a random string APP_KEY in a file called secrets.sh using this format:

```
$ export YELP_KEY="YOUR_KEY_NAME_HERE"
$ export APP_KEY="RANDOM_STRING"
```

Replace the existing Google Maps API key with your API key on line 6 in the googlemapsapi.html file

```
<script
defer
src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY_NAME_HERE&libraries=map">
</script>
```

Then, run the Flask server to start the web app:

`$ python3 server.py`

Visit your `localhost:5000` to access the app in your local browser!
