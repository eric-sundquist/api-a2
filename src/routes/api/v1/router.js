/**
 * API version 1 routes.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import express from 'express'
import { router as tasksRouter } from './tasksRouter.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!' }))
router.use('/tasks', tasksRouter)