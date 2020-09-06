var tokenGlobal = 1;

function register() {
  var z = document.getElementById("btn");
  var x = document.getElementById("login");
  var y = document.getElementById("register");
  x.style.display = "none";
  y.style.display = "block";
  z.style.left = "110px";
}

function login() {
  var x = document.getElementById("login");
  var y = document.getElementById("register");
  var z = document.getElementById("btn");
  y.style.display = "none";
  x.style.display = "block";
  z.style.left = "0px";
}

function loadView() {
  let token = localStorage.getItem("token");
  if (token == null) {
    let view = document.getElementById("welcomeview").innerHTML;
    document.getElementById("display_view").innerHTML = view;
  } else {
    tokenGlobal = localStorage.getItem("token");
    let view = document.getElementById("profileview").innerHTML;
    document.getElementById("display_view").innerHTML = view;
    persInfo();
    // getMsg();
  }
}

function connectWebsocket(){
  let url = "wss://twidder-1337.herokuapp.com/api";
 // let url = "ws://" + document.domain + ":5000/api";
  let ws = new WebSocket(url);
  console.log("Websocket start");
  ws.onopen = function(){
    console.log("Websocket onopen");
    ws.send(tokenGlobal)
  }

  ws.onmessage = function(msg){
    console.log("Websocket onopen");
    console.log(msg);
    let res = JSON.parse(msg.data);
    if (res.success == false) {
      console.log(res.message);
      localStorage.removeItem("token");
      let view = document.getElementById("welcomeview").innerHTML;
      document.getElementById("display_view").innerHTML = view;
    }
  }


  ws.onclose = function(){
      console.log("WebSocket closed");
    };


  ws.onerror = function(){
      console.log("Websocket error");
    };

}


function logIn() {
  var email = document.getElementById("login_email").value;
  var password = document.getElementById("login_password").value;
  let req = new XMLHttpRequest();

  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(req.responseText);
      if (res.success) {
        console.log(res);
        localStorage.setItem("token", res.data);
        tokenGlobal = localStorage.getItem("token");
        let view = document.getElementById("profileview").innerHTML;
        document.getElementById("display_view").innerHTML = view;

        persInfo();
        connectWebsocket();
        // getMsg();
        //  } else {
        //  console.log("This browser needs to be updated or have no support for this application.")
        //}
      } else {
        console.log("Wrong username or password");
        document.getElementById("login_res").innerHTML = res.message;
      }
    } else if (this.status == 500) {
      console.log("something went wrong");
    }
  };
  req.open("POST", "/user/signin", true);
  req.setRequestHeader("Content-type", "application/json; charset=utf-8");
  req.send(JSON.stringify({ email: email, password: password }));
}

// Called on click from HTML
function logOut() {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(req.responseText);
      if (res.success) {
        localStorage.removeItem("token");
        let view = document.getElementById("welcomeview").innerHTML;
        document.getElementById("display_view").innerHTML = view;
        console.log(res);
      } else {
        console.log("something went wrong");
      }
    } else if (this.status == 500) {
      console.log("something went wrong");
    }
  };
  req.open("DELETE", "/user/signout", true);
  req.setRequestHeader("Authorization", tokenGlobal);
  req.send();
}

function postMsg() {
  let req = new XMLHttpRequest();
  let email;
  req.onreadystatechange = function () {
    console.log(this.status);
    if (this.readyState == 4 && this.status == 200) {
      console.log("state 4 o 200");
      let res = JSON.parse(req.responseText);
      email = res.data.email;
      postMsg2(email);
    } else if (this.status == 500) {
      console.log("something went wrong");
    }
  };
  req.open("GET", "/user/getuserdatabytoken", true);
  req.setRequestHeader("Authorization", tokenGlobal);
  req.send(null);
}

function postMsg2(email) {
  let email1 = email;
  console.log(email1);
  let req = new XMLHttpRequest();
  console.log()
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(req.responseText);
      console.log(res);
      getMsg();
    } else if (this.status == 500) {
      console.log("postMsg2 500: something went wrong");
    }
  };

  // Get local coordinates
  let longitude;
  let latitude;
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;      
      let message = document.getElementById("wall_msg").value;
      req.open("POST", "/user/postmessage", true);
      req.setRequestHeader("Content-type", "application/json");
      console.log("här")
      console.log(latitude)
      console.log(JSON.stringify({ token: tokenGlobal, email: email, message: message, lat: latitude, longi: longitude }))
      req.send(
        JSON.stringify({ token: tokenGlobal, email: email, message: message, lat: latitude, longi: longitude })
      );

    });
  } else {
    console.error("Geolocation is not supported by this browser!");
  }
}

function postMsgBrowse(event) {
  let message = document.getElementById("browse_wall_msg").value;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(req.responseText);
      console.log(res);
      getBrowseMsg();
    } else if (this.status == 500) {
      console.log("postMsg2 500: something went wrong");
    }
  };

  let longitude;
  let latitude;
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;      
      req.open("POST", "/user/postmessage", true);
      req.setRequestHeader("Content-type", "application/json");
      req.send(
        JSON.stringify({
          token: tokenGlobal,
          email: searchedEmail,
          message: message,
          lat: latitude, 
          longi: longitude
        })
      );
    });
  } else {
    console.error("Geolocation is not supported by this browser!");
  }
}

function getMsg() {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let msg = JSON.parse(req.responseText);
      console.log(msg);
      //let msg = JSON.parse(res.data);
      console.log(msg.data[0].writer);
      console.log(msg.data);
      console.log("Message in db: " + Object.keys(msg.data).length);
      //  console.log(typeof msg);
      document.getElementById("post_msg").innerHTML = null;
      for (i = Object.keys(msg.data).length - 1; i > -1; i--) {
        document.getElementById("post_msg").innerHTML +=
          "<p><b>" +
          msg.data[i].writer +
          ":</b>" +
          "<br>" +
          msg.data[i].content +
          "<br>" +
          msg.data[i].city
          "<br></p>";
      }
    } else if (this.status == 500) {
      console.log("500");
    }
  };
  req.open("GET", "/user/getusermessagesbytoken", true);
  req.setRequestHeader("Authorization", tokenGlobal);
  req.send();
}

function getBrowseMsg() {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let msg = JSON.parse(req.responseText);
      console.log(msg.data[0].writer);
      console.log(msg.data);
      console.log(Object.keys(msg.data).length);
      document.getElementById("browse_post").innerHTML = null;
      for (i = Object.keys(msg.data).length - 1; i > -1; i--) {
        document.getElementById("browse_post").innerHTML +=
          "<p><b>" +
          msg.data[i].writer +
          ":</b>" +
          "<br>" +
          msg.data[i].content +
          "<br>" +
          msg.data[i].city
          "<br></p>";
      }
    } else if (this.status == 500) {
      console.log("500");
    }
  };
  req.open("GET", "/user/getusermessagesbyemail", true);
  req.setRequestHeader("Authorization", tokenGlobal);
  req.setRequestHeader("email", searchedEmail);
  req.send();
}


function browseUser(event) {
  searchedEmail = document.getElementById("browse_user").value;
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(req.responseText);
      console.log(res);
      if (res.success) {
        document.getElementById("browse_fail").innerHTML = null;
        document.getElementById("browse_res").style.display = null;

        document.getElementById("browse_fname").innerHTML = res.data.firstname;
        document.getElementById("browse_lname").innerHTML = res.data.familyname;
        document.getElementById("browse_gender").innerHTML = res.data.gender;
        document.getElementById("browse_city").innerHTML = res.data.city;
        document.getElementById("browse_country").innerHTML = res.data.country;
        document.getElementById("browse_email").innerHTML = res.data.email;
        getBrowseMsg();
      } else {
        document.getElementById("browse_fail").innerHTML = res.message;

        document.getElementById("browse_res").style.display = null;

        document.getElementById("browse_fname").innerHTML = null;
        document.getElementById("browse_lname").innerHTML = null;
        document.getElementById("browse_gender").innerHTML = null;
        document.getElementById("browse_city").innerHTML = null;
        document.getElementById("browse_country").innerHTML = null;
        document.getElementById("browse_email").innerHTML = null;

        document.getElementById("browse_post").innerHTML = null;
      }
    }
  };
  req.open("GET", "/user/getuserdatabyemail", true);
  req.setRequestHeader("Authorization", tokenGlobal);
  req.setRequestHeader("email", searchedEmail);
  req.send();
}


//displays the information about the user on a card.
function persInfo() {
  let req = new XMLHttpRequest();
  req.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let res = JSON.parse(req.responseText);
      console.log("persinfo");
      console.log(res);

      //   let re = serverstub.getUserDataByToken(tokenGlobal);
      if (res.success) {
        document.getElementById("disp_fname").innerHTML = res.data.firstname;
        document.getElementById("disp_lname").innerHTML = res.data.familyname;
        document.getElementById("disp_gender").innerHTML = res.data.gender;
        document.getElementById("disp_city").innerHTML = res.data.city;
        document.getElementById("disp_country").innerHTML = res.data.country;
        document.getElementById("disp_email").innerHTML = res.data.email;
      }
    }
  };
  req.open("GET", "/user/getuserdatabytoken", true);
  req.setRequestHeader("Authorization", tokenGlobal);
  req.send();
}


//changes the password for the user.
function changePsw(event) {
  var old_psw, new_psw1, new_psw2;
  old_psw = document.getElementById("old_psw").value;
  new_psw1 = document.getElementById("new_psw1").value;
  new_psw2 = document.getElementById("new_psw2").value;
  let req = new XMLHttpRequest();
  if (new_psw1 == new_psw2) {
    console.log("Password match");
    req.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log("4 o 200");
        let res = JSON.parse(req.responseText);
        console.log(res);
        console.log("4o 200");
        // let res = serverstub.changePassword(tokenGlobal, old_psw, new_psw1);
        if (res.success) {
          document.getElementById("change_psw").innerHTML = null;
          document.getElementById("change_psw").innerHTML = res.message;
        } else if ((res.success = False)) {
          // Den går aldrig in i den här if satsen?
          console.log("wrong password");
          document.getElementById("change_psw").innerHTML = null;
          document.getElementById("change_psw").innerHTML = res.message;
        }
      }
    };
  } else {
    document.getElementById("change_psw").innerHTML = null;
    document.getElementById("change_psw").innerHTML =
      "New passwords doesn't match";
  }
  req.open("PUT", "/user/changepassword", true);
  req.setRequestHeader("Content-type", "application/json; charset=utf-8");
  req.send(
    JSON.stringify({ token: tokenGlobal, old_psw: old_psw, new_psw: new_psw1 })
  );
}

//function started by onclick submit btn
function submitRegistration(event) {
  var psw1, psw2;
  psw1 = document.getElementById("psw1").value;
  psw2 = document.getElementById("psw2").value;
  if (psw1 == psw2) {
    var user = {
      email: document.getElementById("email").value,
      password: document.getElementById("psw1").value,
      firstname: document.getElementById("fname").value,
      familyname: document.getElementById("lname").value,
      gender: document.getElementById("gender").value,
      city: document.getElementById("city").value,
      country: document.getElementById("country").value,
    };
    console.log(user);

    let req = new XMLHttpRequest();

    req.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let res = JSON.parse(req.responseText);

        // let result = serverstub.signUp(user);
        if (res.success) {
          console.log(res);
          //if (typeof(Storage) !== "undefined") {

          // let res = serverstub.signIn(user.email, user.password);

          localStorage.setItem("token", res.data);
          tokenGlobal = localStorage.getItem("token");

          let view = document.getElementById("profileview").innerHTML;
          document.getElementById("display_view").innerHTML = view;
          persInfo();
          getMsg();
          connectWebsocket();
        } else if (this.status == 500) {
          console.log("something went wrong: 500");
        } else {
          document.getElementById("signup_res").innerHTML = result.message;
        }
      }
    };
    req.open("POST", "/user/signup", true);
    req.setRequestHeader("Content-type", "application/json; charset=utf-8");
    // req.send(JSON.stringify({'token' : tokenGlobal, 'user' : user}));
    req.send(JSON.stringify(user));
  } else {
    console.log("Password input incorrect");
    document.getElementById("signup_res").innerHTML =
      "Password input incorrect";
  }
}

//Shows the correct content when selected from the tab many.
function openView(evt, ViewName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(ViewName).style.display = "grid";

  var all = document.getElementsByClassName("wrapper");
  for (var i = 0; i < all.length; i++) {
    all[i].style.gridTemplateAreas =
      '"userinfo" "postmessage" "account" "browseuser"';
  }

  evt.currentTarget.className += " active";
}

//Brings you home when you click the flame icon.
function home(evt, ViewName) {
  var all = document.getElementsByClassName("wrapper");
  for (var i = 0; i < all.length; i++) {
    all[i].style.gridTemplateAreas =
      '"userinfo postmessage account browseuser"';
  }
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "grid";
  }
}
