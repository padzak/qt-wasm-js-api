let wsUrl = new String("");
let devices = new Map();
let selectionLabels = [];
let windowWidth = 0;
let windowHeight = 0;
var popup;
sessionStorage.setItem('popupActive','inactive');
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

function openSetStripSensor(x, y, value, index, name, nameOffset) {
  const sensorId = sessionStorage.getItem('currentSensor');
  const propName = qtLoader.module().UTF8ToString(name, nameOffset);
  createTextInputPopup((inputValue) => {
    qtLoader.module().JavaScriptAPI.setStripSensor(sensorId, index, propName, Number(inputValue));  
  }, value, x, y);
}

function openSetLabel(x, y, width, devId, devIdOffset, devLabel, devLabelOffset) {
  const id = qtLoader.module().UTF8ToString(devId, devIdOffset);
  const label = qtLoader.module().UTF8ToString(devLabel, devLabelOffset);
  createTextInputPopup((inputText) => {
    qtLoader.module().JavaScriptAPI.setLabel(id, inputText);  
  }, label, x, y, width);
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

function openFirstArgCommand(x, y) {
  createTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setFirstCmdValue(Number(value));  
  }, "", x, y);
}

function openSecondArgCommand(x, y) { 
  createTextInputPopup((value) => {
    qtLoader.module().JavaScriptAPI.setSecondCmdValue(Number(value));  
  }, "", x ,y);
}

function createTextInputPopup(callbackFunction, defaultText, x, y, width) {
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
    console.log("Setting width: " + width);
    popup.style.width = width + "px";
  }

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
          // code to close the popup
      }
  });

  popup.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
      clearPopups();
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
    loginButton.addEventListener("click", function() { 
        var username = document.getElementById("usernameInput").value;
        var password = document.getElementById("passwordInput").value;
        qtLoader.module().JavaScriptAPI.sendLoginData(username, password);  
        clearPopups();
    });
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

  fetch('./html/popups/changePasswordPopup.html')
  .then(response => response.text())
  .then(text => popup.innerHTML = text)
  .then(() => {
    document.getElementById("usernameDisplay").innerHTML = userName;
    var changePassword = document.getElementById("changePassButton");
    changePassword.disabled = true;
    changePassword.addEventListener("click", function() {
      var newPassword = document.getElementById("newPassword").value;
      var currPassword = document.getElementById("currentPassword").value;
      qtLoader.module().JavaScriptAPI.changePassword(userName, newPassword, currPassword);
      clearPopups();
    });
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
}

function openAddUserPopup() {
  var isActive = sessionStorage.getItem("popupActive");
  if (isActive == 'active') {
    return;
  }
  sessionStorage.setItem('popupActive','active');
  
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
    addUserButton.addEventListener("click", function() { 
        var username = document.getElementById("usernameInput").value;
        var password = document.getElementById("newPassword").value;
        var role = document.getElementById("roleSelect").value;
        qtLoader.module().JavaScriptAPI.addNewUser(username, password, role);
        clearPopups();
    });
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
}

function createBackButtonBar(pageName) {
  backBar = document.createElement("div");
  backBar.classList.add("backBar");
  fetch("./html/popups/backBar.html")
  .then(response => response.text())
  .then(text => backBar.innerHTML = text)
  .then(() => {
    var name = document.getElementById("pageName");
    name.innerHTML = pageName;
  });
  sessionStorage.setItem('backBarActive','active');

}

function clearPopups() {
  let active = sessionStorage.getItem('popupActive');
  if (active == 'inactive')
    return;
  popup.remove();
  sessionStorage.setItem('popupActive','inactive');
  active = sessionStorage.getItem('backBarActive');
  if (active === 'inactive')
    return;
  backBar.remove();
  sessionStorage.setItem('backBarActive','inactive');
}

window.addEventListener("resize", (event) => {
  qtLoader.module().JavaScriptAPI.windowSizeChanged();
  let active = sessionStorage.getItem("popupActive");
  if (active == 'inactive')
    return;
  popup.style.width = windowWidth + "px";
  popup.style.height = windowHeight + "px";
});




