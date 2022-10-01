import cron from "node-schedule";
import log from "./log.js";
import ResyService from "./controllers/ResyService.js";
import TextService from "./controllers/TextService.js";
import VenuesService from "./controllers/VenuesService.js";
import dayjs from "dayjs";
import 'dotenv/config';
import postMessage from "./app.js";
const email = process.env.RESY_EMAIL;
const password = process.env.RESY_PASSWORD;
const service = new ResyService({
    email,
    password,
});
var senderId = "";
const textController = new TextService();
const venuesService = new VenuesService();
const restaurantTimings = {
    "834": { "numDays": 28, "time": "9:00", "checkDay": 28, "checkHour": 8, "checkMin": 59, "checkSec": 50 },
    "25973": { "numDays": 14, "time": "9:00", "checkDay": 14, "checkHour": 8, "checkMin": 59, "checkSec": 50 },
    "42534": { "numDays": 7, "time": "0:00", "checkDay": 8, "checkHour": 23, "checkMin": 59, "checkSec": 50 },
    "35676": { "numDays": 30, "time": "0:00", "checkDay": 31, "checkHour": 23, "checkMin": 59, "checkSec": 50 },
    "5771": { "numDays": 21, "time": "0:00", "checkDay": 22, "checkHour": 23, "checkMin": 59, "checkSec": 50 },
    "443": { "numDays": 14, "time": "0:00", "checkDay": 15, "checkHour": 23, "checkMin": 59, "checkSec": 50 },
    "0": { "numDays": 21, "time": "0:00", "checkDay": 21, "checkHour": 12, "checkMin": 57, "checkSec": 0 },
};
const parsePossibleSlots = async (venue, possibleSlots) => {
    const dateToCheck = possibleSlots[0].date.start;
    log.info(`Found ${possibleSlots.length} valid open slots on ${dateToCheck} for ${venue.name}`);
    if (venue.preferredTime) {
        const date = possibleSlots[0].start.format("YYYY-MM-DD");
        const preferredTime = dayjs(`${date} ${venue.preferredTime}`);
        possibleSlots.forEach((slot) => {
            slot.diff = Math.abs(slot.start.diff(preferredTime));
        });
        possibleSlots.sort((slotA, slotB) => {
            return slotA.diff - slotB.diff;
        });
    }
    const timeToBook = possibleSlots[0];
    log.info(`Found best time to book - ${timeToBook.date.start}`);
    if (!venue.notified) {
        await textController.sendText(`There is availability at ${venue.name} at ${timeToBook.date.start}`);
        venue.notified = true;
        await venuesService.updateWatchedVenue(venue);
    }
    if (venue.shouldBook) {
        const userDetails = await service.getUser();
        const configId = timeToBook.config.token;
        const timeDetails = await service.details({
            commit: 1,
            config_id: configId,
            party_size: venue.partySize ?? 2,
            day: (dateToCheck || "").split(" ")[0] || timeToBook.shift.day,
        });
        const bookingResponse = await service.book({
            book_token: timeDetails.data.book_token.value,
            struct_payment_method: `{"id":${userDetails.data.payment_methods[0].id}}`,
            source_id: "resy.com-venue-details",
        });
        venue.reservationDetails = bookingResponse.data;
        venue.notified = true;
        venue.shouldBook = false;
        log.info(`Successfully booked at ${venue.name}`);
        await venuesService.updateWatchedVenue(venue);
        await postMessage(senderId, venue.name);
    }
};
const refreshAvailabilityForVenue = async (venue) => {
    try {
        const availableDates = await service.getAvailableDatesForVenue(venue.id, venue.partySize);
        if (!availableDates.length) {
            return;
        }
        for (const dateToCheck of availableDates) {
            //if dateToCheck.date in list of dates
            if (venue.allowedDates) {
                if (venue.allowedDates.indexOf(dateToCheck.date) == -1) {
                    log.info("skipping available date because of allowed dates flag");
                    continue;
                }
            }
            const slots = (await service.getAvailableTimesForVenueAndDate(venue.id, dateToCheck.date, venue.partySize));
            const possibleSlots = slots.filter((slot) => {
                const start = dayjs(slot.date.start);
                const minTime = dayjs(`${start.format("YYYY-MM-DD")} ${venue.minTime}`);
                const maxTime = dayjs(`${start.format("YYYY-MM-DD")} ${venue.maxTime}`);
                slot.start = start;
                return start >= minTime && start <= maxTime;
            });
            if (possibleSlots.length) {
                await parsePossibleSlots(venue, possibleSlots);
                return;
            }
        }
        log.debug(`Found no valid slots for ${venue.name}`);
    }
    catch (e) {
        console.error(e);
    }
};
const refreshAvailability = async () => {
    log.info("Finding reservations");
    await venuesService.init();
    const venuesToSearchFor = await venuesService.getWatchedVenues();
    for (const venue of venuesToSearchFor) {
        await refreshAvailabilityForVenue(venue);
    }
    // await venuesService.save();
    log.info("Finished finding reservations");
};
const regenerateHeaders = async () => {
    try {
        if (!email || !password) {
            log.warn("Email or password not set, did you forget to set the environment variables?");
            return;
        }
        await service.generateHeadersAndLogin();
    }
    catch (e) {
        log.error(e);
        log.error("Error regenerating headers and logging in");
        process.exit(1);
    }
};
const runResy = async (id) => {
    console.log("🏃‍♂️ running runResy");
    senderId = id;
    // every day fetch every post
    cron.scheduleJob("* */5 * * * *", refreshAvailability);
    cron.scheduleJob("1 * * * *", regenerateHeaders);
    regenerateHeaders().then(async () => {
        await refreshAvailability();
    });
};
const runResySchedule = async (userId, venue) => {
    log.info("📆 scheduling cron for " + venue.name);
    senderId = userId;
    const id = venue.id;
    const offset = restaurantTimings[id].numDays;
    const hour = restaurantTimings[id].checkHour;
    const min = restaurantTimings[id].checkMin;
    const sec = restaurantTimings[id].checkSec;
    // dates cannot be shallow copied
    var scheduleDateStart = new Date(venue.allowedDates[0] + "T23:59:59");
    var scheduleDateEnd = new Date(venue.allowedDates[0] + "T23:59:59");
    var today = new Date();
    const checkDateStart = scheduleDateStart;
    checkDateStart.setDate(scheduleDateStart.getDate() - offset);
    const checkDateEnd = scheduleDateEnd;
    checkDateEnd.setDate(checkDateEnd.getDate() - offset);
    log.info("Checking date for: " + checkDateStart);
    if (Date.parse(today.toString()) < Date.parse(checkDateStart.toString())) {
        checkDateStart.setHours(hour, min, sec);
        checkDateEnd.setHours(hour, min, sec);
        log.info("⏰ Scheduling cron for " + checkDateStart.toString());
        checkDateEnd.setSeconds(checkDateEnd.getSeconds() + 20);
        // converting to UTC
        // const startDate = Date.UTC(checkDateStart.getUTCFullYear(), checkDateStart.getUTCMonth(),
        // checkDateStart.getUTCDate(), checkDateStart.getUTCHours(),
        // checkDateStart.getUTCMinutes(), checkDateStart.getUTCSeconds());
        // const endDate = Date.UTC(checkDateEnd.getUTCFullYear(), checkDateEnd.getUTCMonth(),
        // checkDateEnd.getUTCDate(), checkDateEnd.getUTCHours(),
        // checkDateEnd.getUTCMinutes(), checkDateEnd.getUTCSeconds());
        const startTime = new Date(checkDateStart);
        const endTime = new Date(checkDateEnd);
        log.info("Starting at " + startTime);
        log.info("Ending at: " + endTime);
        console.log(startTime, endTime);
        cron.scheduleJob("1 * * * *", regenerateHeaders);
        cron.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, refreshAvailability);
        cron.scheduleJob({ start: startTime, end: endTime, rule: '1 * * * *' }, regenerateHeaders);
    }
};
// const startTime1 = new Date(Date.now() + 1000);
// const endTime1 = new Date(startTime1.getTime() + 5000);
// cron.scheduleJob({ start: isodi_st, end: isodi_et, rule: '*/1 * * * * *' }, refreshAvailability);
const fakeVenue = {
    "name": "Rezdora",
    "id": 0,
    "notified": false,
    "minTime": "11:00",
    "preferredTime": "11:30",
    "maxTime": "2:30",
    "shouldBook": true,
    "partySize": 2,
    "allowedDates": ["2022-10-22"],
    "uuid": ""
};
var scheduledJobs = cron.scheduledJobs;
console.log(JSON.stringify(scheduledJobs));
runResySchedule("hello", fakeVenue);
export { runResy, runResySchedule };
