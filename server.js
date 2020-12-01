let tmi = require("tmi.js");
let env = require("./client.json");

let path = require("path");
let express = require("express");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

let sqlite3 = require('sqlite3').verbose();
let commands = require("./commands.json");

app.use('/public', express.static(path.join(__dirname, 'obs')))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/obs/index.html');
});
let obs;
io.on("connection", (socket) => {
    obs = socket;
    console.log("a user connected");
});

// Config for TMI
const opts = {
    identity: {
        username: env.bot_name,
        password: env.oauth_token
    },
        channels: [
            env.channel
    ]
};

const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.connect();

let db = new sqlite3.Database('./slap.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the Slap database.');
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot

    let message = msg.trim();
    let messageSplit = message.split(" ");
    let command = messageSplit[0];
    if(command[0] !== "!"){
        return;
    }
    let commandProperties = commands[command.substring(1)];
    let currentTimestamp = Date.now();
    let lastUseWithOffset = commandProperties.lastUse + (commandProperties.cooldown * 1000)
    if(currentTimestamp < lastUseWithOffset){
        console.log("command "+command+" is on cooldown");
        return;
    }else{
        commandProperties.lastUse = currentTimestamp;
    }
    switch(command){
        
        case "!pat" : patCommand(target, context, messageSplit[1]); break;
        case "!slap" : slapCommand(target, context, messageSplit[1]); break;
        case "!wide" : wideCommand(target, context); break;
        case "!dice" : diceCommand(target, context); break;

        default: console.log("* Unknown command: " + message);
    }

    // test
    // console.log(target+"; "+msg);
    // console.log(context);
    // console.log(self);
}

// find out how to use bot commands (USERSTATE) https://dev.twitch.tv/docs/irc/commands
// maybe improve animations
function patCommand(target, context, patted){
    let user = context["display-name"];
    if(patted === undefined){
        client.say(target, user + " is a weirdo and pats no one PepeLaugh");
    }else if(isNameTheSame(user, patted)){
        client.say(target, user + " is a weirdo and pats himself PepeLaugh");
    }else if(patted.length > 30){
        client.say(target, "come on, cant you pat someone with a shorter name AYAYAWeird");
    }else{
        let first = { name : user , color : context.color};
        let second = { name : patted, color : "#000"};
        io.emit("pat", { user : first, patted : second });
    }
    console.log("* Executed pat command");
}

function slapCommand(target, context, slapped){
    // TODO database
    let user = context["display-name"];
    if(slapped === undefined){
        client.say(target, user + " is a weirdo and slaps no one PepeLaugh");
    }else if(isNameTheSame(user, slapped)){
        client.say(target, user + " is a weirdo and slaps himself PepeLaugh");
    }else if(slapped.length > 30){
        client.say(target, "come on, cant you slap someone with a shorter name AYAYAWeird");
    }else{
        let roll = getRandomInt(1, 20);
        let exp = calculateExperience();
        let outcome = { value : roll > 3, exp : exp};
        let first = { name : user , color : context.color};
        let second = { name : slapped, color : "#000"};
        let twitchId = context["user-id"];
        let userId = 0;
        // need exp value here
        if(isUserCreated(twitchId)){
            userId = getUser(twitchId);
        }else{
            userId = createUser(twitchId);
        }
        createSlap(userId, slapped, outcome);
        io.emit("slap", { user : first, slapped : second, outcome : outcome });
    }
    console.log("* Executed slap command");

}

function wideCommand(target, context){
    let user = { name : context["display-name"] , color : context.color};
    io.emit("wide", { user : user});
    client.say(target, "widepeepoHappy we wide widepeepoHappy we happy");
    console.log("* Executed wide command");
}

function isNameTheSame(first, second){
    // console.log("second : " + second);
    let cleanSecond = second;
    if(second[0] === "@"){
        cleanSecond = second.substring(1);
    }
    return first.toLowerCase() === cleanSecond.toLowerCase();
}

function diceCommand(target, context){
    let num = getRandomInt(1, 6);
    client.say(target, context["display-name"] + " rolled a " + num);
    console.log("* Executed dice command");
}

function calculateExperience(){
    return getRandomInt(1, 1000);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// DB functions
function isUserCreated(twitchId){
    let sql = 
    "SELECT *"+
    "FROM USER"+
    "WHERE twitch_id = ?";
    db.get(sql, [twitchId], (err, row) => {
        if (err) {
            throw err;
        }
        return row !== undefined;
    });
}

function createUser(twitchId){
    let sql = 
    "INSERT INTO User(twitch_id)"+
    "VALUES (?)";

    db.run(sql, [twitchId], (err) =>{
        if (err) {
            throw err;
        }
        return this.lastId;
    });

}

function getUser(twitchId){
    let sql = 
    "SELECT id"+
    "FROM USER"+
    "WHERE twitch_id = ?";
    db.get(sql, [twitchId], (err, row) => {
        if (err) {
            throw err;
        }
        return row.id;
    });
}

function createSlap(userId, victim, outcome){
    let sql = 
    "INSERT INTO Slap(user_id, victim, exp, outcome)"+
    "VALUES (?,?,?,?)";
    let didHit = outcome.value ? 1 : 0;
    db.run(sql, [userId, victim, outcome.exp, didHit], (err) =>{
        if (err) {
            throw err;
        }
    });

    // update exp for user
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log("* Connected to " + addr + ":" + port);
}

// #thatcharaktar; do something
// { 'badge-info': { subscriber: '3' },
//   badges: { broadcaster: '1', subscriber: '0', glitchcon2020: '1' },
//   'client-nonce': '89d1de46fff5948e0ef39917b248441c',
//   color: '#2E8B57',
//   'display-name': 'ThatCharaktar',
//   emotes: null,
//   flags: null,
//   id: '9600837f-9b8c-4583-8c59-840badba8128',
//   mod: false,
//   'room-id': '132765582',
//   subscriber: true,
//   'tmi-sent-ts': '1605624125214',
//   turbo: false,
//   'user-id': '132765582',
//   'user-type': null,
//   'emotes-raw': null,
//   'badge-info-raw': 'subscriber/3',
//   'badges-raw': 'broadcaster/1,subscriber/0,glitchcon2020/1',
//   username: 'thatcharaktar',
//   'message-type': 'chat' }
// false

// 'custom-reward-id'
// pat = a004ad5f-8305-4be9-9668-d84b009b33ec