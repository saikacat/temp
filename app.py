from __future__ import division, print_function
# coding=utf-8
import sys
import cv2
import os
from sys import platform
import argparse
import time
import glob
import re
import cStringIO
import base64
import skeletonlib
import random
import json 

# Flask utils

from flask import Flask, redirect, url_for, request, render_template, send_file
from werkzeug.utils import secure_filename
from gevent.wsgi import WSGIServer



# Define a flask app
app = Flask(__name__)


    #Python Wrapper for OpenPose

#

# # Model saved with Keras model.save()
# MODEL_PATH = 'models/your_model.h5'

# Load your trained model
# model = load_model(MODEL_PATH)
# model._make_predict_function()          # Necessary
# print('Model loaded. Start serving...')

# You can also use pretrained model from Keras
# Check https://keras.io/applications/
# from keras.applications.resnet50 import ResNet50
# model = ResNet50(weights='imagenet')
# print('Model loaded. Check http://127.0.0.1:5000/')


# def model_predict(img_path, model):
#     img = image.load_img(img_path, target_size=(224, 224))

#     # Preprocessing the image
#     x = image.img_to_array(img)
#     # x = np.true_divide(x, 255)
#     x = np.expand_dims(x, axis=0)

#     # Be careful how your trained model deals with the input
#     # otherwise, it won't make correct prediction!
#     x = preprocess_input(x, mode='caffe')

#     preds = model.predict(x)
#     return preds



@app.route('/', methods=['GET'])
def index():
    # Main page
    # Import Openpose (Windows/Ubuntu/OSX)

    # Flags
    return render_template('index.html')

@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # Get the file from post request
        f = request.files['file']

        # Save the file to ./uploads
        basepath = os.path.dirname(__file__)
        file_path = os.path.join(
            basepath, secure_filename(f.filename))
        f.save(file_path)

    dir_path = os.path.dirname(os.path.realpath(__file__))
    sys.path.append('/usr/local/python')
    from openpose import pyopenpose as op    
    parser = argparse.ArgumentParser()
    nameOfUpload = f.filename
    print(nameOfUpload)
    parser.add_argument("--image_path", default=nameOfUpload, help="Process an image. Read all standard formats (jpg, png, bmp, etc.).")
    args = parser.parse_known_args()

    # Custom Params (refer to include/openpose/flags.hpp for more parameters)
    params = dict()
    params["model_folder"] = "/Users/timothy/openpose/models"

    # Add others in path?
    for i in range(0, len(args[1])):
        curr_item = args[1][i]
        if i != len(args[1])-1: next_item = args[1][i+1]
        else: next_item = "1"
        if "--" in curr_item and "--" in next_item:
            key = curr_item.replace('-','')
            if key not in params:  params[key] = "1"
        elif "--" in curr_item and "--" not in next_item:
            key = curr_item.replace('-','')
            if key not in params: params[key] = next_item

    # Construct it from system arguments
    # op.init_argv(args[1])
    # oppython = op.OpenposePython()

    # Starting OpenPose
    opWrapper = op.WrapperPython()
    opWrapper.configure(params)
    opWrapper.start()
    print('here')
    print(args[0].image_path)
    # Process Image
    datum = op.Datum()
    imageToProcess = cv2.imread(args[0].image_path)
    datum.cvInputData = imageToProcess
    opWrapper.emplaceAndPop(op.VectorDatum([datum]))

    # Display Image
    print("Body keypoints: \n" + str(datum.poseKeypoints))
    cv2.imshow("OpenPose 1.7.0 - Tutorial Python API", datum.cvOutputData)
    #saves output as 
    outputName = 'poseSkeleton' + args[0].image_path 
    cv2.imwrite(outputName,datum.cvOutputData)
    cv2.waitKey(1)
    # assume data contains your decoded image
    encoded = base64.b64encode(open(outputName , "rb").read())
    print(encoded)
        # Make prediction
        # preds = model_predict(file_path, model)

        # Process your result for human
        # # pred_class = preds.argmax(axis=-1)            # Simple argmax
        # pred_class = decode_predictions(preds, top=1)   # ImageNet Decode
        # result = str(pred_class[0][0][1])               # Convert to string
        # return result
    return encoded



@app.route('/get_round_images_and_names')
def get_round_images():
    r = random.sample(range(1,14),4)
    names = {}
    for i in r:
	names[i] = skeletonlib.poses_names[i]
    j = json.dumps(names)
    return j

@app.route('/get_round_img', methods=['GET', 'POST'])
def getPose():
    if request.method == 'POST':
        # Get the file from post request
        f = request.files['file']
	str(f)
	print("getting round image")
	print(f)
	
    # assume data contains your decoded image
    encoded = base64.b64encode(open("poses/"+f+".jpg" , "rb").read())
    print(encoded)
        # Make prediction
        # preds = model_predict(file_path, model)

        # Process your result for human
        # # pred_class = preds.argmax(axis=-1)            # Simple argmax
        # pred_class = decode_predictions(preds, top=1)   # ImageNet Decode
        # result = str(pred_class[0][0][1])               # Convert to string
        # return result
    return encoded



@app.route('/get_image')
def get_image():
    filename = 'uploads\\123.jpg'
    return send_file(filename, mimetype='image/jpg')

def comparePoints(index,pB):
	points_2D_a = skeletonlib.poses[index]["people"][0]["pose_keypoints_2d"]
	points_2D_b = pB["people"][0]["pose_keypoints_2d"]

	pt = 1 # starting at x
	avg = 0

	refHeadX = points_2D_a[0]
	refHeadY = points_2D_a[1]

	userHeadX = points_2D_b[0]
	userHeadY = points_2D_b[1]
	
	for i in range(3, 75): # start at the next point.
		if pt == 1: # x coord
			refHeadDiff = refHeadX - points_2D_a[i]
			userHeadDiff = userHeadX - points_2D_b[i]
			avg = avg + abs(refHeadDiff - userHeadDiff)
		if pt == 2: # y coord
			refHeadDiff = refHeadY - points_2D_a[i]
			userHeadDiff = userHeadY - points_2D_b[i]
			avg = avg + abs(refHeadDiff - userHeadDiff)
		if pt == 3: # confidence, it's not needed.
			pt = 0
		pt = pt+1	

	avg = avg/len(points_2D_a)
	print((1-avg) * 100)

if __name__ == '__main__':
    # app.run(port=5002, debug=True)

    # Serve the app with gevent
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
