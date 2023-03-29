/**
 * API version 1 routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { AccountController } from '../controllers/api/account-controller.js'

export const router = express.Router()

const controller = new AccountController()

router.get('/', (req, res) => res.json({ message: 'TODO: WHAT HERE???' }))

// Log in
router.post('/login', (req, res, next) => controller.login(req, res, next))

// Register
router.post('/register', (req, res, next) =>
  controller.register(req, res, next)
)

router.post('/refresh', (req, res, next) => controller.refresh(req, res, next))

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
