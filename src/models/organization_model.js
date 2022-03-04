import mongoose, { Schema } from 'mongoose';

// create a OrganizationSchema
const OrganizationSchema = new Schema({
  name: { type: String },
  descriptions: { type: String },
  primaryContactName: { type: String },
  primaryContactRole: { type: String },
  primaryEmail: { type: String },
  fullEmail: { type: String },
  primaryPhoneNumber: { type: String },
  fullPhoneNumber: { type: String },
  primaryWebsite: { type: String },
  fullWebsite: { type: String },
  disabilitiesServed: [String],
  statesServed: [String],
  agesServed: Object,
  fee: { type: String },
  feeDescription: { type: String },
  insurancesAccepted: [String],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create OrganizationModel class from schema
const OrganizationModel = mongoose.model('Organization', OrganizationSchema);

export default OrganizationModel;
