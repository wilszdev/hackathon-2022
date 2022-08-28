from random import choice
from flask import Flask, jsonify, request
from uuid import uuid4
import json
from sus import SusClient
from math import exp
from collections import deque
import base64


with open('config.json', 'r') as f:
    config = json.loads(f.read())

sus_client = SusClient(project=config['project'],
                       endpoint_id=config['endpoint_id'])

app = Flask(__name__, static_folder='static')


prompt_options = (
    {
        'prompt': 'duck',
        'description': 'duck'
    },
    {
        'prompt': 'apple',
        'description': 'apple'
    },
    {
        'prompt': 'among_us',
        'description': 'among us'
    },
    {
        'prompt': 'minion',
        'description': 'minion'
    },
    {
        'prompt': 'piano',
        'description': 'piano'
    },
    {
        'prompt': 'shark',
        'description': 'shark'
    },
    {
        'prompt': 'tree',
        'description': 'tree'
    },
    {
        'prompt': 'house',
        'description': 'house'
    },
    {
        'prompt': 'car',
        'description': 'car'
    }
)


def get_prompt() -> str:
    return choice(prompt_options)


def guid() -> str:
    return uuid4().hex


@app.route('/')
def index():
    return app.send_static_file("index.html")


@app.route('/multiplayer/')
def multiplayer():
    return app.send_static_file("index_multiplayer.html")


@app.route('/api/prompts/new', methods=["POST"])
def create_round_get_prompt():
    return jsonify(get_prompt()), 200


def conf_to_score(confidence: float) -> int:
    assert 0 <= confidence <= 1, "confidence domain"

    if 0 <= confidence < 0.5:
        return int(confidence*10)
    else:
        return int(exp(confidence * 10)/230) + 5


recent_submissions = deque()


@app.route('/api/prompts/recent')
def get_recent_subs():
    return jsonify(list(recent_submissions)), 200


@app.route('/api/prompts/<prompt_name>/submit', methods=["POST"])
def make_submission_for_prompt(prompt_name: str):
    if request.content_type != 'image/png':
        return jsonify({'msg': "expected image/png content"}), 400

    data = request.get_data()
    result_dict = sus_client.predict(data)

    score = 0
    if prompt_name in result_dict:
        confidence = result_dict[prompt_name]
        score = conf_to_score(confidence)

    categories = []
    for name in result_dict.keys():
        for p in prompt_options:
            if p['prompt'] == name:
                categories.append(p)

    response = {
        'prompt_id': prompt_name,
        'score': score,
        'categories': categories
    }

    desc = prompt_name.replace('_', ' ')

    recent_submissions.append({
        'description': desc,
        'score': score,
        'img': base64.b64encode(data).decode('utf-8')
    })

    while len(recent_submissions) > 5:
        recent_submissions.popleft()

    return jsonify(response), 200


if __name__ == '__main__':
    app.run()
