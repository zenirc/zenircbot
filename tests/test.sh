#!/bin/sh

circusd --log-level debug circus.ini &
circusctl add --start bot node ../bot.js -c configs/bot.json
sleep 3
nodeunit tests.js
circusctl quit
