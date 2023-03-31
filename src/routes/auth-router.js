/**
 * API version 1 routes.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import express from 'express'
import createError from 'http-errors'
import { AuthController } from '../controllers/api/auth-controller.js'

export const router = express.Router()

const controller = new AuthController()

router.get('/', (req, res) => {
  const data = {
    message: 'Endpoint for authentication',
    _links: {
      self: { href: `${process.env.BASEURL}/auth`, method: 'GET' },
      login: { href: `${process.env.BASEURL}/auth/login`, method: 'POST' },
      register: { href: `${process.env.BASEURL}/auth/register`, method: 'POST' }
    }
  }
  res.json(data)
})

// Log in
router.post('/login', (req, res, next) => controller.login(req, res, next))

// Register
router.post('/register', (req, res, next) => controller.register(req, res, next))

// Catch 404.
router.use('*', (req, res, next) => next(createError(404)))
