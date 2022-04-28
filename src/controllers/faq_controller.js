/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import Faq from '../models/faq_model';

export const createFaq = async (faqFields) => {
  const faq = new Faq();
  faq.question = faqFields.question;
  faq.answer = faqFields.answer;

  try {
    const savedFaq = await faq.save();
    return savedFaq;
  } catch (error) {
    throw new Error(`could not create FAQ error: ${error}`);
  }
};

export const deleteOrganization = async (faqId) => {
  try {
    const result = await Faq.findByIdAndRemove(faqId);
    return result;
  } catch (error) {
    throw new Error(`could not delete FAQ info: ${error}`);
  }
};

export const updateOrganization = async (faqId, faqFields) => {
  try {
    const faq = await Faq.findOneAndUpdate({ _id: faqId }, faqFields, { new: true });
    return faq;
  } catch (error) {
    throw new Error(`could not update FAQ info ${error}`);
  }
};

export const getAllFaqs = async () => {
  try {
    const allFaqs = await Faq.find({});
    return allFaqs;
  } catch (error) {
    throw new Error(`get all Faqs error: ${error}`);
  }
};

export const readJsonFile = async (filePath) => {
  try {
    const encoding = 'utf8';
    const rawData = fs.readFileSync(filePath, encoding);
    const jsonData = JSON.parse(rawData);
    return jsonData;
  } catch (error) {
    throw new Error(`could not read json file ${error}`);
  }
};

export const addAllFaqInfo = async (jsonData) => {
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < jsonData.faqs.length; i++) {
    // await createFaq(jsonData.faqs[i]);
      createFaq(jsonData.faqs[i]);
    }
  } catch (error) {
    throw new Error(`could not save all FAQ info ${error}`);
  }
};
