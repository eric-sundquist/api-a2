/**
 * API version 1 routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { router as accountRouter } from './account-router.js'
// import { router as imagesRouter } from './images-router.js'

export const router = express.Router()

router.get('/', (req, res) =>
  res.json({ message: 'Welcome to Fishing club API' })
)
router.use('/account', accountRouter)
// router.use('/images', imagesRouter)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
