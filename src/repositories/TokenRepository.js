/**
 * Module for TokenRepository.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import { MongooseRepositoryBase } from './MongooseRepositoryBase.js'
import { Token } from '../models/TokenModel.js'

/**
 * Encapsulates a Token repository.
 */
export class TokenRepository extends MongooseRepositoryBase {
  /**
   * Initializes a new instance.
   *
   * @param {Token} [token=Token] - A class with the same capabilities as Token.
   */
  constructor(token = Token) {
    super(token)
  }
}
