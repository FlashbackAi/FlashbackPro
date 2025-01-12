const datasetService = require('../Service/DatasetService');
const logger = require('../../logger');


//API to savev dataset details
exports.saveDatasetDetails = async (req, res) => {
  try {
    const item = req.body;

    if (!item.dataset_name || !item.org_name) {
      return res.status(400).json({
        message: 'dataset_name and org_name are required',
      });
    }

    logger.info(`Request to save dataset details: dataset_name = ${item.dataset_name}, org_name = ${item.org_name}`);

    const response = await datasetService.saveDatasetDetails(item);

    res.status(200).json({
      message: 'Dataset details saved successfully',
      data: response,
    });
  } catch (error) {
    logger.error(`Error in saving dataset details: ${error.message}`);
    res.status(500).json({
      message: 'Error saving dataset details',
      error: error.message,
    });
  }
};

//API to get the dataset details
exports.getDatasetDetails = async (req, res) => {
    const orgName = req.params.orgName.trim();
    const datasetName = req.params.datasetName.trim();
  
    logger.info(`Fetching Dataset details for ${orgName} and ${datasetName}`);
    try {
      const datasetDetails = await datasetService.getDatasetDetails(orgName, datasetName);
  
      if (datasetDetails && datasetDetails.length > 0) {
        logger.info(`Fetched dataset details for ${orgName} and ${datasetName}`);
        res.status(200).send(datasetDetails);
      } else {
        logger.info(`No dataset details found for ${orgName} and ${datasetName}`);
        res.status(200).send({ message: 'Dataset details not found' });
      }
    } catch (error) {
      logger.error(`Error fetching dataset details: ${error.message}`);
      res.status(500).send({ message: 'Error fetching dataset details', error: error.message });
    }
  };

  //API to update the request for dataset
  exports.updateRequestStatus = async (req, res) => {
    const { model_name, model_org_name, dataset_name, dataset_org_name, status } = req.body;
  
    try {
      const updatedItem = await datasetService.updateRequestStatus(
        model_name,
        model_org_name,
        dataset_name,
        dataset_org_name,
        status
      );
  
      res.status(200).json(updatedItem);
    } catch (error) {
      logger.error(`Error in updateRequestStatus Controller: ${error.message}`);
      res.status(500).json({ message: "Failed to update request status", error: error.message });
    }
  };


  //API to get the dataset requests
  exports.getDatasetRequests = async (req, res) => {
    const { dataset } = req.params;
    try {
      const requests = await datasetService.getDatasetRequests(dataset);
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving dataset requests', error: error.message });
    }
  };
