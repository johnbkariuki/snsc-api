import mongoose, { Schema } from 'mongoose';

// Filter Schema
const ServicesSchema = new Schema({
  name: { type: String },
  frequency: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const ServicesModel = mongoose.model('Services', ServicesSchema);

export default ServicesModel;
