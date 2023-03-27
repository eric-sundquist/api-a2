/**
 * API version 1 routes.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import express from 'express'

export const router = express.Router()

/**
 * Resolves a TasksController object from the IoC container.
 *
 * @param {object} req - Express request object.
 * @returns {object} An object that can act as a TasksController object.
 */
const resolveTasksController = (req) => req.app.get('container').resolve('TasksController')

// Provide req.task to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => resolveTasksController(req).loadTask(req, res, next, id))

// GET tasks
router.get('/', (req, res, next) => resolveTasksController(req).findAll(req, res, next))

// GET tasks/:id
router.get('/:id', (req, res, next) => resolveTasksController(req).find(req, res, next))

// POST tasks
router.post('/', (req, res, next) => resolveTasksController(req).create(req, res, next))

// PATCH tasks/:id
router.patch('/:id', (req, res, next) => resolveTasksController(req).partiallyUpdate(req, res, next))

// PUT tasks/:id
router.put('/:id', (req, res, next) => resolveTasksController(req).update(req, res, next))

// DELETE tasks/:id
router.delete('/:id', (req, res, next) => resolveTasksController(req).delete(req, res, next))
