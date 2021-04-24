from flask import Flask, render_template, request, redirect, url_for
import model
from model import db, User, YelpHelperSession, UserYelpHelperSession, Business, Score
import yelp_api
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = os.environ['APP_KEY']


@app.route('/')
def homepage():
    return render_template('index.html')


@app.route('/form')
def form():
    return render_template('form.html')


if __name__ == '__main__':
    model.connect_to_db(app)
    app.run(debug=True, host='0.0.0.0')
