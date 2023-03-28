/**
 * Module for CatchRepository.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { Catch } from '../models/CatchModel.js'

/**
 * Encapsulates a Catch repository.
 */
export class CatchRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {Catch} [c=Catch] - A class with the same capabilities as CatchModel.
   */
  constructor(c = Catch) {
    super(c)
  }
}
