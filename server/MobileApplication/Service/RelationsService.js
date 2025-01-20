const relationsModel = require("../Model/RelationRequestModel");

exports.createRequest = async (senderPhoneNumber, receiverPhoneNumber, senderUserId, receiverUserId) => {
    let result;
    try{
        const requestId = require("crypto").randomBytes(16).toString("hex");
        const timestamp = new Date().toISOString();
        const request = {
            request_id:requestId,
            senderPhoneNumber,
            receiverPhoneNumber,
            senderUserId,
            receiverUserId,
            status: "pending",
            createdAt: timestamp,
            updatedAt: timestamp,
          };
        result = await relationsModel.createRelationRequest(request);
    }
    catch(error){
        throw error;
    }
  return result;
};

exports.updateRequestStatus = async (requestId, status, timestamp) => {
  const updates = {
    status,
    updatedAt: timestamp,
  };

  return await relationsModel.updateRelationRequest(requestId, updates);
};
