from fabric.api import local, settings, env, run, put
from fabric.decorators import runs_once, task
import re

list_window_re = re.compile('^(\d+): ([\w\s]+) \[')
virsh_re = re.compile('.*\d (\w-+).*running')

layer_prefix = {1: 'z', 
                2: 't', 
                3: 'j',}

class TmuxException(Exception):
    pass

class Tmux(object):
    def __init__(self, session_name, run=local, run_args={'capture': True}, layer=1, *args, **kwargs):
        super(Tmux, self).__init__(*args, **kwargs)
        self.session_name = session_name
        self.run = run
        self.run_args = run_args
        self.layer = layer
        with settings(warn_only=True):
            test = self.run('tmux has-session -t %s' % self.session_name)
        if test.failed:
            self.run('tmux new-session -d -s %s' % self.session_name)
        self.run('tmux source-file ~/.tmux.conf')
        self.set_prefix()
        self.windows = {}
        with settings(warn_only=True):        
            windows = self.run('tmux list-windows -t %s' % (self.session_name), **run_args)
            for line in windows.splitlines():
                match = list_window_re.match(line)
                if match:
                    self.windows[match.group(1)] = match.group(2)

    def set_prefix(self):
        if self.layer != 1:
            self.run('tmux unbind-key C-%s' % layer_prefix[1])
            self.run('tmux set-option -g prefix C-%s' % layer_prefix[self.layer])
            self.run('tmux bind-key %s send-prefix' % layer_prefix[self.layer])
            self.run('tmux bind-key C-%s last-window' % layer_prefix[self.layer])

    def new_window(self, num='', name='', command=''):
        orig_num = num
        if num:
            if self.has_window_numbered(num):
                return False
            num = ':%s' % num
        if name:
            if self.has_window_named(name):
                return False
            name = '-n %s' % name
        if command:
            command = '"%s"' % command
        self.run('tmux new-window -t %s%s %s %s' % (self.session_name, num, name, command))
        self.windows[str(orig_num)] = name
        return True

    def rename_window(self, num, name):
        self.run('tmux rename-window -t %s:%s "%s"' % (self.session_name, num, name))

    def kill_window(self, num):
        self.run('tmux kill-window "' % (self.session_name, num, name))

    def send_keys(self, num, command):
        self.run('tmux send-keys -t %s:%s %s' % (self.session_name, num, command))

    def has_window_numbered(self, number):
        return str(number) in self.windows.iterkeys()
        
    def has_window_named(self, name):
        return name in self.windows.itervalues()


@task
def zenbot():
    env.zenbot = Tmux('zenbot')

@task
def restart():
    if env.zenbot.has_window_named('bot'):
        env.zenbot.send_keys('bot','^C')
    else:
        env.zenbot.new_window(name='bot')
    env.zenbot.send_keys('bot',"'node bot.js' ^M")

@task
def service(name):
    prepend = ''
    if env.zenbot.has_window_named(name):
        prepend = '^C'
    else:
        env.zenbot.new_window(name=name)
    env.zenbot.send_keys(name,"%s 'node services/%s.js' ^M" % (prepend, name))
