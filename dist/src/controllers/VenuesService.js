import { dirname } from "path";
// import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
const __dirname = dirname(fileURLToPath(import.meta.url));
import Reservations from "../../models/models.js";
import log from "../log.js";
class VenuesService {
    // db: Low<DbSchema>;
    constructor() {
        // Use JSON file for storage
        // const file = join(__dirname, "../../db.json");
        // const adapter = new JSONFile<DbSchema>(file);
        const db = [];
        // this.db = db;
    }
    init = async () => {
        // Read data from JSON file, this will set db.data content
        // await this.db.read();
        // switching out local to get all data from mongo
        // this.db.data || (this.db.data = { venues: [] });
        // this.db.data.venues.forEach((v) => {
        //   v.uuid ?? (v.uuid = uuid());
        //   v.partySize ?? (v.partySize = 2);
        // });
        // Reservations.find()
        //   .then((res) => {
        //     if (res.length === 0) {
        //       console.log("No results");
        //       return;
        //     }
        //     // do something with the results
        //   })
        //   .catch((err) => {
        //     console.log("Error in finding restaurants", err)
        // })
    };
    save = async (venue) => {
        var newRes = {
            name: venue.name,
            id: venue.id,
            notified: venue.notified,
            minTime: venue.minTime,
            preferredTime: venue.preferredTime,
            maxTime: venue.maxTime,
            shouldBook: venue.shouldBook,
            partySize: venue.partySize,
            allowedDates: venue.allowedDates,
            uuid: venue.uuid,
            reservationDetails: {}
        };
        const res = new Reservations(newRes);
        res.save().then((saved) => {
            console.log("Venue saved in DB");
        })
            .catch((err) => { console.log("Error occured in saving", err); });
        // await this.db.write();
    };
    getAllWatchedVenues = async () => {
        // return this.db.data?.venues || [];
        return await Reservations.find({});
        // Reservations.find()
        //   .then((res) => {
        //     console.log("All restaurants", res);
        //     if (res.length === 0) {
        //       console.log("No results");
        //       return(res);
        //     }
        //     // do something with the results
        //     console.log(typeof res);
        //     return(res);
        //   })
        //   .catch((err) => {
        //     console.log("Error in finding restaurants", err)
        // })
    };
    getWatchedVenues = async () => {
        // return [];
        // return (this.db.data?.venues || []).filter(
        //   (v) => !v.reservationDetails && (v.shouldBook || !v.notified)
        // );
        // {"shouldBook": true, "notified": false}
        var reservations = await Reservations.find({ shouldBook: true, notified: false }).exec();
        return reservations;
    };
    addWatchedVenue = async (venue) => {
        // venue.uuid = uuid();
        // this.db.data!.venues.push(venue);
        // await this.save();
        var newRes = {
            name: venue.name,
            id: venue.id,
            notified: venue.notified,
            minTime: venue.minTime,
            preferredTime: venue.preferredTime,
            maxTime: venue.maxTime,
            shouldBook: venue.shouldBook,
            partySize: venue.partySize,
            allowedDates: venue.allowedDates,
            uuid: uuid(),
            reservationDetails: {}
        };
        var res = new Reservations(newRes);
        res.save().then((saved) => {
            log.info("New venue saved in DB");
        })
            .catch((err) => { console.log("Error occured in saving", err); });
    };
    updateWatchedVenue = async (venue) => {
        // const venues = this.db.data!.venues || [];
        // for (let i = 0; i < venues.length; i++) {
        //   if (venues[i].uuid === venue.uuid) {
        //     venues[i] = venue;
        //     break;
        //   }
        // }
        // await this.save();
        Reservations.findOneAndUpdate({
            uuid: venue.uuid
        }, {
            name: venue.name,
            id: venue.id,
            notified: venue.notified,
            minTime: venue.minTime,
            preferredTime: venue.preferredTime,
            maxTime: venue.maxTime,
            shouldBook: venue.shouldBook,
            partySize: venue.partySize,
            allowedDates: venue.allowedDates,
            reservationDetails: venue.reservationDetails
        }).then((res) => {
            if (res === null) {
                log.error("No results");
                return;
            }
            // do something with the results
            log.info("updating this restaurant", res.name);
            return;
        })
            .catch((err) => {
            log.info("Error in updating restaurant", err);
        });
    };
    updateVenue = async (venue) => {
        // LOCAL FILE CHANGES --
        //   const venues = this.db.data!.venues || [];
        //   for (let i = 0; i < venues.length; i++) {
        //     if (venues[i].id === venue.id) {
        //       venues[i].minTime = venue.minTime;
        //       venues[i].maxTime = venue.maxTime;
        //       venues[i].preferredTime = venue.preferredTime;
        //       venues[i].partySize = venue.partySize;
        //       venues[i].allowedDates = venue.allowedDates;
        //       venues[i].shouldBook = true;
        //       break;
        //     }
        //   }
        //   if (venues === []) {
        //     this.addWatchedVenue(venue);
        //   };
        //   await this.save();
        Reservations.findOneAndUpdate({
            uuid: venue.uuid
        }, {
            name: venue.name,
            id: venue.id,
            notified: venue.notified,
            minTime: venue.minTime,
            preferredTime: venue.preferredTime,
            maxTime: venue.maxTime,
            shouldBook: venue.shouldBook,
            partySize: venue.partySize,
            allowedDates: venue.allowedDates,
            reservationDetails: venue.reservationDetails
        }).then((res) => {
            if (res === null) {
                log.error("No results");
                return;
            }
            // do something with the results
            log.info("✅ Updated", res.name, "in MongoDB.");
            return;
        })
            .catch((err) => {
            log.error("❌ Error in updating restaurant", err);
        });
    };
}
export default VenuesService;
