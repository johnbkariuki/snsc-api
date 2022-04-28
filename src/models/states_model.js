import mongoose, { Schema } from 'mongoose';

// Filter Schema
const StatesSchema = new Schema({
  name: { type: String },
  frequency: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const StatesModel = mongoose.model('States', StatesSchema);

export default StatesModel;
