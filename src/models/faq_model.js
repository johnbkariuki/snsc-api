import mongoose, { Schema } from 'mongoose';

// Filter Schema
const FaqSchema = new Schema({
  question: { type: String },
  answer: { type: String },
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create SearchModel class from schema
const FaqModel = mongoose.model('Faq', FaqSchema);

export default FaqModel;
