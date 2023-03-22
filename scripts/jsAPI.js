let wsUrl = new String("");
let devices = new Map();
let selectionLabels = [];
let windowWidth = 0;
let windowHeight = 0;
let navBarWidth = 0;
let alertBarHeight = 0;
var popup;
var buttonGeneric;
var backBar;
sessionStorage.setItem('popupActive','inactive');
sessionStorage.setItem('button','inactive');
sessionStorage.setItem('backBarActive','inactive');

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

function openSetStripSensor(x, y, fontSize, width, value, index, name, nameOffset) {
  const sensorId = sessionStorage.getItem('currentSensor');
  const propName = qtLoader.module().UTF8ToString(name, nameOffset);
  createTextInputPopup((inputValue) => {
    qtLoader.module().JavaScriptAPI.setStripSensor(sensorId, index, propName, Number(inputValue));  
  }, value, x, (y - 14), fontSize, width, "normal", "stripSensorInput");
}

function openSetLabel(x, y, fontSize, width, devId, devIdOffset, devLabel, devLabelOffset, buttonX, buttonY, buttonWidth, buttonHeight) {
  const id = qtLoader.module().UTF8ToString(devId, devIdOffset);
  const label = qtLoader.module().UTF8ToString(devLabel, devLabelOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setLabel(id, inputText);  
  }, label, (x - 3), (y - 1), fontSize, width - 5);
  createButton(() => {
    var newLabel = document.getElementById("textInput").value;
    qtLoader.module().JavaScriptAPI.setLabel(id, newLabel);
  }, "Apply", label, (fontSize + 0.5), (buttonX + 5), (buttonY - 1), (buttonWidth - 11), buttonHeight);
}

function openSetUnitName(x, y, fontSize, width, unitName, unitNameOffset) {
  const name = qtLoader.module().UTF8ToString(unitName, unitNameOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setUnitName(inputText);  
  }, name, (x - 4), (y + 9), (fontSize - 0.75), width, 600, "setUnitName");
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

function openFirstArgCommand(x, y, fontSize, width, value) {
  console.log("Open first argument popup");
  createTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setFirstCmdValue(Number(value));  
  }, value, (x - 2), (y + 12), fontSize, width);
}

function openSecondArgCommand(x, y, fontSize, width, value) { 
  createTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setSecondCmdValue(Number(value));  
  }, value, (x - 3) ,(y + 12), fontSize, width);
}

function openHelp() {
  window.open("./src/guide.pdf");
}

function setTheme(type) {
  var styleSheet = document.getElementById("themeStyle");
  switch (type) {
    case 0:
      styleSheet.href = "./themes/standard.css";
      break;
    case 1:
      styleSheet.href = "./themes/blueDark.css";
      break;
    case 2:
      styleSheet.href = "./themes/blue.css";
      break;
  }
}

function createTextInputPopup(callbackFunction, defaultText, x, y, fontSize, width, fontWeight, classList) {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');
  defaultText = typeof defaultText !== 'undefined' ? defaultText : "";
  
  popup = document.createElement("div");
  popup.classList.add("commonPopup", "textInputPopup");
  if (x !== 'undefined' && y !== 'undefined') {
    popup.style.left = x + "px";
    popup.style.top = y + "px";
  }

  if (width !== 'undefined') {
    popup.style.width = width + "px";
  }

  popup.style.fontSize = 27 + "pt";
  var textField = document.createElement("input");
  textField.type = "text";
  textField.classList.add("settingsTextField", "textInput");
  if (classList !== undefined) {
    textField.classList.add(classList);
  }
  textField.id = "textInput";
  textField.value = defaultText;
  textField.style.fontSize = fontSize + "pt";
  textField.style.position = "relative";
  textField.style.margin = 0 + "px";
  if (fontWeight !== undefined) {
    textField.style.fontWeight = fontWeight;
  }
  else {
    textField.style.fontWeight = "normal";
  }
  textField.addEventListener("keydown", function(event) {
      if (event.keyCode === 13) {
          var inputValue = textField.value;
          callbackFunction(inputValue);
          clearPopups();
      }
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      clearPopups();
    }
  });

  let firstClick = true;
  function handleCloseOnClick(event) {
    if (firstClick) {
      firstClick = false;
      return;
    } else if (!popup.contains(event.target)) {
      clearPopups();
      document.removeEventListener('click', handleCloseOnClick);
    }
  }
  document.addEventListener('click', handleCloseOnClick);

  popup.appendChild(textField);
  document.body.appendChild(popup);
  textField.focus();
}

function createButton(callbackFunction, buttonText, initialText, fontSize, x, y, width, height) {
  var isActive = sessionStorage.getItem('button');
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('button', 'active');
  buttonGeneric = document.createElement("div");
  buttonGeneric.style.position = "absolute";

  buttonGeneric.style.left = x + "px";
  buttonGeneric.style.top = y + "px";
  buttonGeneric.style.width = width + "px";
  buttonGeneric.style.height = height + "px";
  buttonGeneric.style.backgroundColor = "#212936";
  var button = document.createElement("button");
  button.innerHTML = buttonText;
  button.classList.add("commonButton");
  button.style.fontSize = fontSize + "pt";
  button.disabled = true;
  var textInput = document.getElementById("textInput");
  function checkInputs() {
    if (textInput.value === initialText && button.disabled === false) {
      button.disabled = true;
      buttonGeneric.remove();
      sessionStorage.setItem('button', 'inactive');
      createButton(callbackFunction, buttonText, initialText, fontSize, x, y, width, height);
    } 
    else {
      button.disabled = false;
      document.body.appendChild(buttonGeneric);
    }
  }  
  buttonGeneric.appendChild(button);
  textInput.addEventListener('keyup', checkInputs);
  button.addEventListener("click", callbackFunction);
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
          clearPopups();
      }
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      clearPopups();
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

  function sendLoginData() {
    var username = document.getElementById("usernameInput").value;
    var password = document.getElementById("passwordInput").value;
    qtLoader.module().JavaScriptAPI.sendLoginData(username, password);  
    clearPopups();
  }

  popup = document.createElement("div");
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";

  fetch('./html/popups/loginPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text)
  .then(() => {
    var loginButton = document.getElementById("loginButton");
    loginButton.disabled = true;
    loginButton.addEventListener("click", sendLoginData);
    var nameInput = document.getElementById("usernameInput");
    nameInput.focus();
    var passInput = document.getElementById("passwordInput");
    function checkInputs() {
      if (nameInput.value === '' || passInput.value === '') {
        loginButton.disabled = true;
      } 
      else {
        loginButton.disabled = false;
      }
    }
    
    nameInput.addEventListener('keyup', checkInputs);
    passInput.addEventListener('keyup', checkInputs);
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      clearPopups();
    }
    if (event.key === "Enter") {
      sendLoginData();
    }
  });

  let firstClick = true;
  function handleCloseOnClick(event) {
    if (firstClick) {
      firstClick = false;
      return;
    } else if (!popup.contains(event.target)) {
      clearPopups();
      document.removeEventListener('click', handleCloseOnClick);
    }
  }
  document.addEventListener('click', handleCloseOnClick);

  createBackButtonBar("Login");

  document.body.appendChild(popup);
}

function openChangePasswordPopup(user, userOffset) {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');
  
  function sendChangePassword() {
    var newPassword = document.getElementById("newPassword").value;
    var currPassword = document.getElementById("currentPassword").value;
    qtLoader.module().JavaScriptAPI.changePassword(userName, newPassword, currPassword);
    clearPopups();
  }

  const userName = qtLoader.module().UTF8ToString(user, userOffset);
  popup = document.createElement("div");
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";

  fetch('./html/popups/changePasswordPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text)
  .then(() => {
    document.getElementById("usernameDisplay").innerHTML = userName;
    var changePassword = document.getElementById("changePassButton");
    changePassword.disabled = true;
    changePassword.addEventListener("click", sendChangePassword);
    var currentPassword = document.getElementById("currentPassword");
    currentPassword.focus();

    var passInput = document.getElementById("newPassword");
    var passConfirm = document.getElementById("confirmPassword");
    function checkInputs() {
      if (currentPassword.value === '' 
          || passInput.value === ''
          || passConfirm.value === '') {
          changePassword.disabled = true;
      } 
      else {
        changePassword.disabled = false;
      }
    }

    currentPassword.addEventListener('keyup', checkInputs);
    passInput.addEventListener('keyup', checkInputs);
    passConfirm.addEventListener('keyup', checkInputs);
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      clearPopups();
    }
    if (event.key === 'Enter') {
      sendChangePassword();
    }
  });

  let firstClick = true;
  function handleCloseOnClick(event) {
    if (firstClick) {
      firstClick = false;
      return;
    } else if (!popup.contains(event.target)) {
      clearPopups();
      document.removeEventListener('click', handleCloseOnClick);
    }
  }
  document.addEventListener('click', handleCloseOnClick);
  document.body.appendChild(popup); 
  createBackButtonBar("Change Password");
}

function openAddUserPopup() {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');
  
  function sendAddUser() {
    var username = document.getElementById("usernameInput").value;
    var password = document.getElementById("newPassword").value;
    var role = document.getElementById("roleSelect").value;
    qtLoader.module().JavaScriptAPI.addNewUser(username, password, role);
    clearPopups();
  }

  popup = document.createElement("div");
  popup.classList.add("commonPopup", "loginPopup");
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";

  fetch('./html/popups/addNewUser.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text)
  .then(() => {
    var addUserButton = document.getElementById("addUserButton");
    addUserButton.disabled = true;
    addUserButton.addEventListener("click", sendAddUser);
    var nameInput = document.getElementById("usernameInput");
    nameInput.focus();
    var passInput = document.getElementById("newPassword");
    var passConfirm = document.getElementById("confirmPassword");
    function checkInputs() {
      if (nameInput.value === '' 
          || passInput.value === ''
          || passConfirm.value === '') {
          addUserButton.disabled = true;
      } 
      else {
        addUserButton.disabled = false;
      }
    }
    nameInput.addEventListener('keyup', checkInputs);
    passInput.addEventListener('keyup', checkInputs);
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      clearPopups();
    }
    if (event.key === 'Enter') {
      sendAddUser();
    }
  });

  let firstClick = true;
  function handleCloseOnClick(event) {
    if (firstClick) {
      firstClick = false;
      return;
    } else if (!popup.contains(event.target)) {
      clearPopups();
      document.removeEventListener('click', handleCloseOnClick);
    }
  }
  document.addEventListener('click', handleCloseOnClick);
  document.body.appendChild(popup);
  createBackButtonBar("Add User");
}

function createBackButtonBar(pageName) {
  let active = sessionStorage.getItem("backBarActive");
  if (active == 'active')
    return;
    
  backBar = document.createElement("div");
  sessionStorage.setItem("backBarActive", "active");
  backBar.classList.add("backBar");
  backBar.style.height = alertBarHeight + "px";
  fetch("./html/popups/backBar.html")
  .then(response => response.text())
  .then(text => backBar.innerHTML = text)
  .then(() => {
    var displayName = document.getElementById("pageName");
    displayName.innerHTML = pageName;
    var button = document.getElementById("backButton");
    button.style.width = navBarWidth + "px";
    button.style.height = alertBarHeight + "px";
  });
  
  document.body.appendChild(backBar);
}

function clearPopups() {
  let active = sessionStorage.getItem("popupActive");
  if (active == 'active') {
    popup.remove();
  }
  sessionStorage.setItem('popupActive','inactive');
  
  active = sessionStorage.getItem("backBarActive");
  if (active == 'active') {
    backBar.remove();
  }
  sessionStorage.setItem('backBarActive','inactive');

  active = sessionStorage.getItem('button');
  if (active == 'active') {
    buttonGeneric.remove();
  }
  sessionStorage.setItem('button', 'inactive');
}

window.addEventListener("resize", (event) => {
  qtLoader.module().JavaScriptAPI.windowSizeChanged();
  let active = sessionStorage.getItem("popupActive");
  if (active == 'active') {
    popup.style.width = windowWidth + "px";
    popup.style.height = windowHeight + "px";
  }
  active = sessionStorage.getItem("backBarActive");
  if (active == 'active') {
    backBar.style.height = alertBarHeight + "px";
    var button = document.getElementById("backButton");
    button.style.width = navBarWidth + "px";
  }
});




