/**
 * Module for the Reports controller.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import createError from 'http-errors'
import fetch from 'node-fetch'
import { Report } from '../../models/report.js'

/**
 * Encapsulates a controller.
 */
export class ReportsController {
  /**
   * Provide req.report to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the report data to load.
   */
  async getReport(req, res, next, id) {
    try {
      // Get the report.
      const report = await Report.findById(id)

      // If no report found send a 404 (Not Found).
      if (!report) {
        next(createError(404, 'The requested resource was not found.'))
        return
      }

      // Provide the report to req.
      req.report = report

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a report.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find(req, res, next) {
    res.json(req.report)
  }

  /**
   * Sends a JSON response containing all reports.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll(req, res, next) {
    try {
      const reports = await Report.find()
      res.json(reports)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new report.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create(req, res, next) {
    try {
      console.log(req.body)
      console.log(req.user)
      if (!req.body.report) {
        next(
          createError(
            400,
            'The request cannot or will not be processed due to something that is perceived to be a client error (for example, validation error).'
          )
        )
        return
      }

      const report = new Report({
        user: req.user._id,
        position: {
          latitude: req.body.report.latitude,
          longitude: req.body.report.longitude
        },
        locationName: req.body.report.locationName,
        city: req.body.report.city,
        fishSpecies: req.body.report.fishSpecies,
        weight: req.body.report.weight,
        length: req.body.report.length,
        imageUrl: req.body.report.imageUrl,
        dateOfCatch: req.body.report.dateOfCatch
      })
      await image.save()
      res.status(201).json(image)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a everything in a specific image called with PUT http method.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updatePut(req, res, next) {
    try {
      if (!this.isAllowedContentType(req, res, next)) return
      if (!req.body.data) {
        next(
          createError(
            400,
            'The request cannot or will not be processed due to something that is perceived to be a client error (for example, validation error).'
          )
        )
        return
      }

      const body = {
        data: req.body.data,
        contentType: req.body.contentType
      }

      await this.fetchPictureApi('PUT', `images/${req.params.id}`, body)

      req.image.description = req.body.description
      req.image.location = req.body.location

      await req.image.save()

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates some of a specific image resource called with PATCH http method.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updatePatch(req, res, next) {
    try {
      for (const property of Object.keys(req.body)) {
        if (property === 'description' || property === 'location') {
          req.image[property] = req.body[property]
        } else if (property === 'data') {
          await this.fetchPictureApi('PATCH', `images/${req.params.id}`, {
            data: req.body.data
          })
        } else if (property === 'contentType') {
          this.isAllowedContentType(req, res, next)
          await this.fetchPictureApi('PATCH', `images/${req.params.id}`, {
            contentType: req.body.contentType
          })
        }
      }

      await req.image.save()

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes the specified image.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete(req, res, next) {
    try {
      await this.fetchPictureApi('DELETE', `images/${req.params.id}`)
      await req.image.deleteOne()

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Send http request to Picture it api.
   *
   * @param {string} method  - which http method to use.
   * @param {string} route - set url route.
   * @param {object} body - body to send as json.
   */
  async fetchPictureApi(method, route, body) {
    const response = await fetch(
      `https://courselab.lnu.se/picture-it/images/api/v1/${route}`,
      {
        method: method,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PICTURE_IT_ACCESS_TOKEN
        }
      }
    )
    if (!response.ok) {
      throw new Error(
        `${response.status} - ${response.statusText} - Fetch from Picture-It API failed`
      )
    }

    return response
  }
}
