#!/bin/sh

circusd circus.ini &
circusctl add --start bot node ../bot.js -c configs/bot.json
sleep 3
nodeunit tests.js
circusctl quit
