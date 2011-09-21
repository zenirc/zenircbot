Install
=======

Copy the .js.dist files to .js and edit their values in order to setup
this bot.

You'll need to install the node library `redis` (installed via npm) to
run the base bot. github.js relies on `express` (installed via npm)
and jira_feed.py relies on `BeautifulSoup<4.0`, `feedparser` and
`redis` (installed via pip or easy_install)

To start it, run `node bot.js`.

You'll find interesting services in `services/` and you can run them
using their respective interpreter.

ZenIRCBot uses redis to communicate via pub/sub. The bot writes
everything to the redis channel `out` and reads what to say from the
redis channel `in`.

The admin service has now defined a structure for running the bot. It
assumes you are running it in tmux, with specifically named
windows. If you start the bot using fabric and the command `fab zenbot
restart` it will start tmux and start the bot, then do `fab zenbot
service:admin` and it will start the admin service. From there you can
issue commands to the bot like `botname: service github` and it will
start the github service.
