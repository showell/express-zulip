This is like a **starter kit** for running
a JS-based bot server that listens to a Zulip
chat server.  Typically you will just fork
this and create your own app.js.

To try it out, do something like `npm install`
to get the necessary packages, and then run it
like this:

    node app.js

On the Zulip side:

* Go into Settings/Your bots
* Add a bot of type "Outgoing webhook"
* Use whatever name/avatar you want for the bot.
* For the URL, it will be something
  similar to `http://example.org:3000
* Mention the bot like `@**my bot** hello`

## Tokens ##

If you set the env var `ZULIP_BOT_TOKEN`
before launching `node app.js`, then your
server will only serve requests to clients
that provide a token that matches that env
var.  The "client" should be the Zulip
server.  Here is a quick way to lock it
down:

* Run `ZULIP_BOT_TOKEN=bogus node app.js` and watch the console
* Send a mention to your bot on the Zulip server
* Look back at the node console.  You will be blocked but
  you get to see the valid token.
* Re-launch using something like `ZULIP_BOT_TOKEN=actualtokendata node app.js`
