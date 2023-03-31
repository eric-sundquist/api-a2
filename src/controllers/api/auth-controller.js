/**
 * Module for the AuthController.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { User } from '../../models/user.js'
import { Token } from '../../models/token.js'
import { v4 as uuidv4 } from 'uuid'

const key = Buffer.from(process.env.ACCESS_TOKEN_PRIVATE_KEY_64, 'base64')

/**
 * Encapsulates a controller.
 */
export class AuthController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login(req, res, next) {
    try {
      const user = await User.authenticate(req.body.username, req.body.password)
      console.log(user)
      // Create the access token.
      const accessToken = this.generateAccessToken(user)

      res.status(200).json({
        access_token: accessToken,
        _links: {
          self: { href: `${process.env.BASEURL}/auth/login`, method: 'POST' },
          reports: { href: `${process.env.BASEURL}/reports/`, method: 'GET' }
        }
      })
    } catch (error) {
      let err

      if (error.message === 'Invalid credentials.') {
        err = createError(401, 'Credentials invalid or not provided.')
        err.cause = error
      } else {
        err = createError(500, 'An unexpected condition was encountered.')
        err.cause = error
      }
      next(err)
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register(req, res, next) {
    try {
      const user = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        userId: uuidv4()
      })

      await user.save()
      res.status(201).json({
        _links: {
          self: { href: `${process.env.BASEURL}/auth/register`, method: 'POST' },
          login: { href: `${process.env.BASEURL}/login/`, method: 'POST' }
        }
      })
    } catch (error) {
      let err = error

      if (err.code === 11000) {
        // Duplicated keys.
        err = createError(409)
        err.cause = error
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(
          400,
          'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error)'
        )
        err.cause = error
      } else {
        err = createError(500, 'An unexpected condition was encountered.')
        err.cause = error
      }
      next(err)
    }
  }

  /**
   * Generate a new acess token.
   *
   * @param {object} user - User object.
   * @returns {string} JWT base64 string.
   */
  generateAccessToken(user) {
    const payload = {
      sub: user.id,
      preferred_username: user.username,
      given_name: user.firstName,
      family_name: user.lastName
    }
    return jwt.sign(payload, key, {
      algorithm: 'RS256',
      expiresIn: process.env.ACCESS_TOKEN_LIFE
    })
  }
}
