import mongoose, { Schema } from 'mongoose';

// create a OrganizationSchema
const OrganizationSchema = new Schema({
  name: { type: String },
  service: { type: String },
  contactName: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  disability: { type: String },
  townServed: { type: String },
  age: { type: String },
  serviceFee: { type: String },
  insurance: { type: String },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create OrganizationModel class from schema
const OrganizationModel = mongoose.model('Organization', OrganizationSchema);

export default OrganizationModel;
