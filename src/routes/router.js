/**
 * API version 1 routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { router as authRouter } from './auth-router.js'
import { router as reportsRouter } from './reports-router.js'

export const router = express.Router()

router.get('/', (req, res) =>
  res.json({ message: 'Welcome to Fishing club API' })
)
router.use('/auth', authRouter)
router.use('/reports', reportsRouter)

// router.use('/images', imagesRouter)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
