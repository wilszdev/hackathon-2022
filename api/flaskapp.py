from random import choice
from flask import Flask, abort, jsonify, request
from time import time_ns
from uuid import uuid4
import os
from flask_cors import CORS
import json
from sus import SusClient
from math import exp

with open('.\\api\\config.json', 'r') as f:
    config = json.loads(f.read())

sus_client = SusClient(project=config['project'],
                       endpoint_id=config['endpoint_id'])

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

prompts = {}


prompt_options = ('duck', 'apple', 'among us', 'Minions (Despicable Me)', 'piano', 'shark', 'tree', 'goldfish', 'house', 'car')


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


def conf_to_score(confidence: float) -> int:
    assert 0 <= confidence <= 1, "confidence domain"

    if 0 <= confidence < 0.5:
        return int(confidence*10)
    else:
        return int(exp(confidence * 10)/230) + 5


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

    filepath = os.path.abspath(os.path.join(dst_folder, f"{prompt_id}.png"))

    with open(filepath, 'bw+') as f:
        f.write(data)

    result_dict = sus_client.predict(filepath)

    prompt = prompts[prompt_id]['prompt']

    score = 0
    if prompt in result_dict:
        confidence = result_dict[prompt]
        score = conf_to_score(confidence)

    response = {
        'prompt_id': prompt_id,
        'score': score
    }

    return jsonify(response), 200


if __name__ == '__main__':
    app.run()
