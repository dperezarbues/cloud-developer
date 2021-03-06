import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getAllToDos } from '../../businessLogic/todoList';
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  let limit = null;
  let next = null;
  if (event.queryStringParameters) {
    limit = event.queryStringParameters.limit;
    next = event.queryStringParameters.next;
  }

  const items = await getAllToDos(getUserId(event), limit, next);

  // TODO: Get all TODO items for a current user
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(items)
  }
}
