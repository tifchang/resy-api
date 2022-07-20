import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// var ReservationDetailsSchema = new Schema({
//     resy_token: String,
//     reservation_id: Number,
//     date: String
// });

var ReservationSchema = new Schema({
    name: String,
    id: Number,
    notified: Boolean,
    minTime: String,
    preferredTime: String,
    maxTime: String,
    shouldBook: Boolean,
    partySize: Number,
    allowedDates: [],
    uuid: String,
    reservationDetails: Object
});

const Reservations = mongoose.model('Reservations', ReservationSchema);

export default Reservations;
  