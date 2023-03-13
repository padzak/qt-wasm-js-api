#!/bin/bash

sed -i -e "s/unexportedRuntimeFunction('allocateUTF8', false)/Module[\"allocateUTF8\"] = allocateUTF8/g" ui.js
sed -i -e "s/unexportedRuntimeFunction('UTF8ToString', false)/Module[\"UTF8ToString\"] = UTF8ToString/g" ui.js
sed -i -e "s/unexportedRuntimeFunction('stringToUTF8', false)/Module[\"stringToUTF8\"] = stringToUTF8/g" ui.js

sed -i '' -e '/<meta charset="utf-8">/a\
    <link rel="stylesheet" href="jsAPI.css">
' ui.html

sed -i '' -e '/<script type="text\/javascript" src="qtloader.js"><\/script>/a\
    <script type="text\/javascript" src="./scripts/jsAPI.js"><\/script>
' ui.html

sed -i '' -e '/<script type="text\/javascript" src="qtloader.js"><\/script>/a\
    <script type="text\/javascript" src="./scripts/audioAlarm.js"><\/script>
' ui.html