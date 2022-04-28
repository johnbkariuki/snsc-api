import mongoose, { Schema } from 'mongoose';

// Filter Schema
const TownsNewHampshireSchema = new Schema({
  name: { type: String },
  frequency: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const TownsNewHampshireModel = mongoose.model('TownsNewHampshire', TownsNewHampshireSchema);

export default TownsNewHampshireModel;
