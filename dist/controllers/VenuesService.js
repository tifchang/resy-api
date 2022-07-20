import { join, dirname } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import { v4 as uuid } from "uuid";
const __dirname = dirname(fileURLToPath(import.meta.url));
class VenuesService {
    db;
    constructor() {
        // Use JSON file for storage
        const file = join(__dirname, "../../db.json");
        const adapter = new JSONFile(file);
        const db = new Low(adapter);
        this.db = db;
    }
    init = async () => {
        // Read data from JSON file, this will set db.data content
        await this.db.read();
        this.db.data || (this.db.data = { venues: [] });
        this.db.data.venues.forEach((v) => {
            v.uuid ?? (v.uuid = uuid());
            v.partySize ?? (v.partySize = 2);
        });
    };
    save = async () => {
        await this.db.write();
    };
    getAllWatchedVenues = async () => {
        return this.db.data?.venues || [];
    };
    getWatchedVenues = async () => {
        return (this.db.data?.venues || []).filter((v) => !v.reservationDetails && (v.shouldBook || !v.notified));
    };
    addWatchedVenue = async (venue) => {
        venue.uuid = uuid();
        this.db.data.venues.push(venue);
        await this.save();
    };
    updateWatchedVenue = async (venue) => {
        const venues = this.db.data.venues || [];
        for (let i = 0; i < venues.length; i++) {
            if (venues[i].uuid === venue.uuid) {
                venues[i] = venue;
                break;
            }
        }
        await this.save();
    };
    updateVenue = async (venue) => {
        const venues = this.db.data.venues || [];
        for (let i = 0; i < venues.length; i++) {
            if (venues[i].id === venue.id) {
                venues[i].minTime = venue.minTime;
                venues[i].maxTime = venue.maxTime;
                venues[i].preferredTime = venue.preferredTime;
                venues[i].partySize = venue.partySize;
                venues[i].allowedDates = venue.allowedDates;
                venues[i].shouldBook = true;
                break;
            }
        }
        if (venues === []) {
            this.addWatchedVenue(venue);
        }
        ;
        await this.save();
    };
}
export default VenuesService;
