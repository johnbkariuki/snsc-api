import mongoose, { Schema } from 'mongoose';

// create a OrganizationSchema
const SearchSchema = new Schema({
  name: { type: String },
  disabilitiesServed: [String],
  statesServed: [String],
  agesServed: Object,
  fee: { type: String },
  insurancesAccepted: [String],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const SearchModel = mongoose.model('Search', SearchSchema);

export default SearchModel;
