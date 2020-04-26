import * as uuid from 'uuid'

import { ToDoListAccess } from '../dataLayer/todoListAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { TodoItemList } from '../models/TodoItemList'

const toDoListAccess = new ToDoListAccess()
const logger = createLogger('todoList')

export async function getAllToDos(userId, limit, next): Promise<TodoItemList> {
  logger.info(`User ${userId} requested listing items: limit: ${limit}, next: ${next}`);
  return await toDoListAccess.getAllToDos(userId, limit, next);
}

export async function getToDo(todoId, userId): Promise<TodoItem> {
  logger.info(`User ${userId} requested getting item: ${todoId}`);
  return await toDoListAccess.getToDo(todoId, userId);
}

export async function createToDoItem(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info(`User ${userId} requested create item: ${createTodoRequest}`);
  
  const todoItem: TodoItem = {
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    attachmentUrl: createTodoRequest.attachmentUrl,
    done: createTodoRequest.done || false
  }

  return await toDoListAccess.createToDo(todoItem);
}

export async function updateToDoItem(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<void> {
  logger.info(`User ${userId} requested update item ${todoId}: ${updateTodoRequest}`);

  const todoUpdate: TodoUpdate = {
    userId: userId,
    todoId: todoId,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done,
    attachmentUrl: updateTodoRequest.attachmentUrl
  }

  return await toDoListAccess.updateToDo(todoUpdate);
}

export async function deleteToDoItem(
  todoId: string,
  userId: string
): Promise<void> {
  logger.info(`User ${userId} requested deletion of item ${todoId}`);

  return await toDoListAccess.deleteToDo(todoId, userId);
}
