/**
 * Module for TaskRepository.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { TaskModel } from '../models/TaskModel.js'

/**
 * Encapsulates a task repository.
 */
export class TaskRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {TaskModel} [model=TaskModel] - A class with the same capabilities as TaskModel.
   */
  constructor (model = TaskModel) {
    super(model)
  }
}
