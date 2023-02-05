from flask import request, Flask, render_template, redirect, url_for, abort, make_response, send_file
from datetime import datetime
import numpy as np
from flask_wtf.csrf import CSRFProtect
import re
import os

app = Flask(__name__)
app.config.from_pyfile('config.py')

csrf = CSRFProtect(app)
csrf.init_app(app)

@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/projets/<string:projet>', methods=['GET'])
def projet(projet):
    return render_template(f'projets/{projet}.html')

@app.route('/images/<string:pid>.jpg')
def get_image_jpg(pid):
    response = make_response(send_file(os.path.join('static', 'images', '{}.jpg'.format(pid)), mimetype='image/jpg'))
    response.headers.set('Content-Type', 'image/jpg')
    response.headers.set(
        'Content-Disposition', 'attachment', filename='%s.jpg' % pid)
    return response

@app.route('/images/<string:pid>.png')
def get_image_png(pid):
    response = make_response(send_file(os.path.join('static', 'images', '{}.png'.format(pid)), mimetype='image/png'))
    response.headers.set('Content-Type', 'image/png')
    response.headers.set(
        'Content-Disposition', 'attachment', filename='%s.png' % pid)
    return response

@app.errorhandler(404)
def page_not_found(e):
    return redirect(url_for('home'))
    
if __name__ == "__main__":
    app.run(debug=True)