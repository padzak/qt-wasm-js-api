let wsUrl = new String("");
let devices = new Map();
let selectionLabels = [];
let windowWidth = 0;
let windowHeight = 0;
var popup;
sessionStorage.setItem('popupActive','inactive');

function setWebSocketUrl(pointer, offset) {
  // wsUrl = qtLoader.module().UTF8ToString(pointer, offset);
  wsUrl = "ws://192.168.1.9:8888";
  console.log(wsUrl);
}

function setWindowHeight(alertBarHeight) { 
  windowHeight = window.innerHeight - alertBarHeight;
}

function setWindowWidth(navBarWidth) { 
  windowWidth = window.innerWidth - navBarWidth;
}

function setCurrentSensor(sensor, sensorOffset) {
  const sensorQt = qtLoader.module().UTF8ToString(sensor, sensorOffset);
  sessionStorage.setItem('currentSensor', sensorQt);
  let storedSensor = sessionStorage.getItem('currentSensor');
}

function openSetStripSensor(x, y, value, index, name, nameOffset) {
  const sensorId = sessionStorage.getItem('currentSensor');
  const propName = qtLoader.module().UTF8ToString(name, nameOffset);
  createTextInputPopup((inputValue) => {
    qtLoader.module().JavaScriptAPI.setStripSensor(sensorId, index, propName, Number(inputValue));  
  }, value, x, y);
}

function openSetLabel(x, y, devId, devIdOffset, devLabel, devLabelOffset) {
  const id = qtLoader.module().UTF8ToString(devId, devIdOffset);
  const label = qtLoader.module().UTF8ToString(devLabel, devLabelOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setLabel(id, inputText);  
  }, label, x, y);
}

function openSetUnitName(x, y, unitName, unitNameOffset) {
  const name = qtLoader.module().UTF8ToString(unitName, unitNameOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setUnitName(inputText);  
  }, name, x, y);
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

function openFirstArgCommand(x, y) {
  console.log("Open first argument popup");
  createTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setFirstCmdValue(Number(value));  
  }, "", x, y);
}

function openSecondArgCommand(x, y) { 
  createTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setSecondCmdValue(Number(value));  
  }, "", x ,y);
}

function createTextInputPopup(callbackFunction, defaultText, x, y) {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');

  defaultText = typeof defaultText !== 'undefined' ? defaultText : "";
  popup = document.createElement("div");
  popup.classList.add("commonPopup")

  if (x !== 'undefined' && y !== 'undefined') {
    popup.style.right = x + "px";
    popup.style.bottom = y + "px";
  }

  popup.style.display = "block";
  popup.style.position = "absolute";

  var textField = document.createElement("input");
  textField.type = "text";
  textField.classList.add("settingsTextField");
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
    return;
  }
  sessionStorage.setItem('popupActive','active');

  defaultText = typeof defaultText !== 'undefined' ? defaultText : "";
  popup = document.createElement("div");
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
  
  popup = document.createElement("div");
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";
  fetch('loginPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text)
  .then(() => {
    var loginButton = document.getElementById("loginButton");
    loginButton.addEventListener("click", function() { 
        var username = document.getElementById("usernameInput").value;
        var password = document.getElementById("passwordInput").value;
        sendLoginDetails(username, password);
        popup.remove();
        sessionStorage.setItem('popupActive','inactive');
    });
    let input = document.getElementById("usernameInput");
    input.focus();
  });

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
  popup = document.createElement("div");
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";

  fetch('changePasswordPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text)
  .then(() => {
    document.getElementById("usernameDisplay").innerHTML = userName;
    var changePassword = document.getElementById("changePassButton");
    changePassword.addEventListener("click", function() {
      var newPassword = document.getElementById("newPassword").value;
      // TODO Validate & send pasword change  
      popup.remove();
      sessionStorage.setItem('popupActive','inactive');
    });
    var currentPassword = document.getElementById("currentPassword");
    currentPassword.focus();
  });

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
}

function clearPopups() {
  let active = sessionStorage.getItem('popupActive');
  if (active == 'inactive')
    return;

  popup.remove();
  sessionStorage.setItem('popupActive','inactive');
}




