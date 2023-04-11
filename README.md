# Qt JavaScript - WebAssembly API
The API files have to be served with the Qt WebAssembly application. The documentation covering the API installation is provided here.

# jsAPI.js
File with JavaScript functions responsible for communication and data exchange between browser and the WebAssembly Qt application.
JavaScript methods are invoked from within the Qt application, using the Emscripten SDK. A set of event listeners handles all the input provided to the browser and further supplies it the Qt app. 