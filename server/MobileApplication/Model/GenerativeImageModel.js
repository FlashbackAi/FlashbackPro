const { getConfig } = require('../../config');
const docClient = getConfig().docClient;
const TABLE_NAME = "image_generations";  // Update with your actual table name

class RequestModel {
    /**
     * Create a new request entry in DynamoDB.
     */
    static async createRequest(request_id, user_phone_number, prompt, input_images) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                generation_id :request_id,          
                user_phone_number,   
                prompt,
                input_images,
                generation_status: "processing",
                created_at: new Date().toISOString(),
            }
        };
        await docClient.put(params).promise();
        return params.Item;
    }

    /**
     * Update request entry with prompt ID and generated image URLs.
     */
    static async updateRequest(generation_id, prompt_id, generated_images) {
        const params = {
            TableName: TABLE_NAME,
            Key: { generation_id },  // ✅ Changed from requestId → request_id
            UpdateExpression: "set prompt_id = :prompt_id, generated_images = :generated_images, generation_status = :generation_status",
            ExpressionAttributeValues: {
                ":prompt_id": prompt_id,
                ":generated_images": generated_images,
                ":generation_status": "completed"
            },
            ReturnValues: "UPDATED_NEW"
        };
        return await docClient.update(params).promise();
    }

    static async queryByPhoneNumber(phoneNumber) {
      try {
          const params = {
              TableName: TABLE_NAME,
              IndexName: 'user_phone_number-index',
              KeyConditionExpression: 'user_phone_number = :phoneNumber',
              ExpressionAttributeValues: {
                  ':phoneNumber': phoneNumber
              }
          };
          
          const result = await docClient.query(params).promise();
          
          return result.Items || [];
      } catch (error) {
          throw error;
      }
  }
}
  

module.exports = RequestModel;
