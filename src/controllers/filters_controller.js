/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable import/prefer-default-export */
// import fs from 'fs';
// import Organization from '../models/organization_model';
// import User from '../models/user_model';
import Disabilities from '../models/disabilities_model';
import Services from '../models/services_model';
import States from '../models/states_model';
import Insurances from '../models/insurances_model';
// import TownsNewHampshire from '../models/townsNewHampshire_model';
// import TownsVermont from '../models/townsVermont_model';

const addOrDeleteFilters = async (Model, listData, operation) => {
  if (operation === 'add') {
    for (let index = 0; index < listData.length; index++) {
      const found = await Model.findOne({ name: listData[index] });

      if (found != null) {
        await Model.updateOne({ _id: found.id }, { $inc: { frequency: 1 } });
      } else {
        const createdModel = new Model();
        createdModel.name = listData[index];
        createdModel.frequency = 1;
        await createdModel.save();
      }
    }
  } else if (operation === 'delete') {
    for (let index = 0; index < listData.length; index++) {
      const found = await Model.findOne({ name: listData[index] });

      if (found != null) {
        const newFrequency = found.frequency - 1;

        if (newFrequency === 0) {
          await Model.findByIdAndRemove(found.id);
        } else {
          await Model.updateOne({ _id: found.id }, { $inc: { frequency: -1 } });
        }
      }
    }
  }
};

export const updateFilter = async (Model, prevFilterOptions, currFilterOptions) => {
  // check if the fields are defined
  if (prevFilterOptions && currFilterOptions) {
    // get the new filters options that the organization has added
    const newFilterOptions = currFilterOptions.filter((x) => { return !prevFilterOptions.includes(x); });
    // get the filter options that no longer apply to the organization
    const oldFilterOptions = prevFilterOptions.filter((x) => { return !currFilterOptions.includes(x); });
    await addOrDeleteFilters(Model, newFilterOptions, 'add');
    await addOrDeleteFilters(Model, oldFilterOptions, 'delete');
  }
};

export const updateAllFilters = async (prevOrgFields, currOrgFields) => {
  try {
    await updateFilter(Disabilities, prevOrgFields.disabilitiesServed, currOrgFields.disabilitiesServed);
    await updateFilter(Services, prevOrgFields.servicesProvided, currOrgFields.servicesProvided);
    await updateFilter(States, prevOrgFields.statesServed, currOrgFields.statesServed);
    await updateFilter(Insurances, prevOrgFields.insurancesAccepted, currOrgFields.insurancesAccepted);
  } catch (error) {
    throw new Error(`Could not update filters: ${error}`);
  }
};

export const addFilters = async (organizationFields) => {
  try {
    await addOrDeleteFilters(Disabilities, organizationFields.disabilitiesServed, 'add');
    await addOrDeleteFilters(Services, organizationFields.servicesProvided, 'add');
    await addOrDeleteFilters(States, organizationFields.statesServed, 'add');
    // addOrDeleteFilters(TownsNewHampshire, organizationFields.townsNewHampshire, 'add');
    // addOrDeleteFilters(TownsVermont, organizationFields.townsVermont, 'add');
    await addOrDeleteFilters(Insurances, organizationFields.insurancesAccepted, 'add');
  } catch (error) {
    throw new Error(`Could not add filters: ${error}`);
  }
};

export const deleteFilters = async (organizationFields) => {
  try {
    await addOrDeleteFilters(Disabilities, organizationFields.disabilitiesServed, 'delete');
    await addOrDeleteFilters(Services, organizationFields.servicesProvided, 'delete');
    await addOrDeleteFilters(States, organizationFields.statesServed, 'delete');
    // addOrDeleteDisability(TownsNewHampshire, organizationFields.townsNewHampshire, 'delete');
    // addOrDeleteDisability(TownsVermont, organizationFields.townsVermont, 'delete');
    await addOrDeleteFilters(Insurances, organizationFields.insurancesAccepted, 'delete');
  } catch (error) {
    throw new Error(`Could not delete filters: ${error}`);
  }
};

export const getAllDisabilityFilters = async () => {
  try {
    const allDisabilities = await Disabilities.find({});
    return allDisabilities;
  } catch (error) {
    throw new Error(`get all disability filters error: ${error}`);
  }
};

export const getAllServiceFilters = async () => {
  try {
    const allServices = await Services.find({});
    return allServices;
  } catch (error) {
    throw new Error(`get all services filters error: ${error}`);
  }
};

export const getAllStateFilters = async () => {
  try {
    const allStates = await States.find({});
    return allStates;
  } catch (error) {
    throw new Error(`get all state filters error: ${error}`);
  }
};

export const getAllInsuranceFilters = async () => {
  try {
    const allInsurance = await Insurances.find({});
    return allInsurance;
  } catch (error) {
    throw new Error(`get all insurance filters error: ${error}`);
  }
};
