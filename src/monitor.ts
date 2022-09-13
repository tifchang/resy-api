import cron from "node-schedule";
import log from "./log.js";
import ResyService from "./controllers/ResyService.js";
import TextService from "./controllers/TextService.js";
import type { VenueToWatch } from "./controllers/VenuesService.js";
import VenuesService from "./controllers/VenuesService.js";
import dayjs from "dayjs";
import type { EnhancedSlot } from "./types/find";
import 'dotenv/config';
import postMessage from "./app.js";
import Reservations from "../models/models.js";
import mongoose from 'mongoose';

const email = process.env.RESY_EMAIL!;
const password = process.env.RESY_PASSWORD!;
const service = new ResyService({
  email,
  password,
});
var senderId = "";
const textController = new TextService();
const venuesService = new VenuesService();

const restaurantTimings = {
    "834": {"numDays": 30, "time": "9:00", "checkDay": 31, "checkTime": "8:59:50"},
    "25973": {"numDays": 14, "time": "9:00", "checkDay": 14, "checkTime": "8:59:50"},
    "42534": {"numDays": 7, "time": "0:00", "checkDay": 8, "checkTime": "23:59:50"},
    "35676": {"numDays": 30, "time": "0:00", "checkDay": 31, "checkTime": "23:59:50"},
    "5771": {"numDays": 21, "time": "0:00", "checkDay": 22, "checkTime": "23:59:50"},
    "443": {"numDays": 14, "time": "0:00", "checkDay": 15, "checkTime": "23:59:50"},
}

const parsePossibleSlots = async (
  venue: VenueToWatch,
  possibleSlots: EnhancedSlot[]
) => {
  const dateToCheck = possibleSlots[0].date.start;
  log.info(
    `Found ${possibleSlots.length} valid open slots on ${dateToCheck} for ${venue.name}`
  );
  if (venue.preferredTime) {
    const date = possibleSlots[0].start!.format("YYYY-MM-DD");
    const preferredTime = dayjs(`${date} ${venue.preferredTime}`);
    possibleSlots.forEach((slot) => {
      slot.diff = Math.abs(slot.start!.diff(preferredTime));
    });
    possibleSlots.sort((slotA, slotB) => {
      return slotA.diff - slotB.diff;
    });
  }
  const timeToBook = possibleSlots[0];
  log.info(`Found best time to book - ${timeToBook.date.start}`);
  if (!venue.notified) {
    await textController.sendText(
      `There is availability at ${venue.name} at ${timeToBook.date.start}`
    );
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
      book_token: timeDetails!.data!.book_token!.value!,
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
    const availableDates = await service.getAvailableDatesForVenue(
      venue.id,
      venue.partySize
    );
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

      const slots = (await service.getAvailableTimesForVenueAndDate(
        venue.id,
        dateToCheck.date,
        venue.partySize
      )) as EnhancedSlot[];

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
  } catch (e) {
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
      log.warn(
        "Email or password not set, did you forget to set the environment variables?"
      );
      return;
    }
    await service.generateHeadersAndLogin();
  } catch (e) {
    log.error(e);
    log.error("Error regenerating headers and logging in");
    process.exit(1);
  }
};


const runResy = async (id: string) => {
  console.log("running runResy");
  senderId = id;
  // every day fetch every post
  cron.scheduleJob("* */5 * * * *", refreshAvailability);
  cron.scheduleJob("1 * * * *", regenerateHeaders);

  regenerateHeaders().then(async () => {
    await refreshAvailability();
  });
};

const runResySchedule = async (userId: string, dates: string[], venue: VenueToWatch) => {
  console.log("scheduling cron...");
  senderId = userId;

  for (const d in dates) {
    const year = d.split('-')[0];
    const month = d.split('-')[1];
    const day = d.split('-')[2];
    console.log("year:", year, "month:", month, "day:", day);
  }
  // const startTime = new Date(Date.now() + 5000);
  // const endTime = new Date(startTime.getTime() + 5000);
  // const job = cron.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
  //   console.log('Time for tea!');
  // });
}

export {runResy, runResySchedule};
