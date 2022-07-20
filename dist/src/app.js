import pkg from '@slack/bolt';
const { App, LogLevel } = pkg;
import 'dotenv/config';
import runResy from './monitor.js';
import { isGenericMessageEvent } from './utils/helpers.js';
import VenuesService from "./controllers/VenuesService.js";
const venuesService = new VenuesService();
const uri = process.env.MONGODB_URI || "";
// initializes app
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    // logLevel: LogLevel.DEBUG,
    socketMode: true,
    appToken: process.env.APP_TOKEN
});
app.use(async ({ next }) => {
    await next();
});
// initializes db
venuesService.init();
var venue;
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
};
const channelIds = {
    "tiff": "U03P3TRJ83B",
    "neil": ""
};
// welcome message
app.message(/(hi|hello|hey)/, async ({ message, say }) => {
    const welcomeMsg = {
        "text": "Title",
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
                    "text": "*A few notes:* \n\n :love_letter: In addition to the gifts, she's written a card as a series of vignettes that will get released at set times throughout the day. \n:bell: Keep your notifications on so you don't miss them! \n :woman-raising-hand: If you get stuck, you can text Tiffany for a clue (she can't see your chat with me). \n :camera_with_flash: Once you discover a gift, text a screenshot to Tiffany. "
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
    };
    if (!isGenericMessageEvent(message))
        return;
    if (message.user != "U03P3TRJ83B") {
        channelIds.neil = message.user;
    }
    // Initialize all scheduled messages
    // modify this to be midnight 7/21
    const time_1 = 1660810714;
    const time_2 = 1660810714;
    // message 1
    try {
        const result = await app.client.chat.scheduleMessage({
            channel: message.channel,
            text: ":love_letter: 1/2",
            blocks: [{
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": ":love_letter: 1/3 \n\n Dear Neil, \n\n Happy happy birthday my old man! :tada: One step closer to 30 is kinda scary - more naps and more back pain. But nevertheless, I'm so grateful that I get to be here today to celebrate with you. \n\n I don't know how I got so lucky to have you in my life. Thank you for making me the happiest girl. Every day I'm with you is unlike the last, I feel like I just scraped the surface of the many reasons to like you. Crybaby Chibi Chang might make her appearance today since she's so soft after writing all these letters :pleading_face:. \n\n You love games, so I built one for you. I hope you enjoy Chibi Chang, my replacement during the work day. \n\n There are so many reasons to celebrate you today; I actually keep a list of them, and you'll see some of the reasons why. \n\n Love you long time, Neil. \n\n :heart: Tiffany"
                    }
                },
                {
                    "type": "image",
                    "image_url": "https://i.ibb.co/f2jrGTM/Screen-Shot-2022-07-18-at-11-27-18-PM.png",
                    "alt_text": "inspiration"
                }],
            post_at: time_1
        });
    }
    catch (e) {
        console.log(e);
    }
    // message 2
    try {
        const result = await app.client.chat.scheduleMessage({
            channel: message.channel,
            text: ":love_letter: 2/2",
            blocks: [{
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": ":love_letter: 2/3 Dear Neil, \n\n One of the things I love most about you is not only how competent, smart, sharp, and humble you are, but also how you teach me about your different interests (and you're actually good at it). From ping pong, to poker, to random facts and piano songs I botch, I love seeing your world & learning from you. \n\n I may never be better than you at most of these games, but I still love how we can play a game competitively (+ we both hate losing, admit it). There is a never a dull moment with you. Really, I'm either getting my brain wrecked by trying to learn something new or I'm getting my ass handed to me (:smirk: literally). \n\n :heart: Tiffany"
                    }
                },
                {
                    "type": "image",
                    "image_url": "https://i.ibb.co/Rp1nX14/Screen-Shot-2022-07-18-at-11-55-16-PM.png",
                    "alt_text": "inspiration"
                }],
            post_at: time_2
        });
    }
    catch (e) {
        console.log(e);
    }
    await say(welcomeMsg);
});
app.command('/reserve', async ({ command, ack, respond }) => {
    // Acknowledge command request
    await ack();
    const resyForm = {
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
    };
    await respond(resyForm);
});
// select restaurant
app.action({ action_id: 'select_restaurant', block_id: 'restaurants_1' }, async ({ body, ack }) => {
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
app.action({ action_id: 'select_party', block_id: 'party_1' }, async ({ body, ack }) => {
    await ack();
    venue.partySize = parseInt(body.state?.values.party_1.select_party.selected_option?.value || "2");
    console.log("PARTYSIZE: " + venue.partySize);
});
// select ideal date
app.action({ action_id: 'date_1', block_id: 'datepickers_1' }, async ({ body, ack }) => {
    await ack();
    venue.allowedDates.push(body.state?.values.datepickers_1.date_1.selected_date || "");
    console.log("ALLOWED DATES: " + venue.allowedDates);
});
// select backup date
app.action({ action_id: 'date_2', block_id: 'datepickers_1' }, async ({ body, ack }) => {
    await ack();
    venue.allowedDates.push(body.state?.values.datepickers_1.date_2.selected_date || "");
    console.log("ALLOWED DATES: " + venue.allowedDates);
});
// select ideal time
app.action({ action_id: 'time_ideal', block_id: 'timepicker_ideal' }, async ({ body, ack }) => {
    await ack();
    venue.preferredTime = body.state?.values.timepicker_ideal.time_ideal.selected_time || venue.preferredTime;
    console.log("PREFTIME " + venue.preferredTime);
});
// select min time
app.action({ action_id: 'time_min', block_id: 'timepicker_minmax' }, async ({ body, ack }) => {
    await ack();
    venue.minTime = body.state?.values.timepicker_minmax.time_min.selected_time || venue.minTime;
    console.log("MINTIME " + venue.minTime);
});
// select max time
app.action({ action_id: 'time_max', block_id: 'timepicker_minmax' }, async ({ body, ack }) => {
    await ack();
    venue.maxTime = body.state?.values.timepicker_minmax.time_max.selected_time || venue.maxTime;
    console.log("MAXTIME " + venue.maxTime);
    console.log("VENUE: " + JSON.stringify(venue));
});
app.action({ action_id: 'submit_button', block_id: 'submit_1' }, async ({ ack, respond }) => {
    await ack();
    venuesService.updateVenue(venue);
    runResy(channelIds.tiff);
    await respond({
        "text": "Thanks for your request, I'll process it and get back to you if I find something."
    });
});
app.action({ action_id: 'example_button', block_id: 'example_1' }, async ({ ack, respond }) => {
    await ack();
    await respond({
        "text": "Tiffany already told you that she was taking you out tonight. Maybe try ask me _What's for dinner?_ or _Where are we going tonight?_ Since she's giving you a practice round, I'll only tell you half the truth. You'll get the rest there :wink:"
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
    };
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
                    "text": "*:coat: One more piece to your Akatsuki collection* \n\n Check underneath your bed for a package. Open it and try it on. \n\n *Why did she get you this? Read this note :love_letter:* \n\n Neil, one of the things I love most about you is how silly & carefree you are. You're diligent when you're working towards a goal, mature if there's an important matter, empathetic if I'm upset, yet still so happy & silly during all the moments inbetween. You make me laugh, a lot, yes, even sugar cube does it for me. You remind me that life has many kinds of moments, and that most importantly you enjoy it. Your absurd love for anime (and my dragonball keychain) reminds me about this part of you."
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://i.ibb.co/Gc6JNJ9/Screen-Shot-2022-07-18-at-9-32-53-PM.png",
                    "alt_text": "akatsuki"
                }
            }
        ]
    };
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
                    "text": "*:bikini: New outfit?* She might already have it on, but cool girl can only reveal her gift IRL, she'll see you in bed tonight :smirk: \n\n *Read this note :love_letter:* \n\n I kept a Trello board with notes and thoughts from each of our early dates. Here are some you'd appreciate: \n\n :heart: when we got back to my place, mans couldn't wait and basically we made out in the lobby but my ass was on the heater and I swear I have burn marks on my butt. It was kinda hot, he's pretty hot. \n :heart: this could be stockholm but he's also actively interviewing at Citadel which idk it just gets me going \n :heart: hell yeah his body and 🍆 are 👌🏼 would feast \n :heart: I told him I would drop his ass so fast if I walked in and he had the patagonia MS vest on, so he went to his closet grabbed it and wore it to sleep for the rest of the night. 💀 ngl the vest…kinda turned me on? \n :heart: had probably one of the best first dates, went to a whiskey tasting and got cocktails in Tribeca then went back to his place played ping pong and fooked. He was honestly a good blend of everything: smart, driven, relaxed, funny (very), has depth, social, and also very sweet. He kicked my ass in ping pong using his non dominant hand wtf but also dtf."
                }
            }
        ]
    };
    await say(cool);
});
app.message(/(resy|bot|reservations|dates)/, async ({ message, say, client }) => {
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
    };
    await say(resyReveal);
});
app.message(/(concert|symphony|joe hisaishi|miyazaki|studio)/, async ({ message, say, client }) => {
    const ghibli = {
        "text": "Title",
        "blocks": [
            {
                "type": "section",
                "block_id": "dons",
                "text": {
                    "type": "mrkdwn",
                    "text": "*:musical_score: :japanese_castle: I heard you like anime music...* \n\n Joe Hisaishi is the original composer for Miyazaki's films at Studio Ghibli (yes, including One Summers Day). Hisaishi rarely goes on tour, but luckily this year, he is coming to NYC at Radio City Hall on August 18th at 8PM. You and Tiffany are going to see him conduct a full symphony live with front section tickets. Get ready for this electrifying experience! :zap: \n\n *Why did she get you this? Read this note :love_letter:* \n\n Classical music + anime + classic films + live = probably one of the most ideal experiences for Neil. I'm still shook by your piano abilities and (sort of random) interest in classical music. Thank you for taking me to the Chopin concert and all those jazz concerts – live music reminds me of you so I wanted to surprise you with a once-in-a-lifetime experience that brought together your interests!"
                }
            }
        ]
    };
    await say(ghibli);
});
const postMessage = async (str, rest) => {
    await app.client.chat.postMessage({
        text: `:star-struck: I found a reservation! You're successfully booked at ${rest}! Please login to your Resy to see details on the reservation.`,
        channel: str
    });
};
export default postMessage;
(async () => {
    // Start your app
    await app.start(process.env.PORT || 6000);
    console.log('⚡️ Slack app is running!');
})();
