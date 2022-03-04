/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import Organization from '../models/organization_model';
import User from '../models/user_model';

export const createOrganization = async (organizationFields) => {
  const organization = new Organization();
  organization.name = organizationFields.name;
  organization.descriptions = organizationFields.descriptions;
  organization.primaryContactName = organizationFields.primaryContactName;
  organization.primaryContactRole = organizationFields.primaryContactRole;
  organization.primaryEmail = organizationFields.primaryEmail;
  organization.fullEmail = organizationFields.fullEmail;
  organization.primaryPhoneNumber = organizationFields.primaryPhoneNumber;
  organization.fullPhoneNumber = organizationFields.fullPhoneNumber;
  organization.primaryWebsite = organizationFields.primaryWebsite;
  organization.fullWebsite = organizationFields.fullWebsite;
  organization.disabilitiesServed = organizationFields.disabilitiesServed;
  organization.statesServed = organizationFields.statesServed;
  organization.agesServed = organizationFields.agesServed;
  organization.fee = organizationFields.fee;
  organization.feeDescription = organizationFields.feeDescription;

  if (organizationFields.insurancesAccepted === '') {
    organization.insurancesAccepted = [];
  } else {
    organization.insurancesAccepted = organizationFields.insurancesAccepted;
  }

  try {
    const savedOrganization = await organization.save();
    return savedOrganization;
  } catch (error) {
    throw new Error(`could not create organization error: ${error}`);
  }
};

export const getAllOrganizations = async () => {
  try {
    const allOrganizations = await Organization.find({});
    return allOrganizations;
  } catch (error) {
    throw new Error(`get all organization error: ${error}`);
  }
};

export const getOrganization = async (id) => {
  try {
    const organization = await Organization.findById(id).exec();
    return organization;
  } catch (error) {
    throw new Error(`could not find organization: ${error}`);
  }
};

export const deleteOrganization = async (organizationId) => {
  try {
    const result = await Organization.findByIdAndRemove(organizationId);
    await User.updateMany({}, { $pullAll: { favoriteIds: [organizationId] } });
    return result;
  } catch (error) {
    throw new Error(`could not delete organization info: ${error}`);
  }
};

export const updateOrganization = async (organizationId, organizationFields) => {
  try {
    const organization = await Organization.findOneAndUpdate({ _id: organizationId }, organizationFields, { new: true });
    return organization;
  } catch (error) {
    throw new Error(`could not update organization info ${error}`);
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

export const addAllOrganizationInfo = async (jsonData) => {
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < jsonData.organizations.length; i++) {
      createOrganization(jsonData.organizations[i]);
    }
  } catch (error) {
    throw new Error(`could not save all organization info ${error}`);
  }
};

export const saveToFavorites = async (organizationId, user) => {
  try {
    await User.updateOne(
      { _id: user.id },
      { $push: { favoriteIds: organizationId } },
    );
  } catch (error) {
    throw new Error(`could not save organization to favorites ${error}`);
  }
};

export const getAllFavorites = async (favoriteIdsList) => {
  try {
    const organizations = await Organization.find({ _id: { $in: favoriteIdsList } });
    return organizations;
  } catch (error) {
    throw new Error(`could not get all favorite organizations ${error}`);
  }
};

export const removeFromFavorites = async (organizationId, user) => {
  try {
    await User.updateOne({ _id: user.id }, { $pullAll: { favoriteIds: [organizationId] } });
  } catch (error) {
    throw new Error(`could not remove from favorites ${error}`);
  }
};
