var api = require('zenircbot-api')
  , fs = require('fs')
  , path = require('path')
  , shell_parse = require('shell-quote').parse
  , forever = require('forever')
  , admin_config = api.load_config(path.join(__dirname, 'admin.json'))
  , bot_config = api.load_config(path.join(__dirname, '..', '/bot.json'))
  , zen = new api.ZenIRCBot(bot_config.redis)
  , service_regex = /(\w+) (.*)/
  , services = {}
  , language_map = {
      'js': 'node'
    , 'node': 'node'
    , 'py': 'python'
    , 'rb': 'ruby'
    , 'pl': 'perl'
    }

admin_config.services.forEach(start_service)

zen.register_commands('admin.js', [
  {
    name: 'start <service>'
  , description: 'This will start the service mentioned.'
  }, {
    name: 'restart <service>'
  , description: 'This will restart the service mentioned if it was started via admin.js.'
  }, {
    name: 'stop <service>',
   description: 'This will stop the service mentioned if it was started via admin.js.'
  }, {
    name: 'join <channel>'
  , description: 'Joins the channel specified.'
  }, {
    name: 'part <channel>',
  , description: 'Parts the channel specified.'
  }
])

function start(lang, script, service, args) {
  var msg = 'starting ' + script + ' using ' + lang
  var command = [
    language_map[lang], script, bot_config.redis.host,
    bot_config.redis.port, bot_config.redis.db
  ].concat(args)
  console.log(msg)
  zen.send_admin_message(msg)
  var child = forever.start(command, {
                   max: 10000,
                   silent: false
                 })
  forever.startServer(child)
  services[service] = child
  forever.cli.list()
}

function start_service(service) {
  if (services[service]) {
    if (services[service].running) {
      zen.send_admin_message(service + ' is already running')
    } else {
      zen.send_admin_message('starting ' + service)
      services[service].start()
    }
  } else {
    if (/^custom/.test(service)) {
      fs.readFile(service + '/package.json', function(err, data) {
        if (err) {
          zen.send_admin_message('error: ' + err)
        } else {
          var conf = JSON.parse(data)
            , command = shell_parse(conf.scripts.start)
          start(command[0], path.join(service, command[1]), service, command.splice(2))
        }
      })
    } else {
      start(service.split('.')[1], service, service)
    }

  }
}

function restart_service(service) {
  if (!services[service] || !services[service].running) {
    zen.send_admin_message(service + ' isn\'t running')
  } else {
    zen.send_admin_message('restarting ' + service)
    services[service].restart()
  }
}

function stop_service(service) {
  if (!services[service] || !services[service].running) {
    zen.send_admin_message(service + ' isn\'t running')
  } else {
    zen.send_admin_message('stopping ' + service)
    services[service].stop()
  }
}

var filtered = zen.filter({version: 1, type: 'directed_privmsg'})
filtered.on('data', function(msg){
  if (bot_config.servers[0].admin_nicks.indexOf(msg.data.sender) !== -1) {
    if (service_regex.test(msg.data.message)) {
      var result = service_regex.exec(msg.data.message)
      switch (result[1]) {
        case 'start':
          start_service(result[2])
          break
        case 'restart':
          restart_service(result[2])
          break
        case 'stop':
          stop_service(result[2])
          break
        case 'join':
          zen.join_channel(result[2])
          break
        case 'part':
          zen.part_channel(result[2])
          break
      }
    }
  }
})
