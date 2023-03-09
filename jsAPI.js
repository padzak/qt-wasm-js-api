let wsUrl = new String("");
let devices = new Map();
let selectionLabels = [];
let windowWidth = 0;
let windowHeight = 0;

function setWebSocketUrl(pointer, offset) {
  // wsUrl = qtLoader.module().UTF8ToString(pointer, offset);
  wsUrl = "ws://192.168.1.9:8888";
  console.log(wsUrl);
}

function setWindowHeight(alertBarHeight) { 
  windowHeight = window.innerHeight - 1.4 * alertBarHeight;
}

function setWindowWidth(navBarWidth) { 
  windowWidth = window.innerWidth - 1.325 * navBarWidth;
}

function setCurrentSensor(sensor, sensorOffset) {
  const sensorQt = qtLoader.module().UTF8ToString(sensor, sensorOffset);
  sessionStorage.setItem('currentSensor', sensorQt);
  let storedSensor = sessionStorage.getItem('currentSensor');
  console.log("Stored sensor: " + storedSensor);
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

function openFirstArgCommand(label, labelOffset) {
  let popupLabel = qtLoader.module().UTF8ToString(label, labelOffset);
  popupLabel = popupLabel.charAt(0).toUpperCase() + popupLabel.slice(1);
  console.log("Open first argument popup");
  createLabeledTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setFirstCmdValue(Number(value));  
  }, popupLabel);
}

function openSecondArgCommand(label, labelOffset) { 
  let popupLabel = qtLoader.module().UTF8ToString(label, labelOffset);
  popupLabel = popupLabel.charAt(0).toUpperCase() + popupLabel.slice(1);
  createLabeledTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setSecondCmdValue(Number(value));  
  }, popupLabel);
}


function createTextInputPopup(callbackFunction, defaultText) {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');

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
          sessionStorage.setItem('popupActive','inactive');
          // code to close the popup
      }
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
    }
  });

  popup.appendChild(textField);
  document.body.appendChild(popup);
  textField.focus();
}

function createLabeledTextInputPopup(callbackFunction, label, defaultText) {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    console.log("Popup already active");
    return;
  }
  sessionStorage.setItem('popupActive','active');

  defaultText = typeof defaultText !== 'undefined' ? defaultText : "";
  var popup = document.createElement("div");
  popup.classList.add("commonPopup", "commandPopup");
  popup.style.display = "block";
  popup.style.position = "absolute";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";

  var textLabel = document.createElement("label");
  textLabel.innerHTML = label;
  textLabel.classList.add("textLabel");
  var textField = document.createElement("input");
  textField.type = "text";
  textField.classList.add("settingsTextField");
  textField.value = defaultText;
  textField.addEventListener("keydown", function(event) {
      if (event.keyCode === 13) {
          // Code to handle text input when "Enter" is pressed
          var inputValue = textField.value;
          console.log("The input value is: " + inputValue);
          callbackFunction(inputValue);
          popup.remove();
          sessionStorage.setItem('popupActive','inactive');

      }
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
    }
  });

  popup.appendChild(textLabel);
  popup.appendChild(textField);
  document.body.appendChild(popup);
  textField.focus();
}

function openLoginPopup() {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');

  var popup = document.createElement("div");
  fetch('loginPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text);
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";

  // Set event handlers
  setTimeout(function () {
    var loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", function() { 
        var username = document.getElementById("usernameInput").value;
        var password = document.getElementById("passwordInput").value;
        sendLoginDetails(username, password);
        popup.remove();
        sessionStorage.setItem('popupActive','inactive');
    });
  }, 500);

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
    }
  });

  let firstClick = true;
  function handleCloseOnClick(event) {
    if (firstClick) {
      firstClick = false;
      return;
    } else if (!popup.contains(event.target)) {
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
      document.removeEventListener('click', handleCloseOnClick);
    }
  }

  document.addEventListener('click', handleCloseOnClick);
  document.body.appendChild(popup);
  setTimeout(() => {
    let input = document.getElementById("usernameInput");
    input.focus();
  }, 500);
}

function sendLoginDetails(username, password) {
  qtLoader.module().JavaScriptAPI.sendLoginData(username, password);  
}

function openChangePasswordPopup(user, userOffset) {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');

  const userName = qtLoader.module().UTF8ToString(user, userOffset);
  var popup = document.createElement("div");
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";

  fetch('changePasswordPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text);

  setTimeout(() => {
    document.getElementById("usernameDisplay").innerHTML = userName;
  }, 500);

  // Set event handlers
  setTimeout(() =>{
    var changePassword = document.getElementById("changePassButton");
    changePassword.addEventListener("click", function() {
      var newPassword = document.getElementById("newPassword").value;
      console.log("new password: " + newPassword);
      // sendLoginDetails(username, password);
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
  });
  }, 500);
  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
    }
  });

  document.body.appendChild(popup);
  
  setTimeout(() => {
    var currentPassword = document.getElementById("currentPassword");
    currentPassword.focus();
  }, 500);
}




