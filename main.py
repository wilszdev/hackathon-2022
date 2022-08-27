from random import choice
from unittest import result
from flask import Flask, jsonify, request
from time import time_ns
from uuid import uuid4
import os
import json
from sus import SusClient
from math import exp

with open('config.json', 'r') as f:
    config = json.loads(f.read())

sus_client = SusClient(project=config['project'],
                       endpoint_id=config['endpoint_id'])

app = Flask(__name__, static_folder='static')

prompts = {}


prompt_options = (
    {
        'prompt': 'duck',
        'description': 'Duck'
    },
    {
        'prompt': 'apple',
        'description': 'Apple'
    },
    {
        'prompt': 'among_us',
        'description': 'Among Us'
    },
    {
        'prompt': 'minion',
        'description': 'Minion'
    },
    {
        'prompt': 'piano',
        'description': 'Piano'
    },
    {
        'prompt': 'shark',
        'description': 'Shark'
    },
    {
        'prompt': 'tree',
        'description': 'Tree'
    },
    {
        'prompt': 'house',
        'description': 'House'
    },
    {
        'prompt': 'car',
        'description': 'Car'
    }
)


def get_prompt() -> str:
    return choice(prompt_options)


def guid() -> str:
    return uuid4().hex


@app.route('/')
def index():
    return app.send_static_file("index.html")


@app.route('/multiplayer')
def multiplayer():
    return app.send_static_file("index_multiplayer.html")


@app.route('/api/prompts/new', methods=["POST"])
def create_round_get_prompt():
    prompt = {'id': guid(), 'ts': time_ns()}
    prompt.update(get_prompt())

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
        jsonify({'msg': "expected image/png content"}), 400

    if prompt_id not in prompts:
        jsonify({'msg': "prompt not found"}), 404

    dst_folder = 'submissions'
    if not os.path.exists(dst_folder):
        os.mkdir(dst_folder)

    data = request.get_data()
    result_dict = sus_client.predict(data)

    prompt = prompts[prompt_id]['prompt']

    score = 0
    if prompt in result_dict:
        confidence = result_dict[prompt]
        score = conf_to_score(confidence)
    else:
        print(f'prompt {prompt} not found')

    categories = []
    for name in result_dict.keys():
        for p in prompt_options:
            if p['prompt'] == name:
                categories.append(p)
    
    response = {
        'prompt_id': prompt_id,
        'score': score,
        'categories': categories
    }

    return jsonify(response), 200


if __name__ == '__main__':
    app.run()
