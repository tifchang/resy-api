// import { App, LogLevel } from '@slack/bolt';
import pkg from '@slack/bolt';
import { subtype, BotMessageEvent, BlockAction } from '@slack/bolt';
const { App, LogLevel } = pkg;
import 'dotenv/config';
import runResy from './monitor.js';
import { resolve } from 'path';
import { isGenericMessageEvent } from './utils/helpers';
import { VenueToWatch } from './controllers/VenuesService.js';
import VenuesService from "./controllers/VenuesService.js";
const venuesService = new VenuesService();

// initializes app
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // logLevel: LogLevel.DEBUG,
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
    "notified": true,
    "minTime": "18:00",
    "preferredTime": "19:00",
    "maxTime": "20:00",
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
    "5771": "619fe279-097a-4ebf-a558-f71dec5cf8e6"
}

// welcome message
app.message(/^(hi|hello|hey).*/, async ({ message, say, client }) => {
await say("Hello there, Neil! :woman-gesturing-ok:");

// venuesService.updateVenue(venuePayload);
// const resp = await runResy();


// Initialize all scheduled messages
// modify this to be midnight 7/21
// const time = new Date(2022, 6, 16, 17, 4).getTime()/1000;
// try {
//     const result = await client.chat.scheduleMessage({
//         channel: message.channel,
//         text: "Summer has come and passed",
//         post_at: time
//         });

// }
// catch (e) {
//     console.log(e);
// }
});


app.command('/reserve', async ({ command, ack, respond }) => {
// Acknowledge command request
    await ack();
    const welcomeResponse = {
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Hello Neil :woman-gesturing-ok: \n\n I can help you make a request for any of the following restaurants. Some of these restaurants are hard to reserve, so I will keep trying until I am able to find one or until the dates have passed. \n Tiffany started a list for me to work with. If you don't see one you'd like to reserve, please let her know."
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:cut_of_meat: 4 Charles Prime Rib*\n $$$ •  4 Charles St, New York, NY 10014\n Steakhouse by Brendan Sodikoff (Chicago's Au Cheval) with contemporary offerings & vintage appeal."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:spaghetti: L'Artusi*\n $$$ •  228 W 10th St, New York, NY 10014\n Italian small plates are matched by an extensive wine list at this bi-level restaurant."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:chicken: Double Chicken Please*\n $$ •  115 Allen St, New York, NY 10002\n Trendy, snug cocktail bar serving finger foods, chicken sandwiches & creative drinks."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:kr: Cote*\n $$$ •  16 W 22nd St, New York, NY 10010\n Upscale Korean steakhouse featuring tables with smokeless grills, plus an extensive wine list."
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:it: Rezdôra*\n $$$ •  27 E 20th St, New York, NY 10003\n Italian eatery highlighting handmade pasta, traditional meat & fish dishes plus local vegetables."
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
                                "text": "Double Chicken Please",
                                "emoji": true
                            },
                            "value": "42534"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Cote",
                                "emoji": true
                            },
                            "value": "35676"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Rezdôra",
                                "emoji": true
                            },
                            "value": "5771"
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
                        "initial_date": "2022-07-21",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "date_1"
                    },
                    {
                        "type": "datepicker",
                        "initial_date": "2022-07-21",
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
    await respond (welcomeResponse);
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
});

// select ideal date
app.action<BlockAction>({ action_id: 'date_1', block_id: 'datepickers_1'}, async ({ body, ack }) => {
    await ack();
    venue.allowedDates.push(body.state?.values.datepickers_1.date_1.selected_date || "");
    console.log("ALLOWED DATES: " + venue.allowedDates);
});

// select backup date
app.action<BlockAction>({ action_id: 'date_2', block_id: 'datepickers_1'}, async ({ body, ack }) => {
    await ack();
    venue.allowedDates.push(body.state?.values.datepickers_1.date_2.selected_date || "");
    console.log("ALLOWED DATES: " + venue.allowedDates);
});

// select ideal time
app.action<BlockAction>({ action_id: 'time_ideal', block_id: 'timepicker_ideal'}, async ({ body, ack }) => {
    await ack();
    venue.preferredTime = body.state?.values.timepicker_ideal.time_ideal.selected_time || venue.preferredTime;
    console.log("PREFTIME " + venue.preferredTime);
});

// select min time
app.action<BlockAction>({ action_id: 'time_min', block_id: 'timepicker_minmax'}, async ({ body, ack }) => {
    await ack();
    venue.minTime = body.state?.values.timepicker_minmax.time_min.selected_time || venue.minTime;
    console.log("MINTIME " + venue.minTime);
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
    venuesService.updateVenue(venue);
    console.log("checking now for reservatios");
    runResy();
    await respond({
        "text": "Thanks for your request, I'll process it and get back to you if I find something."
    });
});


(async () => {
// Start your app
await app.start(Number(process.env.PORT) || 6000);
console.log('⚡️ Slack app is running!');
})();