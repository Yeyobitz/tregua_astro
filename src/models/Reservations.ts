import mongoose from 'mongoose';

const ReservationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  people: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
});

export default mongoose.models.Reservation || mongoose.model('Reservation', ReservationSchema);