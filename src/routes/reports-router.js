/**
 * Reports router
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { ReportsController } from '../controllers/api/reports-controller.js'

export const router = express.Router()

const publicKey = Buffer.from(process.env.ACCESS_TOKEN_PUBLIC_KEY_64, 'base64')

const controller = new ReportsController()

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
    checkAuthHeaderAndPopulateReqUser(req, res, next)
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
 * If authentication is successful, `req.user`is else does nothing.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const populateReqUserIfAuthElseNothing = (req, res, next) => {
  try {
    checkAuthHeaderAndPopulateReqUser(req, res, next)
    next()
  } catch (err) {
    // If not successfully authenticated, req.user is not provided.
    next()
  }
}

/**
 * Authenticate user and populate `req.user`.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const checkAuthHeaderAndPopulateReqUser = (req, res, next) => {
  const [authenticationScheme, token] = req.headers.authorization?.split(' ')

  if (authenticationScheme !== 'Bearer') {
    throw new Error('Invalid authentication scheme.')
  }

  const payload = jwt.verify(token, publicKey)
  req.user = {
    username: payload.preferred_username,
    firstName: payload.given_name,
    lastName: payload.family_name,
    id: payload.sub
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
  console.log(req.report)
  if (req.user.id !== req.report.user.toHexString()) {
    const error = createError(
      403,
      'The request contained valid data and was understood by the server, but the server is refusing action due to the authenticated user not having the necessary permissions for the resource.'
    )
    next(error)
    return
  }
  next()
}

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// Provide req.image to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.getReport(req, res, next, id))

// GET reports
router.get('/', populateReqUserIfAuthElseNothing, (req, res, next) => controller.findAll(req, res, next))

// POST register webhook to subscribe to new reports
router.post('/webhook', authenticateJWT, (req, res, next) => controller.registerWebhook(req, res, next))

// GET reports/:id
router.get('/:id', authenticateJWT, (req, res, next) => controller.findReport(req, res, next))

// POST reports
router.post('/', authenticateJWT, (req, res, next) => controller.createReport(req, res, next))

// PUT reports/:id
router.put('/:id', authenticateJWT, authOwner, (req, res, next) => controller.replaceReport(req, res, next))

// PATCH reports/:id
router.patch('/:id', authenticateJWT, authOwner, (req, res, next) => controller.updateReport(req, res, next))

// DELETE reports/:id
router.delete('/:id', authenticateJWT, authOwner, (req, res, next) => controller.deleteReport(req, res, next))
