import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWSXRay from 'aws-xray-sdk'

import { getToDo, updateToDoItem } from '../../businessLogic/todoList';
import { getUserId } from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)

  const todoItem = await getToDo(todoId, userId)

  if (!todoItem) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'ToDo Item does not exist'
      })
    }
  }

  const imageId = uuid.v4()

  const updateTodoRequest: UpdateTodoRequest = {
    name: todoItem.name,
    dueDate: todoItem.dueDate,
    done: todoItem.done,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  }

  await updateToDoItem (updateTodoRequest,todoId,userId)

  const url = getUploadUrl(imageId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}
