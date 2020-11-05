from flask import Flask, request, make_response, render_template, send_from_directory, jsonify
from flask_cors import CORS
from database import db, queries
import json

app = Flask(__name__)
# CORS(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/highscore/<int:highscore>')
def set_score(highscore):
    if highscore > 0:
        db.execute_query(queries.save_score, {"score": highscore})

    response = get_high_score()
    return response


@app.route('/highscore')
def get_score():
    response = get_high_score()
    return response


def get_high_score():
    highscore = db.execute_query(queries.get_highscore)

    if len(highscore) > 0:
        print(f'highscore: {highscore[0]["score"]}')

        # output_json = json.dumps({'highscore': highscore[0]["score"]})


        # response = make_response(output_json)
        # return response
        return jsonify({'highscore': highscore[0]["score"]});


if __name__ == '__main__':
    app.run(debug=True)
