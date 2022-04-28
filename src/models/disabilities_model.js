import mongoose, { Schema } from 'mongoose';

// Filter Schema
const DisabilitiesSchema = new Schema({
  name: { type: String },
  frequency: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const DisabilitiesModel = mongoose.model('Disabilities', DisabilitiesSchema);

export default DisabilitiesModel;
