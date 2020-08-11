import sqlite3
from flask import g
import json

DATABASE_URI = 'database.db'

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE_URI)
    return db

def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None





def get_password_from_email(email):
    db = get_db()
    res = db.execute('Select password from User where email = ?', [email])
    stored_psw = res.fetchone()
    res.close()
    if not stored_psw:
        return "Couldnt find password"
    else:
        stored_psw = str(stored_psw[0])
        return stored_psw

def get_password_from_token(token):
    db = get_db()
    res = db.execute('Select email from Logged_in_user where token = ?', [token])
    email = res.fetchone()
    res.close()
    if not email:
        return False
    else:
        email = str(email[0])
        return get_password_from_email(email)

def change_psw(email, new_psw):
    db = get_db()
    db.execute('update User set password = ? where email = ?', [new_psw, email])
    db.commit()


def store_token(token, email):
    get_db().execute('insert into Logged_in_user values(?, ?);', [token, email])
    get_db().commit()

def store_user(email, password, firstname, familyname, gender, city, country):
    get_db().execute('insert into User values(?, ?, ?, ?, ?, ?, ?);', [email, password, firstname, familyname, gender, city, country])
    get_db().commit()

def get_email_from_email(email):
    stored_email = get_db().execute('Select email from User where email like ?', [email])
    res = stored_email.fetchone()
    stored_email.close()
    if not res:
        return False
    else:
        return True

def get_email_from_token(token):
    db = get_db()
    res = db.execute('Select email from Logged_in_user where token = ?', [token])
    email = res.fetchone()
    res.close()
    if not email:
        return False
    else:
        email = str(email[0])
        return email

def get_email_from_token(token):
    db = get_db()
    res = db.execute('Select email from Logged_in_user where token = ?', [token])
    email = res.fetchone()
    res.close()
    if not email:
        return False
    else:
        email = str(email[0])
        return email


def logged_in(email):
    db = get_db()
    res = db.execute('Select * from Logged_in_user where email = ?', [email])
    match = res.fetchone()
    res.close()
    if not match:
        return False
    else:
        return True

def get_user_data_by_email_helper(email):
    db = get_db()
    user = db.execute('Select email, firstname, familyname, gender, city, country from User where email = ?', [email])
    match = user.fetchone()
    user.close()
    if not match:
        return False
    else:
        return match

def get_messages_by_email_helper(email):
    db = get_db()
    messages = db.execute('Select email_sender, message from Message where email_receiver = ?', [email])
    match = messages.fetchall()
    messages.close()
    if not match:
        return False
    else:
        #msg_list = []
        msg_list = {}
        #return str(match)
        for i in range(len(match)):
            #writer = get_email_from_token(match[i][0])
            dict = {"writer": match[i][0], "content": match[i][1]}
            msg_list.update({i : dict})
            #msg_list.append(dict)
        #return str(msg_list)
        return msg_list
def post_msg(sender_email, reciever_email, message):
    get_db().execute('insert into Message values(?, ?, ?, ?);', [None, sender_email, message, reciever_email])
    get_db().commit()

def sign_out(token):
    get_db().execute('delete from Logged_in_user where token = ?', [token])
    get_db().commit()
