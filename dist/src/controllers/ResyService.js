import { BaseService } from "./BaseService.js";
import dayjs from "dayjs";
const BASE_URL = "https://api.resy.com/";
const routes = {
    book: "/3/book",
    cancel: "/3/cancel",
    details: "/3/details",
    emailExists: "/3/auth/exists",
    favorites: "/3/favorites",
    generateClientToken: "/2/braintree/client_token/generate",
    geoip: "/3/geoip",
    login: "/3/auth/password",
    logout: "/2/user/device",
    notify: "/2/notify",
    reservations: "/3/user/reservations",
    search: "/4/find",
    user: "/2/user",
    venue: "/3/venue",
    venueCalendar: "/4/venue/calendar",
    venueSearch: "/3/venuesearch/search",
};
class ResyService extends BaseService {
    headers = {};
    email;
    password;
    constructor({ email, password }) {
        super(BASE_URL);
        this.email = email;
        this.password = password;
        this.headers = {
            authorization: 'ResyAPI api_key="VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5"',
            "cache-control": "no-cache",
            dnt: "1",
            origin: "https://resy.com",
            referer: "https://resy.com/",
            "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
            "x-origin": "https://resy.com",
        };
    }
    logout = async (token) => {
        const params = new URLSearchParams();
        params.set("device_token", token);
        return this.delete(routes.logout + `?${params.toString()}`);
    };
    emailExists = async (email) => {
        const body = `email=${email}`;
        return this.post(routes.emailExists, body);
    };
    generateClientToken = async (authToken, apiKey) => {
        return this.get(routes.generateClientToken, {
            headers: this.headers,
        });
    };
    generateHeadersAndLogin = async () => {
        const loginResp = await this.login(this.email, this.password);
        const authToken = loginResp.data.token;
        this.headers = {
            ...this.headers,
            authorization: 'ResyAPI api_key="VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5"',
            "x-resy-auth-token": authToken,
            "x-resy-universal-auth": authToken,
        };
        return loginResp;
    };
    login = async (email, password) => {
        const data = new URLSearchParams({
            email: email || this.email,
            password: password || this.password,
        });
        return this.post(routes.login, data.toString(), {
            headers: {
                authorization: 'ResyAPI api_key="VbWk7s3L4KiK5fzlO7JD3Q5EYolJI7n5"',
            },
        });
    };
    search = async (params) => {
        const opts = { ...(params || {}) };
        opts.party_size ?? (opts.party_size = 2);
        opts.lat ?? (opts.lat = 0);
        opts.long ?? (opts.long = 0);
        return this.get(routes.search, {
            params: opts,
            headers: this.headers,
        });
    };
    searchByName = async (data) => {
        return this.post(routes.venueSearch, data, {
            headers: this.headers,
        });
    };
    details = async (data) => {
        return this.post(routes.details, data, {
            headers: this.headers,
        });
    };
    book = async (data) => {
        const params = new URLSearchParams(data);
        return this.post(routes.book, params, {
            headers: this.headers,
        });
    };
    getVenue = async (venueId) => {
        return this.get(routes.venue, {
            params: {
                id: venueId,
            },
            headers: this.headers,
        });
    };
    getUser = async () => {
        return this.get(routes.user, {
            headers: this.headers,
        });
    };
    getVenueCalendar = async (venueId, numSeats = 2) => {
        const startDate = dayjs().format("YYYY-MM-DD");
        const endDate = dayjs().add(1, "y").format("YYYY-MM-DD");
        const params = {
            venue_id: venueId,
            num_seats: numSeats,
            start_date: startDate,
            end_date: endDate,
        };
        return this.get(routes.venueCalendar, {
            params,
            headers: this.headers,
        });
    };
    getAvailableDatesForVenue = async (venueId, numSeats = 2) => {
        const venueCalendar = await this.getVenueCalendar(venueId, numSeats);
        const schedule = venueCalendar.data?.scheduled || [];
        const availableDates = schedule.filter((l) => l?.inventory?.reservation === "available");
        return availableDates;
    };
    getAvailableTimesForVenueAndDate = async (venueId, date, numSeats = 2) => {
        const venueSearch = await this.search({
            venue_id: venueId,
            day: date,
            party_size: numSeats,
        });
        const slots = venueSearch.data.results?.venues?.[0].slots || [];
        return slots;
    };
    getReservationByToken = async (resy_token) => {
        return this.get(routes.reservations, {
            params: {
                resy_token,
            },
            headers: this.headers,
        });
    };
    getGeoIpData = async () => {
        return this.get(routes.geoip, {
            headers: this.headers,
        });
    };
    cancelReservationByToken = async (resy_token) => {
        const data = new URLSearchParams({
            resy_token,
        });
        return this.post(routes.cancel, data.toString(), {
            headers: this.headers,
        });
    };
    setUpPriorityNotification = async (notifyReq) => {
        const data = new URLSearchParams(notifyReq);
        return this.post(routes.notify, data.toString(), {
            headers: this.headers,
        });
    };
}
export default ResyService;
