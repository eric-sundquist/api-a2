/**
 * API version 1 routes.
 *
 * @author Eric Sundqvist
 * @author Mats Loock
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { ImagesController } from '../controllers/api/images-controller.js'

export const router = express.Router()

const publicKey = Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY_64, 'base64')

const controller = new ImagesController()

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

/**
 * Authenticates requests.
 *
 * If authentication is successful, `req.user`is populated and the
 * request is authorized to continue.
 * If authentication fails, an unauthorized response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    const payload = jwt.verify(token, publicKey)
    req.user = {
      username: payload.preferred_username,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      userId: payload.sub
    }
    next()
  } catch (err) {
    let error
    if (err.name === 'TokenExpiredError') {
      error = createError(401, 'Token expired.')
    } else {
      error = createError(401, 'Access token invalid or not provided.')
    }
    error.cause = err
    next(error)
  }
}

/**
 * Verifies that the user trying to reach a resource is the owner.
 *
 * If authentication fails, an 403 - forbidden response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authOwner = (req, res, next) => {
  if (req.user.userId !== req.image.ownerUserId) {
    const error = createError(403, 'The request contained valid data and was understood by the server, but the server is refusing action due to the authenticated user not having the necessary permissions for the resource.')
    next(error)
    return
  }
  next()
}

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// Provide req.image to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadImageData(req, res, next, id))

// GET images
router.get('/',
  authenticateJWT,
  (req, res, next) => controller.findAll(req, res, next)
)

// GET images/:id
router.get('/:id',
  authenticateJWT,
  authOwner,
  (req, res, next) => controller.find(req, res, next)
)

// POST images
router.post('/',
  authenticateJWT,
  (req, res, next) => controller.create(req, res, next)
)

// PUT images/:id
router.put('/:id',
  authenticateJWT,
  authOwner,
  (req, res, next) => controller.updatePut(req, res, next)
)

// PATCH images/:id
router.patch('/:id',
  authenticateJWT,
  authOwner,
  (req, res, next) => controller.updatePatch(req, res, next)
)

// DELETE images/:id
router.delete('/:id',
  authenticateJWT,
  authOwner,
  (req, res, next) => controller.delete(req, res, next)
)
