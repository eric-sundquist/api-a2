/**
 * Module for bootstrapping.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import { IoCContainer } from '../util/IoCContainer.js'
import { TaskModel } from '../models/TaskModel.js'
import { TaskRepository } from '../repositories/TaskRepository.js'
import { TasksService } from '../services/TasksService.js'
import { TasksController } from '../controllers/TasksController.js'

const iocContainer = new IoCContainer()

iocContainer.register('ConnectionString', process.env.DB_CONNECTION_STRING)

iocContainer.register('TaskModelType', TaskModel, { type: true })

iocContainer.register('TaskRepositorySingleton', TaskRepository, {
  dependencies: [
    'TaskModelType'
  ],
  singleton: true
})

iocContainer.register('TasksServiceSingleton', TasksService, {
  dependencies: [
    'TaskRepositorySingleton'
  ],
  singleton: true
})

iocContainer.register('TasksController', TasksController, {
  dependencies: [
    'TasksServiceSingleton'
  ]
})

export const container = Object.freeze(iocContainer)
