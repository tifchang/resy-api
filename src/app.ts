import pkg, { subtype, BotMessageEvent, BlockAction, AppRequestedEvent, GenericMessageEvent, MessageChangedEvent } from '@slack/bolt';
const { App, LogLevel } = pkg;
import 'dotenv/config';
import { runResy,runResySchedule } from './monitor.js';
import { resolve } from 'path';
import { isGenericMessageEvent } from './utils/helpers.js';
import { VenueToWatch } from './controllers/VenuesService.js';
import VenuesService from "./controllers/VenuesService.js";
const venuesService = new VenuesService();
const uri = process.env.MONGODB_URI || "";
import Reservations from "../models/models.js";
import mongoose from 'mongoose';

// connecting to mongo
if (! process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not in the environmental variables.");
  }
mongoose.connection.on('connected', function() {
console.log('Success: connected to MongoDb!');
});
mongoose.connection.on('error', function() {
console.log('Error connecting to MongoDb. Check MONGODB_URI in env.sh');
process.exit(1);
});
mongoose.connect(process.env.MONGODB_URI);


// initializes app
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN
  });

app.use(async ({ next }) => {
await next!();
});


// initializes db
venuesService.init();
var venue: VenueToWatch;
venue = {
    "name": "",
    "id": 0,
    "notified": false,
    "minTime": "19:00",
    "preferredTime": "20:00",
    "maxTime": "20:30",
    "shouldBook": true,
    "partySize": 2,
    "allowedDates": [],
    "uuid": ""
};

const uuids = {
    "834": "8e0594e5-9507-46d3-822b-b0d691f48b93",
    "25973": "c28d7bb3-0c24-4da7-97a3-1d6c6ff34535",
    "42534": "e8649fc3-f506-47e5-ba6a-d35b364016f2",
    "35676": "5442af91-5983-4f89-8da1-3d38dec99998",
    "5771": "171000b0-2ccc-47bd-9c34-e46afdce2221",
    "443": "91lasd1-01k2-4ad7-991k-1d6c6ff01928"
}
var cronSchedule = false;
var channelIdSender = "";

// welcome message
app.message(/(hi|hello|hey|Hi|Hello|Hey|henlo|Henlo)/, async ({ message, say }) => {
    const welcomeMsg = {
                "text": "Hi Neil! It's Chibi Chang.",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "Aloha 🌺 I'm Chibi Chang. I'm a bot built by Tiffany for Neil. I'm pretty simple, but I can help you with booking highly coveted Resy reservations. I have two modes:"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "🤞 *Hope something is open:* No guarantees, but I can check every 5 minutes to see if something opens up for your specified dates. The odds are lower for some restaurants because I will wait for someone to release an existing reservation."
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*:date: Plan ahead (⭐ higher success %):* I know when these restaurants release reservations, so I will begin checking every 1 second to book (usually 2-4 weeks out). Just set the date & I'll let you know if I could book something."
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "If you're ready, type `/reserve` to begin."
                        }
                    },
                    {
                        "type": "divider"
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": "💡*Note:* I've adapted from Neil's birthday. If you're looking for the original greeting for Neil's birthday, just ask me to _read the birthday greeting_."
                            }
                        ]
                    }
                ]
    } 
    if (!isGenericMessageEvent(message)) return;
    channelIdSender = message.user;
    channelIdSender = message.user;
    await say(welcomeMsg);
});

app.message(/(read|card)/, async ({ message, say }) => {
    if (!isGenericMessageEvent(message)) return;
    const message_1 = {
        channel: message.channel,
        text: ":love_letter: 1/2",
        blocks: [{
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":love_letter: 1/2 \n\n Dear Neil, \n\n Happy happy birthday my old man! :tada: One step closer to 30 is kinda scary - more naps and more back pain. But nevertheless, I'm so grateful that I get to be here today to celebrate with you. \n\n I don't know how I got so lucky to have you in my life. Thank you for making me the happiest girl. Every day I'm with you is unlike the last, I feel like I just scraped the surface of the many reasons to like you. Crybaby Chibi Chang might make her appearance today since she's so soft after writing all these letters :pleading_face:. \n\n You love games, so I built one for you. Chibi Chang was supposed to be my replacement during the work day, but from what I've learned about EAs, they just breakdown and give up on you the day before you need them. \n\n There are so many reasons to celebrate you today; I actually keep a list of them, and you'll see some of the reasons why. \n\n Love you long time, Neil. \n\n :heart: Tiffany"
            }
        },
        {
            "type": "image",
            "image_url": "https://i.ibb.co/f2jrGTM/Screen-Shot-2022-07-18-at-11-27-18-PM.png",
            "alt_text": "inspiration"
        },
        {
			"type": "divider"
		},
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":love_letter: 2/2 Dear Neil, \n\n I didn't have a gift attached to this one, but I still felt it was important to write. One of the things I love most about you is not only how competent, smart, sharp, and humble you are, but also how you teach me about your different interests (and you're actually good at it). From ping pong, to poker, to random facts and piano songs I botch, I love seeing your world & learning from you. \n\n I may never be better than you at most of these games, but I still love how we can play a game competitively (+ we both hate losing, admit it). There is a never a dull moment with you. Really, I'm either getting my brain wrecked by trying to learn something new or I'm getting my ass handed to me (:smirk: literally). I hope I get to teach you something just as interesting - just say the word. \n\n :heart: Tiffany"
            }
        },
        {
            "type": "image",
            "image_url": "https://i.ibb.co/Rp1nX14/Screen-Shot-2022-07-18-at-11-55-16-PM.png",
            "alt_text": "inspiration"
        }]
        }
    await say(message_1);
});

app.command('/reserve', async ({ command, ack, respond }) => {
    await ack();
    // calculate today's date
    let date1 = new Date();
    let date2 = new Date(date1);
    let date7 = new Date(date1);
    let date14 = new Date(date1);
    let date21 = new Date(date1);
    let date30 = new Date(date1);
    date2.setDate(date2.getDate() + 1);
    date7.setDate(date2.getDate() + 8);
    date14.setDate(date14.getDate() + 15);
    date21.setDate(date21.getDate() + 22);
    date30.setDate(date30.getDate() + 30);
    const offset = date1.getTimezoneOffset();
    date1 = new Date(date1.getTime() - (offset*60*1000));
    date2 = new Date(date2.getTime() - (offset*60*1000));
    date7 = new Date(date7.getTime() - (offset*60*1000));
    date14 = new Date(date14.getTime() - (offset*60*1000));
    date21 = new Date(date21.getTime() - (offset*60*1000));
    date30 = new Date(date30.getTime() - (offset*60*1000));
    const date1_string = date1.toISOString().split('T')[0];
    const date2_string = date2.toISOString().split('T')[0];
    const date7_string = date2.toISOString().split('T')[0];
    const date14_string = date14.toISOString().split('T')[0];
    const date21_string = date21.toISOString().split('T')[0];
    const date30_string = date30.toISOString().split('T')[0];
    const resyForm = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Bonjour Nilly! :woman-gesturing-ok: \n\n I can help you make a request for any of the following restaurants. Tiffany started a list for me to work with. If you don't see one you'd like to reserve, please let her know."
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*:cut_of_meat: 4 Charles Prime Rib*\n\n Reservations release for 30 days ahead at 9am EST. The earliest reservation I can get you is: ${date30_string}.`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*:spaghetti: L'Artusi*\n\n Reservations release 14 days in advance at 9am EST. The earliest reservation I can get you is: ${date14_string}.`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*🤌 I Sodi*\n\n Reservations release 14 days in advance at 12am EST. The earliest reservation I can get you is: ${date14_string}.`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*:chicken: Double Chicken Please*\n\n Reservations release 7 days in advance at 12am EST. The earliest reservation I can get you is: ${date7_string}.`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*:it: Rezdôra*\n\n Reservations release 21 days in advance at 12am EST. The earliest reservation I can get you is: ${date21_string}.`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `*:kr: Cote*\n\n Reservations release 30 days in advance at 12am EST. The earliest reservation I can get you is: ${date30_string}.`
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "block_id": "type_1",
                "text": {
                    "type": "mrkdwn",
                    "text": "*⏰ Do you want to schedule this?*"
                },
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "🗓️ Yes, help me get it when it drops!",
                                "emoji": true
                            },
                            "value": "true"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "🤞 No, I just hope something is open.",
                                "emoji": true
                            },
                            "value": "false"
                        }
                    ],
                    "action_id": "schedule_cron"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "block_id": "restaurants_1",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:bento: Select a restaurant to book*"
                },
                "accessory": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select an item",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "4 Charles Prime Rib",
                                "emoji": true
                            },
                            "value": "834"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "L'Artusi",
                                "emoji": true
                            },
                            "value": "25973"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "I Sodi",
                                "emoji": true
                            },
                            "value": "443"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Double Chicken Please",
                                "emoji": true
                            },
                            "value": "42534"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Rezdôra",
                                "emoji": true
                            },
                            "value": "5771"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Cote",
                                "emoji": true
                            },
                            "value": "35676"
                        }
                    ],
                    "action_id": "select_restaurant"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "block_id": "party_1",
                "text": {
                    "type": "mrkdwn",
                    "text": ":dancers: *Select a party size*"
                },
                "accessory": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select an item",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "2",
                                "emoji": true
                            },
                            "value": "2"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "3",
                                "emoji": true
                            },
                            "value": "3"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "4",
                                "emoji": true
                            },
                            "value": "4"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "5",
                                "emoji": true
                            },
                            "value": "5"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "6",
                                "emoji": true
                            },
                            "value": "6"
                        }
                    ],
                    "action_id": "select_party"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:date: Please select a date for your reservation.* If you'd like to set a backup date, please add a second date."
                }
            },
            {
                "type": "actions",
                "block_id": "datepickers_1",
                "elements": [
                    {
                        "type": "datepicker",
                        "initial_date": date1_string,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "date_1"
                    },
                    {
                        "type": "datepicker",
                        "initial_date": date2_string,
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "date_2"
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:clock4: Please select an ideal time for the reservation as well as a range.* I will look for a reservation at the ideal time. However, if I'm unable to find one, I will look within the range."
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": "Ideal Time",
                        "emoji": true
                    }
                ]
            },
            {
                "type": "actions",
                "block_id": "timepicker_ideal",
                "elements": [
                    {
                        "type": "timepicker",
                        "initial_time": "20:00",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "action_id": "time_ideal"
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": "Earliest / Latest",
                        "emoji": true
                    }
                ]
            },
            {
                "type": "actions",
                "block_id": "timepicker_minmax",
                "elements": [
                    {
                        "type": "timepicker",
                        "initial_time": "19:00",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "action_id": "time_min"
                    },
                    {
                        "type": "timepicker",
                        "initial_time": "22:00",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "action_id": "time_max"
                    }
                ]
            },
            {
                "type": "actions",
                "block_id": "submit_1",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": ":white_check_mark: Done",
                            "emoji": true
                        },
                        "value": "click_me_123",
                        "action_id": "submit_button"
                    }
                ]
            }
        ]
    }
    await respond (resyForm);
});

// birthday greeting
app.message(/(birthday|greeting)/, async ({ message, say }) => {
    const welcomeMsg = {
            "text": "Hi Neil!",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Hello Neil :woman-gesturing-ok: \n\n I'm Chibi Chang, your virtual assistant. I was made by Tiffany, so I'm pretty simple (she only knows how to write shitty code, but she'll write code for her favorite people)."
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "I heard it's your birthday tomorrow! :tada: She built me to guide you through your birthday (yes, it's a whole day). \n\n Oh this picture? it's her favorite baby Neil pic :heart_eyes:"
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://i.ibb.co/nMSMJZP/315359-581190598568148-1914769603-n.jpg",
                        "alt_text": "cute cat"
                    }
                },
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "So how does this work?",
                        "emoji": true
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Tiffany hid a bunch of gifts in me. There are :four: total. I will tell you what the gift is when you guess one of the three keywords. If you don't guess anything that relates to a gift, I will remain silent."
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*A few notes:* \n\n :love_letter: In addition to the gifts, she's written a card that will get released at set times throughout the day. If you want to see them on demand, just tell me to _Read the card_ \n :woman-raising-hand: If you get stuck, you can text Tiffany for a clue (she can't see your chat with me). \n :camera_with_flash: Once you discover a gift, text a screenshot to Tiffany. "
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Ready to begin?* Click the button below to begin."
                    }
                },
                {
                    "type": "actions",
                    "block_id": 'example_1',
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": ":woman-cartwheeling: Let's do a practice round",
                                "emoji": true
                            },
                            "value": "click_me_123",
                            "action_id": "example_button"
                        }
                    ]
                }
            ]
    } 
    if (!isGenericMessageEvent(message)) return;
    await say(welcomeMsg);
});

// select restaurant
app.action<BlockAction>({ action_id: 'select_restaurant', block_id: 'restaurants_1'}, async ({ body, ack }) => {
    await ack();
    const key = body.state?.values.restaurants_1.select_restaurant.selected_option?.value || "0";
    venue.id = parseInt(key);
    venue.name = body.state?.values.restaurants_1.select_restaurant.selected_option?.text.text || venue.name;
    venue.uuid = uuids[key];
    console.log("VENUE ID: " + venue.id);
    console.log("VENUE NAME: " + venue.name);
    console.log("VENUE UUID: " + venue.uuid);
});

// select party size
app.action<BlockAction>({ action_id: 'select_party', block_id: 'party_1'}, async ({ body, ack }) => {
    await ack();
    venue.partySize = parseInt(body.state?.values.party_1.select_party.selected_option?.value || "2");
    console.log("PARTYSIZE: " + venue.partySize);
    console.log("VENUE: " + JSON.stringify(venue));
});

// schedule cron?
app.action<BlockAction>({ action_id: 'schedule_cron', block_id: 'type_1'}, async ({ body, ack }) => {
    await ack();
    cronSchedule = (body.state?.values.type_1.schedule_cron.selected_option?.value === "true");
    console.log("CRON STATUS: ", cronSchedule);
});

// select ideal date
app.action<BlockAction>({ action_id: 'date_1', block_id: 'datepickers_1'}, async ({ body, ack }) => {
    await ack();
    venue.allowedDates.push(body.state?.values.datepickers_1.date_1.selected_date || "");
    console.log("ALLOWED DATES: " + venue.allowedDates);
    console.log("VENUE: " + JSON.stringify(venue));
});

// select backup date
app.action<BlockAction>({ action_id: 'date_2', block_id: 'datepickers_1'}, async ({ body, ack }) => {
    await ack();
    venue.allowedDates.push(body.state?.values.datepickers_1.date_2.selected_date || "");
    console.log("ALLOWED DATES: " + venue.allowedDates);
    console.log("VENUE: " + JSON.stringify(venue));
});

// select ideal time
app.action<BlockAction>({ action_id: 'time_ideal', block_id: 'timepicker_ideal'}, async ({ body, ack }) => {
    await ack();
    venue.preferredTime = body.state?.values.timepicker_ideal.time_ideal.selected_time || venue.preferredTime;
    console.log("PREFTIME " + venue.preferredTime);
    console.log("VENUE: " + JSON.stringify(venue));
});

// select min time
app.action<BlockAction>({ action_id: 'time_min', block_id: 'timepicker_minmax'}, async ({ body, ack }) => {
    await ack();
    venue.minTime = body.state?.values.timepicker_minmax.time_min.selected_time || venue.minTime;
    console.log("MINTIME " + venue.minTime);
    console.log("VENUE: " + JSON.stringify(venue));
});

// select max time
app.action<BlockAction>({ action_id: 'time_max', block_id: 'timepicker_minmax'}, async ({ body, ack }) => {
    await ack();
    venue.maxTime = body.state?.values.timepicker_minmax.time_max.selected_time || venue.maxTime;
    console.log("MAXTIME " + venue.maxTime);
    console.log("VENUE: " + JSON.stringify(venue));
});

app.action({ action_id: 'submit_button', block_id: 'submit_1'}, async ({ ack, respond }) => {
    await ack();
    console.log("Updating venue:", venue);
    await venuesService.updateVenue(venue);
    if (cronSchedule) {
        console.log("scheduling ahead", venue.allowedDates);
        await runResySchedule(channelIdSender, venue.allowedDates, venue);
    } else {
        await runResy(channelIdSender);
    }
    await respond({
        "text": "Thanks for your request, I'll process it and get back to you if I find something."
    });
});

app.action({ action_id: 'example_button', block_id: 'example_1'}, async ({ ack, respond }) => {
    await ack();
    await respond({
        "text": "Tiffany already told you that she was taking you out tomorrow night. Maybe try ask me _What's for dinner?_ or _Where are we going tomorrow night?_ Since she's giving you a practice round, I'll only tell you half the truth. You'll get the rest there :wink:"
    });
});

app.message(/(dinner|tonight)/, async ({ message, say, client }) => {
    const dons = {
        "text": "Title",
        "blocks": [
            {
                "type": "section",
                "block_id": "dons",
                "text": {
                    "type": "mrkdwn",
                    "text": ":kr: :cut_of_meat: *You're going to Don's Bogam!* \n\n Tonight at *8:00pm*, Tiffany will see you at the door of Don's Bogam. She remembers you told her once that this was one of the best places in NYC. So obviously, we have to go tonight! \n _17 E 32nd St, New York, NY 10016_"
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://i.ibb.co/TkgvhR2/Screen-Shot-2022-07-18-at-9-22-41-PM.png",
                    "alt_text": "cute cat"
                }
            }
        ]
    }
    await say(dons);
});

app.message(/(naruto|akatsuki|cloak)/, async ({ message, say, client }) => {
    const naruto = {
        "text": "Title",
        "blocks": [
            {
                "type": "section",
                "block_id": "dons",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:coat: One more piece to your Akatsuki collection* \n\n Ask Tiffany for a package. Open it and try it on. \n\n *Why did she get you this? Read this note :love_letter:* \n\n Neil, one of the things I love most about you is how silly & carefree you are. You're diligent when you're working towards a goal, mature if there's an important matter, empathetic if I'm upset, yet still so happy & silly during all the moments inbetween. You make me laugh, a lot, yes, even sugar cube does it for me. You remind me that life has many kinds of moments, and that most importantly you enjoy it. Your absurd love for anime (and my dragonball keychain) reminds me about this part of you."
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://i.ibb.co/Gc6JNJ9/Screen-Shot-2022-07-18-at-9-32-53-PM.png",
                    "alt_text": "akatsuki"
                }
            }
        ]
    }
    await say(naruto);
});

app.message(/(cool girl|cool|girl)/, async ({ message, say, client }) => {
    const cool = {
        "text": "Title",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:bikini: New outfit?* She might already have it on, but cool girl can only reveal her gift IRL, she'll see you in bed tonight :smirk: \n\n *Read this note :love_letter:* \n\n I kept a Trello board with notes and thoughts from each of our early dates. Here are some you'd appreciate: \n\n :heart: when we got back to my place, mans couldn't wait and basically we made out in the lobby but my ass was on the heater and I swear I have burn marks on my butt. It was kinda hot. \n :heart: this could be stockholm but he's also actively interviewing at Citadel which idk it just gets me going \n :heart: hell yeah his body and 🍆 are 👌🏼 would feast \n :heart: had probably one of the best first dates, went to a whiskey tasting and got cocktails in Tribeca then went back to his place played ping pong and fooked. He was honestly a good blend of everything: smart, driven, relaxed, funny (very), has depth, social, and also very sweet. He kicked my ass in ping pong using his non dominant hand wtf but also dtf."
                }
            }
        ]
    }
    await say(cool);
});

app.message(/(resy|bot|reservations|dates|Resy)/, async ({ message, say, client }) => {
    const resyReveal = {
        "text": "Title",
        "blocks": [
            {
                "type": "section",
                "block_id": "dons",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:date: Did you know I have other abilities?* \n\n That's right, Tiffany gave me some sick abilities. You mentioned once that you'd like a very specific kind of bot...why don't you give me a try? Type `/reserve` into the chat. Maybe take her on a date? \n\n *Why did she get you this? Read this note :love_letter:* \n\n Neil, all our dates are ridiculous. Every time I tell someone we went _here_ or _there_, everyone is shook someone would even take me there. I thought it was some lead conversion strategy, but I realized it was just that you only treat me to the best - and it makes me feel so loved. It took me some time and a lot of anxious thoughts to overcome the reality of your limited bandwidth, but I realized even still you try to make time for me and treat me so well. Even beyond dates, what I've loved the most is how you never take out your phone when we're together, how you suggest things to do (and even plan wow), and how you prioritize me and my enjoyment. \n\n I wanted to build something you kind of already wanted, asked for, but couldn't do at the time. I hope this makes planning easier.  \n\n Behold, your own Resy bot, Chibi Chang.  I've preloaded it with places you love, one of our favorite spots, and L'Artusi so maybe you can get a reservation this time :kissing_heart:. Love you so much, Neil."
                }
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "plain_text",
                        "text": "I also learned a new programming language to do this, so there may be bugs here and there (just let me know and I can fix it).",
                        "emoji": true
                    }
                ]
            }
        ]
    }
    await say (resyReveal);
});

app.message(/(concert|symphony|joe hisaishi|miyazaki|studio|music)/, async ({ message, say, client }) => {
    const ghibli = {
        "text": "Title",
        "blocks": [
            {
                "type": "section",
                "block_id": "dons",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:musical_score: :japanese_castle: I heard you like anime music...* \n\n Joe Hisaishi is the original composer for Miyazaki's films at Studio Ghibli (yes, including One Summers Day). Hisaishi rarely goes on tour, but luckily this year, he is coming to NYC at Radio City Hall on August 18th at 8PM. You and Tiffany are going to see him conduct a full symphony live with front section tickets. Get ready for this electrifying experience! :zap: \n\n *Why did she get you this? Read this note :love_letter:* \n\n Classical music + anime + classic films + live = probably one of the most ideal experiences for Neil. I'm still shook by your piano abilities and (sort of random) interest in classical music. Beyond this as your interest, it reminds me of how interesting you are & how when you are interested in something and put your mind to it, you can do some crazy stuff like learn how to play piano in less than a year. Thank you for taking me to the Chopin concert and all those jazz concerts – live music reminds me of you so I hope you enjoy this once-in-a-lifetime experience that brings together your interests!"
                }
            }
        ]
    }
    await say (ghibli);
});

const postMessage = async(str: string, rest: string) => {
    await app.client.chat.postMessage({
        text: `:star-struck: I found a reservation! You're successfully booked at ${rest}! Please login to your Resy to see details on the reservation.`,
        channel: str
      });
}

export default postMessage;

(async () => {
// Start your app
await app.start(process.env.PORT || 6000);
console.log('⚡️ Slack app is running!');
})();