/**
 * Module for UserRepository.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { User } from '../models/UserModel.js'

/**
 * Encapsulates a User repository.
 */
export class UserRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {User} [user=User] - A class with the same capabilities as User.
   */
  constructor(user = User) {
    super(user)
  }
}
