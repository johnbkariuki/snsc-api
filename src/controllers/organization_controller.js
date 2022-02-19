/* eslint-disable import/prefer-default-export */
import Organization from '../models/organization_model';

export const createOrganization = async (organizationFields) => {
  const organization = new Organization();
  organization.name = organizationFields.name;
  organization.service = organizationFields.service;
  organization.contactName = organizationFields.contactName;
  organization.email = organizationFields.email;
  organization.phone = organizationFields.phone;
  organization.website = organizationFields.website;
  organization.disability = organizationFields.disability;
  organization.townServed = organizationFields.townServed;
  organization.age = organizationFields.age;
  organization.serviceFee = organizationFields.serviceFee;
  organization.insurance = organizationFields.insurance;

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
