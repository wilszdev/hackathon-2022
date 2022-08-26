from flask import Flask, abort, jsonify, request
from time import time_ns
from uuid import uuid4
import os


def guid() -> str:
    return uuid4().hex


app = Flask(__name__)


games = {}
submissions = {}


def get_prompt() -> str:
    return 'duck'


def make_new_game() -> str:
    global games
    game_id = guid()
    game = {
        'id': game_id,
        'current_prompt': get_prompt(),
        'start_time': time_ns(),
        'submission': None
    }
    games.update({game_id: game})
    return game_id


def make_new_submission(game_id: str) -> str:
    global games
    global submissions

    if game_id not in games:
        abort(404)

    submission_id = guid()
    submission = {
        'id': submission_id,
        'ts': time_ns(),
    }

    games[game_id]['submission'] = submission_id

    submissions.update({submission_id: submission})
    return submission_id


@app.route('/api/games/game/<game_guid>/submission/<submission_guid>',
           methods=["GET"])
def get_submission(game_guid, submission_guid):
    if (
        game_guid not in games
        or submission_guid != games[game_guid]['submission']
        or submission_guid not in submissions
    ):
        abort(404)

    return jsonify(submissions[submission_guid])


@app.route('/api/games/game/<game_guid>/submit', methods=["POST"])
def submit_game(game_guid):
    if 'file' in request.files:
        file = request.files['file']

        dst_folder = 'submissions'
        if not os.path.exists(dst_folder):
            os.mkdir(dst_folder)

        _, ext = os.path.splitext(file.filename)

        submission_id = make_new_submission(game_guid)
        filename = f'{submission_id}{ext}'

        file.save(os.path.join(dst_folder, filename))

        return jsonify(submissions[submission_id])
    else:
        return "bad request", 400


@app.route('/api/games/game/<game_guid>', methods=["GET"])
def get_game(game_guid):
    if game_guid in games:
        return jsonify(games[game_guid])
    else:
        abort(404)


@app.route('/api/games/new', methods=["POST"])
def new_game():
    game_id = make_new_game()
    return jsonify(games[game_id])


if __name__ == '__main__':
    app.run()
