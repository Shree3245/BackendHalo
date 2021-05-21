# from flask import Flask, request, jsonify
# from flask_cors import CORS, cross_origin

import pymongo
from pprint import pprint
import uuid
import os
from model import Encoder
from tqdm import tqdm
import base64
import sys
# app = Flask(__name__)
# cors = CORS(app)
# app.config['CORS_HEADERS'] = 'Content-Type'

# ### instantiate the mongo client api
# client = pymongo.MongoClient("mongodb+srv://Shree3245:Acnolgia3245@cluster0-kcrtv.mongodb.net/<dbname>?retryWrites=true&w=majority")
# ## connect to db
# db = client['<dbname>']
# ### the requisite documents
# user = db.users
# files = db.files

def encrypt(data,id,filename):
    # print("starting encyrpt")
    b64ToFile(filename,data)
    # print("converted string to file")
    f = os.listdir('./')
    inputs = []
    for i in f:
        if '.png' in i:
            inputs.append(i)

    encoder = Encoder('./out/main.tar')
    # print("called encoder")
    encoder.encode_and_save(filename, os.path.join("./out/compressed/", '{}comp.xfr'.format(id)))
    # print('converted dadta')
    print( fileToB64(os.path.join("./out/compressed/", '{}comp.xfr'.format(id))))

def decrypt():
    return

def b64ToFile(filename,data):
    new=(base64.b64decode(data))
    image_result = open(filename, 'wb') # create a writable image and write the decoding result
    image_result.write(new)
    
    

def fileToB64(path):
    with open(path, "rb") as image_file:
        # print("writing file to b64")
        return base64.b64encode(image_file.read())
    

if sys.argv[1] =='encrypt':
    encrypt(sys.argv[2],sys.argv[3],sys.argv[4])

### All files based functions
# @app.route("/files/add",methods=["POST"])
# @cross_origin()
# def add():
#     content = request.json
#     data = bytes(content['data'], encoding='utf-8')
#     print(type(data))
#     id = uuid.uuid4()
#     if content['username']:
#         if not user.find_one({"username": content['username']}):
#             return jsonify({"message":"you dont exist"}),401
#         newData = encrypt(data,id,content['filename'])
#         newFile = {
#             "id": id,
#             "username":content['username'],
#             "data":newData,
#             "filename":content['filename']
#         }
#         files.insert_one(newFile)
#         return jsonify({"message":"success"}),201
#     return jsonify({"message":"No data passed"}),401

# @app.route("/files/fileDownload",methods=["POST"])
# @cross_origin()
# def fileDownload():
#     content = request.json
#     if content['username']:
#         if not user.find_one({"username": content['username']}):
#             return jsonify({"message":"you dont exist"}),401
#         fileData = files.find_one({'username':content['username'],"id":content['id']})
#         return jsonify({"data":fileData['data'],"filename":fileData['filename']}),201
#     return jsonify({"message":"no required data given"}),401

# @app.route("/files/fileList",methods=['POST'])
# @cross_origin()
# def fileList():
#     content = request.json
#     if content['username'] :
#         if not user.find_one({"username": content['username']}):
#             return jsonify({"message":"you dont exist"}),401
#         docs = files.find({"username":content['username']}),201
#         fileData = {}
#         for i in docs[0]:
#             fileData[i['id']]=i['filename']
#         print(fileData)
#         return jsonify(fileData),201
#     return jsonify({"message":"no requisite data"}),401

    

# ### All user based functions
# @app.route("/users/register", methods=["POST"])
# @cross_origin()
# def register():
#     content = request.json
#     if not content['username'] or content['password']:
#         doc = user.find_one({"username": content['username']})
#         if not doc:
#             userData ={
#                 "username":content['username'],
#                 "password":content['password'],
#                 "email":content['email']
#             }        
#             user.insert_one(userData)
#             return jsonify({"message":"success"}), 201
#         return jsonify({"message":"user exists"}), 400
#     return jsonify({"message":"some error occured"}),500

# @app.route("/users/login",methods=["POST"])
# @cross_origin()
# def login():
#     content = request.json
#     if not content['username'] or content['password']:
#         if not user.find_one({"username": content['username'], "password":content["password"]}):
#             return jsonify({"message":"user/pass has some problem"}),401
#         return jsonify({"message":"logged in"}),201


# @app.route('/api/add_message/<uuid>', methods=['GET', 'POST'])
# @cross_origin()
# def add_message(uuid):
#     content = request.json
#     print (content['mytext'])
#     return jsonify({"uuid":uuid})

# if __name__ == '__main__':
#     app.run(debug=True)