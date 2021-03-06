const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB({});


// HELPERS FOR updateTable

/**
   * Puts a record in MUSIC-BACKUP
   * @param record the record to put
   * @returns {Promise}
   */
function putRecord({ dynamodb : { NewImage } }) {
  return dynamoDb.putItem({
    TableName: process.env.DYNAMODB_TABLE2, // MUSIC-BACKUP table
    Item: NewImage // new Item
  }).promise();
}

/**
   * Removes a record from MUSIC-BACKUP
   * @param record the record to remove
   * @returns {Promise}
   */
function removeRecord({ dynamodb : { Keys } }) {
  return dynamoDb.deleteItem({
    TableName: process.env.DYNAMODB_TABLE2,
    Key: Keys // item to delete
  }).promise();
}


// Functionality for updating the MUSIC-BACKUP table 
module.exports = {
  
  /**
   * Updates the MUSIC-BACKUP table using provided data
   * @param data the data from the dynamo event stream to work with
   * @returns {Promise} 
   */
  updateTable(data) {
    // for each record in data perform put or remove actions
    const actions = [];
    data.Records.forEach(record => {
      // console.log(record);
      if (record.eventName) {
        const { eventName } = record;
        if (eventName === 'MODIFY' || eventName === 'INSERT') {
          actions.push(putRecord(record)); 
        } else if (eventName === 'REMOVE') {
          // console.log(record.dynamodb.Keys);
          actions.push(removeRecord(record)); 
        } else {
          console.error('Unknown event: ', eventName);
        }
      }
    });
    return Promise.all(actions);
  }

};