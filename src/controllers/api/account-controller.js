/**
 * Module for the AccountController.
 *
 * @author Eric Sundqvist
 * @author Mats Loock
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
export class AccountController {
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

      // Create the access token.
      const accessToken = this.generateAccessToken(user)

      // Create refresh token.
      const token = new Token({
        userId: user.userId,
        valid: true
      })
      await token.save()

      const refreshTokenPayload = {
        sub: token.id,
        user: user.userId
      }
      const refreshToken = jwt.sign(
        refreshTokenPayload,
        process.env.REFRESH_TOKEN_SECRET,
        {
          algorithm: 'HS256',
          expiresIn: process.env.REFRESH_TOKEN_LIFE
        }
      )

      res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken
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
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userId: uuidv4()
      })

      await user.save()
      res.status(201).send()
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
   * Refresh access token.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async refresh(req, res, next) {
    try {
      if (!req.headers.authorization)
        throw new Error('No authorization header.')

      const [authenticationScheme, token] = req.headers.authorization.split(' ')

      if (authenticationScheme !== 'Bearer')
        throw new Error('Invalid authentication scheme.')

      const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
      await Token.validateToken(payload.sub)
      // Get tokens user
      const user = await User.findOne({ userId: payload.user })
      // Generate new accesstoken
      const accessToken = this.generateAccessToken(user)

      res.status(200).json({
        access_token: accessToken,
        refresh_token: token
      })
    } catch (error) {
      let err
      if (
        error.message === 'Token has been disabled.' ||
        error.message === 'Invalid authentication scheme.' ||
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError' ||
        error.message === 'No authorization header.'
      ) {
        err = createError(401, 'Refresh token invalid or not provided.')
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
      sub: user.userId,
      preferred_username: user.username,
      given_name: user.firstName,
      family_name: user.lastName,
      email: user.email
    }
    return jwt.sign(payload, key, {
      algorithm: 'RS256',
      expiresIn: process.env.ACCESS_TOKEN_LIFE
    })
  }
}
