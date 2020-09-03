DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Logged_in_user;
DROP TABLE IF EXISTS Message;

/* Email is unique for each user (checked by server.py or database_helper.py) and therefore primary key */
Create table User(
  email varchar(35),
  password varchar(60),
  firstname varchar(30),
  familyname varchar(30),
  gender varchar(10),
  city varchar(30),
  country varchar(20),
  constraint pk_user primary key (email));

Create table Logged_in_user(
  token varchar(36),
  email varchar(35),
  constraint pk_logged_in_user primary key (token));

Create table Message(
  id integer primary key autoincrement,
  email_sender varchar(36),
  message varchar(1000),
  email_receiver varchar(35),
  city varchar(300));
