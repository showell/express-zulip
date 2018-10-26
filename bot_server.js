const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

function validate_token(token) {
    if (!token) {
        console.error('rogue client without token is connecting to server!');
        return false;
    }

    const desired_token = process.env.ZULIP_BOT_TOKEN;

    if (!desired_token) {
        console.info('Current client token = ' + token);
        console.error('Please set ZULIP_BOT_TOKEN env var to increase security.');
        return true;
    }

    if (desired_token !== token) {
        console.info('Current client token = ' + token);
        console.error('This does not match our expected bot!');
        return false;
    }

    return true;
}

function run_server(process_message) {
    app.use((req, res, next) => {
        // We will fix Zulip to pass in content-type,
        // but we work around it here.
        req.headers['content-type'] = 'application/json';
        next();
    });

    app.use(bodyParser.json());

    app.post('/', (req, res) => {
        if (!req.body) {
            console.error('programming error processing req.body');
            return;
        }

        if (!validate_token(req.body.token)) {
            return;
        }

        let has_replied = false;

        function send_response(response) {
            if (has_replied) {
                console.error('Extra reply thrown on floor.');
                return;
            }

            has_replied = true;

            if (!response) {
                const err = {response_not_required: true};
                const encoded_err = JSON.stringify(err);
                res.send(encoded_err);
            }

            if (response) {
                const encoded_response = JSON.stringify(response);
                res.send(encoded_response);
            }
        }

        const response = process_message({
            message: req.body.message,
            trigger: req.body.trigger,
            send: send_response,
        });
    });

    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}

function trigger_matches(opts) {
    const message_trigger = opts.message_trigger;
    var listener_triggers = opts.listener_triggers;

    if (!listener_triggers) {
        return true;
    }

    if (typeof(listener_triggers) === 'string') {
        listener_triggers = listener_triggers.split(',');
    }

    for (var i = 0; i < listener_triggers.length; ++i) {
        if (listener_triggers[i] === message_trigger) {
            return true;
        }
    }

    return false;
}

function make_controller() {
    const self = {};
    const listeners = [];

    self.hears = (regex, triggers, f) => {
        listeners.push({
            regex: regex,
            triggers: triggers,
            process: f,
        });
    };

    function find_listener(opts) {
        const text = opts.text;
        const trigger = opts.trigger;

        for (var i = 0; i < listeners.length; ++i) {
            const regex = listeners[i].regex;

            const trigger_ok = trigger_matches({
                message_trigger: trigger,
                listener_triggers: listeners[i].triggers,
            });

            if (trigger_ok && text.startsWith(regex)) {
                return listeners[i];
            }
        }
    }

    function process_message(opts) {
        const message = opts.message;
        var trigger = opts.trigger;

        var text = message.content;

        if (trigger === 'mention') {
            const direct_mention_regex = /^@\*\*.*\*\* (.*)/;
            const match = direct_mention_regex.exec(text);
            if (match) {
                text = match[1];
                trigger = 'direct_mention';
            }
        }

        if (trigger === 'private_message') {
            trigger = 'direct_message';
        }

        const listener = find_listener({
            text: text,
            trigger: trigger,
        });

        if (!listener) {
            return;
        }

        message.text = text;

        bot = {
            reply: (message, response) => {
                // We ignore "message" since replies are implicit
                // with the webhook, and the server takes care of that.
                opts.send(response);
            },
        };

        listener.process(bot, message);
    }

    self.run = () => {
        run_server(process_message);
    };

    return self;
}

module.exports = {
    make_controller: make_controller,
};
