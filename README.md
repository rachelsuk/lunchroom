# LunchRoom

LunchRoom is a web application built with React and Flask to help groups of users decide where to eat based on their
locations and food preferences.

![img of homepage](static/img/docs/homepage.png)

## Project Background :bento:

So you want to finally meet up with a couple of your friends for lunch now that COVID-19 restrictions have lifted. You live in San Jose, one of your friends live in Fremont and the other lives in Palo Alto. You're craving japanese food, one of your friends wants tacos and the other specifically wants Mendocino Farms. Everyone is only willing to drive 20 minutes to the restaurant. Two questions are probably going through your head.

1. Which area should we eat in?
2. Which restaurant should we eat at?

LunchRoom is a streamlined application that simplifies this decision making process. The app gathers data from the users about their locations and food preferences, and finds optimal restaurants within the desired driving distance using the Google Maps Platform and Yelp Fusion APIs. Users are provided with information about the restaurants (e.g. number of stars/reviews on Yelp, distance from each user) and asked to rate how much they want to eat at each restaurant. Ratings are then aggregated and the results are displayed to the users.

## Tech Stack :computer:

- Javascript -- React
- Python -- Flask, SqlAlchemy
- Database -- PostgreSQL
- Styling -- HTML/CSS, Bootstrap

## APIs :fax:

- Google Maps Platform APIs
  - Maps Javascript API
  - Distance Matrix API
  - Geocoding API
- Yelp Fusion API

## User Flow :bulb:

1. Gathers information about users' locations and food preferences

![GIF of invite and criteria form ](static/img/docs/invite_criteria.gif)

2. Waiting room updates in real-time each time a user joins the session

![GIF of waiting room](static/img/docs/waiting_room.gif)

3. Session host inputs the maximum driving distance

![GIF of maximum distance form](static/img/docs/max_distance.gif)

4. Users rate each restaurant

![GIF of ratings quiz](static/img/docs/quiz.gif)

5. Results are displayed to the users

![GIF of results](static/img/docs/results.gif)

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
