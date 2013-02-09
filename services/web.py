import os
import json
from flask import Flask, jsonify
from redis import StrictRedis

app = Flask(__name__)
redis = None


def is_script(f):
    return (os.path.isfile(f) and
            os.path.splitext(f)[1] in ('.py', '.js') and
            not f.startswith('__') and
            not f.startswith('admin'))


def get_scripts():
    return {'scripts': [f for f in os.listdir('.') if is_script(f)]}

@app.route('/')
def hello():
    return open('index.html').read()


@app.route('/scripts')
def scripts():
    return jsonify(get_scripts())


@app.route('/do/<command>/<script>')
def issue(command, script):
    redis.publish('in', json.dumps({
        'type': 'admin',
        'version': 1,
        'data': {
            'command': command,
            'args': [
                script,
            ],
        },
    }))
    return script


app.debug = True
if __name__ == '__main__':
    redis = StrictRedis()
    app.run()
