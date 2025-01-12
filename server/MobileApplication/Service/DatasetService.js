const datasetModel = require('../Model/DatasetModel');
const datasetRequestModel = require('../Model/DatasetRequestModel')
const logger = require('../../logger');

exports.saveDatasetDetails = async (item) => {
  try {
   
    logger.info(`Saving dataset details in service layer: dataset_name = ${item.dataset_name}, org_name = ${item.org_name}`);
    return await datasetModel.saveDataset(item);
  } catch (error) {
    logger.error(`Error in datasetService.saveDatasetDetails: ${error.message}`);
    throw error;
  }
};

exports.getDatasetDetails = async (orgName, datasetName) => {
    try {
      const datasetDetails = await datasetModel.getDatasetDetails(orgName, datasetName);
      return datasetDetails;
    } catch (error) {
      logger.error(`Error in DatasetService: ${error.message}`);
      throw error;
    }
  };

  exports.updateRequestStatus = async (model_name, model_org_name, dataset_name, dataset_org_name, status) => {
    try {
      const updatedItem = await datasetRequestModel.updateRequestStatusInDB(
        model_name,
        model_org_name,
        dataset_name,
        dataset_org_name,
        status
      );
  
      return updatedItem;
    } catch (error) {
      logger.error(`Error in RequestStatusService: ${error.message}`);
      throw error;
    }
  };
  exports.getDatasetRequests = async (dataset) => {
    try {
      return await datasetRequestModel.getRequestsByDataset(dataset);
    } catch (error) {
      throw new Error(`Failed to fetch dataset requests: ${error.message}`);
    }
  };