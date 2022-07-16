// import { App, LogLevel } from '@slack/bolt';
import pkg from '@slack/bolt';
const { App, LogLevel } = pkg;
import 'dotenv/config';
import runResy from './monitor.js';
import { resolve } from 'path';
import { isGenericMessageEvent } from './utils/helpers';
import { Say } from 'twilio/lib/twiml/VoiceResponse.js';

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

  app.message(/^(hi|hello|hey).*/, async ({ message, say, client }) => {
    await say("Hello there, Neil! :woman-gesturing-ok:");

    // Initialize all scheduled messages
    // modify this to be midnight 7/21
    const time = new Date(2022, 6, 16, 17, 4).getTime()/1000;
    try {
        const result = await client.chat.scheduleMessage({
            channel: message.channel,
            text: "Summer has come and passed",
            post_at: time
          });

    }
    catch (e) {
        console.log(e);
    }
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
                                "text": ":cut_of_meat: 4 Charles Prime Rib",
                                "emoji": true
                            },
                            "value": "value-0"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": ":spaghetti: L'Artusi",
                                "emoji": true
                            },
                            "value": "value-1"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": ":chicken: Double Chicken Please",
                                "emoji": true
                            },
                            "value": "value-2"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": ":kr: Cote",
                                "emoji": true
                            },
                            "value": "value-2"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": ":it: Rezdôra",
                                "emoji": true
                            },
                            "value": "value-2"
                        }
                    ],
                    "action_id": "static_select-action"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
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
                            "value": "value-0"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "3",
                                "emoji": true
                            },
                            "value": "value-1"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "4",
                                "emoji": true
                            },
                            "value": "value-2"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "5",
                                "emoji": true
                            },
                            "value": "value-2"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "6",
                                "emoji": true
                            },
                            "value": "value-2"
                        }
                    ],
                    "action_id": "static_select-action"
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
                "elements": [
                    {
                        "type": "datepicker",
                        "initial_date": "2022-07-21",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "datepicker-action"
                    },
                    {
                        "type": "datepicker",
                        "initial_date": "2022-07-21",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        },
                        "action_id": "datepicker-action2"
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
                "elements": [
                    {
                        "type": "timepicker",
                        "initial_time": "20:00",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "action_id": "timepicker-action2"
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
                "elements": [
                    {
                        "type": "timepicker",
                        "initial_time": "19:00",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "action_id": "timepicker-action2"
                    },
                    {
                        "type": "timepicker",
                        "initial_time": "22:00",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "action_id": "timepicker-action3"
                    }
                ]
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": ":white_check_mark: Submit",
                            "emoji": true
                        },
                        "value": "click_me_123",
                        "action_id": "actionId-0"
                    }
                ]
            }
        ]
    }
    await respond (welcomeResponse);

  });

  (async () => {
    // Start your app
    await app.start(Number(process.env.PORT) || 6000);
    console.log('⚡️ Slack app is running!');
  })();