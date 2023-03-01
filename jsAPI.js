let wsUrl = new String("");
let devices = new Map();
let selectionLabels = [];

function setWebSocketUrl(pointer, offset) {
  // wsUrl = qtLoader.module().UTF8ToString(pointer, offset);
  wsUrl = "ws://192.168.1.9:8888";
  console.log(wsUrl);
}

function openSetLabel(devId, devIdOffset, devLabel, devLabelOffset) {
  const id = qtLoader.module().UTF8ToString(devId, devIdOffset);
  const label = qtLoader.module().UTF8ToString(devLabel, devLabelOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setLabel(id, inputText);  
  }, label);
}

function openSetUnitName(unitName, unitNameOffset) {
  const name = qtLoader.module().UTF8ToString(unitName, unitNameOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setUnitName(inputText);  
  }, name);
}

function setSelection(deviceType, deviceId, signalId, ptrLabel, labelOffset, ptrUnit, unitOffset) {
  let deviceTypeWithId = deviceType.toString() + "-" + deviceId.toString();
  console.log(deviceTypeWithId);
  label = qtLoader.module().UTF8ToString(ptrLabel, labelOffset);
  console.log(label);
  unit = qtLoader.module().UTF8ToString(ptrUnit, unitOffset);
  console.log(unit);
  
  if (devices.has(deviceTypeWithId)) {
    devices.get(deviceTypeWithId).get('signals').push(signalId);
    devices.get(deviceTypeWithId).get('labels').push(label);
    devices.get(deviceTypeWithId).get('units').push(unit);
  } 
  else {
    let device = new Map();
    device.set('device', deviceType);
    device.set('deviceId', deviceId);
    let signals = [signalId];
    console.log(signals);
    device.set('signals', signals);
    let labels = new Array(label);
    device.set('labels', labels);
    let units = new Array(unit);
    device.set('units', units);

    devices.set(deviceTypeWithId, device);
  }

  let signal = [deviceType, deviceId, signalId, label];
  console.log("Signal: " + signal.toString());
}

function clearSelections() {
  devices.clear();
}


const toObject = (map = new Map) => 
  Object.fromEntries
    ( Array.from
        ( map.entries()
        , ([ k, v ]) =>
            v instanceof Map
              ? [ k, toObject (v) ]
              : [ k, v ]
        )
    )

function openGraph() {
  console.log(devices);
  sessionStorage.setItem('serverAddress', wsUrl);

  const devObject = toObject(devices);
  const jsonDevices = JSON.stringify(devObject);

  console.log(jsonDevices);
  sessionStorage.setItem('chartMetadata', jsonDevices);
   
  window.open("./build/index.html", '_blank');
}

function setLabel(pointer, offset) {
  label = qtLoader.module().UTF8ToString(pointer, offset);
  console.log(label);
  selectionLabels.push(label);
}


function testString(pointer, offset) {
  console.log("testString ptr: " + pointer);
  console.log("testString offset: " + offset);

  setTimeout(function() {
    console.log(qtLoader.module().UTF8ToString(pointer, offset));
  }, 3000);

  console.log(selectionLabels);
}

// document.addEventListener('keydown', function(event) {
//   console.log('Key pressed: ' + event.key);
//   if (event.key == 'a') {
//     // console.log(qtLoader.module().UTF8ToString(qtLoader.module()._getStr()));
//     console.log(location)
//   }

//   if (event.key == 'g') {
//     console.log("Array test");
//     let ptr = qtLoader.module()._getArray()
//     console.log(qtLoader.module()._getArray());
//     let arrayTest = new Int32Array(qtLoader.module().asm.memory.buffer, ptr, 3);
//     console.log(arrayTest);
//   }

// });

function createTextInputPopup(callbackFunction, defaultText) {
  defaultText = typeof defaultText !== 'undefined' ? defaultText : "";
  var popup = document.createElement("div");
  popup.style.display = "block";
  popup.style.position = "absolute";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "white";
  popup.style.padding = "20px";
  popup.style.border = "1px solid black";

  var textField = document.createElement("input");
  textField.type = "text";
  textField.value = defaultText;
  textField.addEventListener("keydown", function(event) {
      if (event.keyCode === 13) {
          // Code to handle text input when "Enter" is pressed
          var inputValue = textField.value;
          callbackFunction(inputValue);
          popup.remove();
          // code to close the popup
      }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      popup.remove();
    }
  }, {once: true});

  popup.appendChild(textField);
  document.body.appendChild(popup);
}

function openLoginPopup() {
    var popup = document.createElement("div");
    popup.className = "loginPopup"

    // Username input field
    var username = document.createElement("div");
    username.className = "textFieldLabeled"
    var usernameLabel = document.createElement("label");
    usernameLabel.innerHTML = "Username";
    usernameLabel.className = "textLabel";
    var usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.class = "textInput"
    usernameInput.id = "usernameInput";

    username.appendChild(usernameLabel);
    username.appendChild(usernameInput);


    // Password input field
    var password = document.createElement("div");
    password.className = "textFieldLabeled"
    var passwordLabel = document.createElement("label");
    passwordLabel.className = "textLabel";
    passwordLabel.innerHTML = "Password";
    var passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "passwordInput";
    passwordInput.class = "textInput"

    password.appendChild(passwordLabel);
    password.appendChild(passwordInput);

    // Log In button
    var loginButton = document.createElement("button");
    loginButton.innerHTML = "Log In";
    loginButton.className = "button"
    loginButton.addEventListener("click", function() {
        var username = document.getElementById("usernameInput").value;
        var password = document.getElementById("passwordInput").value;
        sendLoginDetails(username, password);
        popup.remove();
    });

    document.addEventListener('keydown', function(event) {
      if (event.key === "Escape") {
        popup.remove();
      }
    }, {once: true});

    // Append elements to the popup
    popup.appendChild(username);
    popup.appendChild(password);
    popup.appendChild(loginButton);
    document.body.appendChild(popup);
}

function sendLoginDetails(username, password) {
  // const ptrUser = allocateUTF8(username);
  // const userOffset = username.length;
  // const ptrPass = allocateUTF8(password);
  // const passOffset = password.length;
  qtLoader.module().JavaScriptAPI.sendLoginData(username, password);
  

  console.log("Username: " + username);
  console.log("Password: " + password);
}


function openChangePasswordPopup(user, userOffset) {
  const userName = qtLoader.module().UTF8ToString(user, userOffset);
  var popup = document.createElement("div");
  popup.className = "loginPopup"

  // Username input field
  var username = document.createElement("div");
  username.className = "textFieldLabeled"
  var usernameLabel = document.createElement("label");
  usernameLabel.innerHTML = "Username";
  usernameLabel.className = "textLabel";
  var usernameDisplay = document.createElement("label");
  usernameDisplay.innerHTML = userName;
  usernameDisplay.className = "simpleText";
  username.appendChild(usernameLabel);
  username.appendChild(usernameDisplay);

  // Current Password input field
  var currentPassword = document.createElement("div");
  currentPassword.className = "textFieldLabeled"
  var currentPasswordLabel = document.createElement("label");
  currentPasswordLabel.className = "textLabel";
  currentPasswordLabel.innerHTML = "Current Password";
  var currentPasswordInput = document.createElement("input");
  currentPasswordInput.type = "password";
  currentPasswordInput.id = "currentPasswordInput";
  currentPasswordInput.class = "textInput"
  currentPassword.appendChild(currentPasswordLabel);
  currentPassword.appendChild(currentPasswordInput);

  // New Password input field
  var newPassword = document.createElement("div");
  newPassword.className = "textFieldLabeled"
  var newPasswordLabel = document.createElement("label");
  newPasswordLabel.className = "textLabel";
  newPasswordLabel.innerHTML = "New Password";
  var newPasswordInput = document.createElement("input");
  newPasswordInput.type = "password";
  newPasswordInput.id = "newPasswordInput";
  newPasswordInput.class = "textInput"
  newPassword.appendChild(newPasswordLabel);
  newPassword.appendChild(newPasswordInput);

  // Confirm Password input field
  var confirmPassword = document.createElement("div");
  confirmPassword.className = "textFieldLabeled"
  var confirmPasswordLabel = document.createElement("label");
  confirmPasswordLabel.className = "textLabel";
  confirmPasswordLabel.innerHTML = "Confirm Password";
  var confirmPasswordInput = document.createElement("input");
  confirmPasswordInput.type = "password";
  confirmPasswordInput.id = "confirmPasswordInput";
  confirmPasswordInput.class = "textInput"
  confirmPassword.appendChild(confirmPasswordLabel);
  confirmPassword.appendChild(confirmPasswordInput);

  // Change Password button
  var changePasswordButton = document.createElement("button");
  changePasswordButton.innerHTML = "Change Password";
  changePasswordButton.className = "button"
  changePasswordButton.addEventListener("click", function() {
      var newPassword = document.getElementById("newPasswordInput").value;
      // sendLoginDetails(username, password);
      popup.remove();
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      console.log("ESCAPE")
      popup.remove();
    }
  }, {once: true});

  // Append elements to the popup
  popup.appendChild(username);
  popup.appendChild(currentPassword);
  popup.appendChild(newPassword);
  popup.appendChild(confirmPassword);
  popup.appendChild(changePasswordButton);
  document.body.appendChild(popup);
}




