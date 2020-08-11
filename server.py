from flask import Flask, request, jsonify, send_from_directory
from uuid import uuid4
from gevent.pywsgi import WSGIServer
import database_helper
import json


app = Flask(__name__)

app.debug = True

@app.route('/')
def hello():
    return send_from_directory('static', 'client.html')


# Om e-mail redan är inloggad försöker den skapa två primary keys för samma email (bytt till token nu men
# verkar fortfarande gälla). Kan alltså inte logga in två gånger med samma mejl.
# OBS, lösenordet måste anges som sträng, alltså med "", annars funkar det inte när man ska logga in.
# Ny standard för nästa års labbar att lägga till statuskoder 200 eller 404 typ, vet inte om man skulle behöva skriva "{statuscode : 200}" typ
# Det går att se status: till höger i Postman när man returnerar med statuskoder.
@app.route('/user/signin', methods = ['POST'])
def sign_in():
    user = request.get_json()
    email = user['email']
    password = user['password']
    stored_psw = database_helper.get_password_from_email(email)
    if str(stored_psw) == password:
        if not database_helper.logged_in(email):
            rand_token = str(uuid4())
            database_helper.store_token(rand_token, email)
            return {"success": True, "message": "Successfully signed in.", "data": rand_token}, 200;
        else:
            return {"success": False, "message": "User already logged in."}, 404;
    else:
        return {"success": False, "message": "Wrong password or email"}, 404;


@app.route('/user/signup', methods = ['POST'])
def sign_up():
    user = request.get_json()

    email = user['email']
    password = user['password']
    firstname = user['firstname']
    familyname = user['familyname']
    gender = user['gender']
    city = user['city']
    country = user['country']
    stored_user_email = database_helper.get_email_from_email(email)

    if not stored_user_email:
        database_helper.store_user(email, password, firstname, familyname, gender, city, country)
        rand_token = str(uuid4())
        database_helper.store_token(rand_token, email)
        return {"success": True, "message": "Successfully created new user.", "data": rand_token}, 200;

    else:
        return {"success": False, "message": "User Exist"}, 404


@app.route('/user/signout', methods = ['DELETE'])
def sign_out():
    token = request.headers["Authorization"]
    if database_helper.get_email_from_token(token):
        database_helper.sign_out(token)
        return {"success": True, "message": "Successfully signed out."}, 200
    else:
        return {"success": False, "message": "You are not signed in."}, 404

@app.route('/user/changepassword', methods = ['POST'])
def change_psw():
    user = request.get_json()

    token = user['token']
    old_psw = user['old_psw']
    new_psw = user['new_psw']

    stored_old_password = database_helper.get_password_from_token(token)

    if stored_old_password == old_psw:
        email = database_helper.get_email_from_token(token)
        database_helper.change_psw(email, new_psw)
        return {"success": True, "message": "Password updated"}, 200
    else:
        return {"success": False, "message": "Wrong password"}, 404

@app.route('/user/getuserdatabyemail', methods = ['GET'])
def get_user_data_by_email():
    #user = request.get_json()
    #token = user['token']
    #email = user['email']
    token = request.headers["Authorization"]
    email = request.headers["email"]
    logged_in = database_helper.get_email_from_token(token)
    if logged_in:
            user_details = database_helper.get_user_data_by_email_helper(email)
            if not user_details:
                return {"success": False, "message": "No data found."}, 200
            else:
                return {"success": True, "message": "User messages retrieved.", "data": {'email': user_details[0], 'firstname': user_details[1], 'familyname': user_details[2], 'gender': user_details[3], 'city': user_details[4], 'country': user_details[5]}}, 200
    else:
        return {"success": False, "message": "You are not signed in."}, 404

@app.route('/user/getuserdatabytoken', methods = ['GET'])
def get_user_data_by_token():
    token = request.headers["Authorization"]
    if token is not None:
        email = database_helper.get_email_from_token(token)
        if not email:
            return {"success": False, "message": "You are not signed in."}
        else:
            user_details = database_helper.get_user_data_by_email_helper(email)
            if not user_details:
                return {"success": False, "message": "No data found."}
            else:
                return {"success": True, "message": "User messages retrieved.", "data": {'email': user_details[0], 'firstname': user_details[1], 'familyname': user_details[2], 'gender': user_details[3], 'city': user_details[4], 'country': user_details[5]}}

@app.route('/user/getusermessagesbyemail', methods = ['GET'])
def get_user_messages_by_email():
    #user = request.get_json()
    #token = user['token']
    #email = user['email']
    token = request.headers["Authorization"]
    email = request.headers["email"]
    logged_in = database_helper.get_email_from_token(token)
    if logged_in:
            user_messages = database_helper.get_messages_by_email_helper(email)
            if not user_messages:
                return {"success": False, "message": "No messages found."}, 404
            else:
                return {"success": True, "message": "User messages retrieved.", "data": user_messages}, 200
    else:
        return {"success": False, "message": "You are not signed in."}, 404

@app.route('/user/getusermessagesbytoken', methods = ['GET'])
def get_user_messages_by_token():
    token = request.headers["Authorization"]
    #user = request.get_json()
    #token = user['token']
    email = database_helper.get_email_from_token(token)
    if not email:
        return {"success": False, "message": "You are not signed in."}, 404
    else:
        user_messages = database_helper.get_messages_by_email_helper(email)
        if not user_messages:
            return {"success": False, "message": "No messages found."}, 404
        else:
            return {"success": True, "message": "User messages retrieved.", "data": user_messages}, 200

@app.route('/user/postmessage', methods = ['POST'])
def post_message():
    user = request.get_json()
    sender_token = user['token']
    receiver_email = user['email']
    message = user['message']
    sender_email = database_helper.get_email_from_token(sender_token)
    logged_in = database_helper.get_email_from_token(sender_token)
    if logged_in:
        user_exist = database_helper.get_email_from_email(receiver_email)
        if user_exist:
            database_helper.post_msg(sender_email, receiver_email, message)
            return {"success": True, "message": "Message posted"}, 200
        else:
            return {"success": False, "message": "User doesn't exist."}, 404
    else:
        return {"success": False, "message": "You are not signed in."}, 404

if __name__ == '__main__':
    #app.run()
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
