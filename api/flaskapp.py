from random import choice
from click import prompt
from flask import Flask, abort, jsonify, request
from time import time_ns
from uuid import uuid4
import os
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

prompts = {}


prompt_options = ('duck', 'apple', 'amongus', 'minions', 'piano')


def get_prompt() -> str:
    return choice(prompt_options)


def guid() -> str:
    return uuid4().hex


@app.route('/api/prompts/new', methods=["POST"])
def create_round_get_prompt():
    prompt = {'id': guid(), 'prompt': get_prompt(), 'ts': time_ns()}

    global prompts
    prompts.update({prompt['id']: prompt})

    return jsonify(prompt), 200


@app.route('/api/prompts/<prompt_id>/submit', methods=["POST"])
def make_submission_for_prompt(prompt_id):
    if request.content_type != 'image/png':
        abort(400)

    if prompt_id not in prompts:
        abort(404)

    dst_folder = 'submissions'
    if not os.path.exists(dst_folder):
        os.mkdir(dst_folder)

    data = request.get_data()

    with open(os.path.join(dst_folder, f"{prompt_id}.png"), 'bw+') as f:
        f.write(data)

    response = {
        'prompt_id': prompt_id,
        'score': 69
    }

    return jsonify(response), 200


if __name__ == '__main__':
    app.run()
