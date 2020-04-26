import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoItemList } from '../models/TodoItemList'
import { createLogger } from '../utils/logger'

const logger = createLogger('DataLayer')

export class ToDoListAccess {

  constructor(
    private readonly dynamoDBClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.INDEX_NAME) {
  }

  async getAllToDos(userId: string, limit, next): Promise<TodoItemList> {
    logger.info(`Getting all Items for userId: ${userId}`)

    const result = await this.dynamoDBClient
    .query({
      TableName: this.todosTable,
      IndexName: this.todosIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: JSON.parse(decodeURIComponent(next))
    })
    .promise()

    const items = result.Items as TodoItem[];
    const itemsList: TodoItemList = {
      items: items,
      next: encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
    }
    logger.info(`Found the following info for userId ${userId}: ${JSON.stringify(items)}`)
    return itemsList;
  }

  async getToDo(todoId: String, userId: string): Promise<TodoItem> {
    logger.info(`Getting item ${todoId} for userId: ${userId}`)

    const result = await this.dynamoDBClient
    .query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId AND todoId = :todoId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      }
    })
    .promise()

    const items = result.Items;
    logger.info(`Found the following info for userId ${userId}: ${JSON.stringify(items)}`)
    
    return items[0] as TodoItem;
  }

  async createToDo(toDoItem: TodoItem): Promise<TodoItem> {
    logger.info(`Storing the following info: ${JSON.stringify(toDoItem)}`)
    const result = await this.dynamoDBClient.put({
      TableName: this.todosTable,
      Item: toDoItem
    }).promise()

    logger.info(`Stored information result: ${JSON.stringify(result.$response.data)}`)
    return toDoItem
  }

  async updateToDo(toDoUpdate: TodoUpdate): Promise<void> {
    logger.info(`Updating with the following info: ${JSON.stringify(toDoUpdate)}`)
    const result = await this.dynamoDBClient.update({
      TableName: this.todosTable,
      Key:{
        userId: toDoUpdate.userId,
        todoId: toDoUpdate.todoId
      },
      UpdateExpression: "set #n = :name, dueDate=:dueDate, done=:done, attachment=:attachment",
      ExpressionAttributeValues:{
          ":name": toDoUpdate.name,
          ":dueDate": toDoUpdate.dueDate,
          ":done": toDoUpdate.done,
          ":attachment": toDoUpdate.attachment
      },
      ExpressionAttributeNames: {
        "#n":"name"
      }
    }).promise() 
    logger.info(`Updated information result: ${JSON.stringify(result.$response.data)}`)
  }

  async deleteToDo(todoId: String, userId: String): Promise<void> {
    logger.info(`Deleting with the following info: userId: ${userId}, todoId: ${todoId}`)
    const result = await this.dynamoDBClient.delete({
      TableName: this.todosTable,
      Key:{
        userId: userId,
        todoId: todoId
      },
    }).promise() 
    logger.info(`Deleted information result: ${JSON.stringify(result)}`);
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
