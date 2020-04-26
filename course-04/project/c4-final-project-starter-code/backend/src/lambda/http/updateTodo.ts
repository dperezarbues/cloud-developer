import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { updateToDoItem, getToDo } from '../../businessLogic/todoList';
import { getUserId } from '../utils'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const todoItem = await getToDo(todoId, getUserId(event))

  if (!todoItem) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'ToDo Item does not exist'
      })
    }
  }

  await updateToDoItem(updatedTodo,todoId,getUserId(event))

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
