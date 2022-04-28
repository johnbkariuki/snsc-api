import mongoose, { Schema } from 'mongoose';

// Filter Schema
const InsurancesSchema = new Schema({
  name: { type: String },
  frequency: { type: Number },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const InsurancesModel = mongoose.model('Insurances', InsurancesSchema);

export default InsurancesModel;
