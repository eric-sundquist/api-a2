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

router.get('/', (req, res) => {
  const data = {
    message: 'Welcome to Fishing club API',
    _links: {
      self: { href: `${process.env.BASEURL}`, method: 'GET' },
      auth: { href: `${process.env.BASEURL}/auth`, method: 'GET' },
      reports: { href: `${process.env.BASEURL}/reports`, method: 'GET' }
    }
  }
  res.json(data)
})
router.use('/auth', authRouter)
router.use('/reports', reportsRouter)

// router.use('/images', imagesRouter)

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
