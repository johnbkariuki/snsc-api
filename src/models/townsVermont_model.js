import mongoose, { Schema } from 'mongoose';

// Filter Schema
const TownsVermontSchema = new Schema({
  name: { type: String },
  frequency: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const TownsVermontModel = mongoose.model('TownsVermont', TownsVermontSchema);

export default TownsVermontModel;
