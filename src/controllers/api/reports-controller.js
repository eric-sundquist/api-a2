/**
 * Module for the Reports controller.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import createError from 'http-errors'
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
      const populReports = []
      for (const report of reports) {
        populReports.push(report.populate('user'))
      }
      const resolvedReports = await Promise.all(populReports)
      res.json(resolvedReports.map((report) => this.getCleanFormattedReportObject(report)))
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
      const report = new Report({
        user: req.user.id,
        position: {
          latitude: req.body.position.latitude,
          longitude: req.body.position.longitude
        },
        locationName: req.body.locationName,
        city: req.body.city,
        fishSpecies: req.body.fishSpecies,
        weight: req.body.weight,
        length: req.body.length,
        imageUrl: req.body.imageUrl,
        dateOfCatch: req.body.dateOfCatch
      })
      await report.save()
      await report.populate('user')

      res.status(201).json(this.getCleanFormattedReportObject(report))
    } catch (error) {
      const err = createError(
        error.name === 'ValidationError'
          ? 400 // bad format
          : 500 // something went really wrong
      )
      err.cause = error

      next(err)
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
      const err = createError(
        error.name === 'ValidationError'
          ? 400 // bad format
          : 500 // something went really wrong
      )
      err.cause = error
      next(err)
    }
  }

  /**
   * Partially updates a specific report.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async updateReport(req, res, next) {
    try {
      const partialReport = {}
      if ('position' in req.body) partialReport.position = req.body.position
      if ('locationName' in req.body) partialReport.locationName = req.body.locationName
      if ('city' in req.body) partialReport.city = req.body.city
      if ('fishSpecies' in req.body) partialReport.fishSpecies = req.body.fishSpecies
      if ('weight' in req.body) partialReport.weight = req.body.weight
      if ('length' in req.body) partialReport.length = req.body.length
      if ('imageUrl' in req.body) partialReport.imageUrl = req.body.imageUrl
      if ('dateOfCatch' in req.body) partialReport.dateOfCatch = req.body.dateOfCatch

      const newRep = await Report.findByIdAndUpdate(req.params.id, partialReport, { new: true })
      res.status(204).end()
    } catch (error) {
      const err = createError(
        error.name === 'ValidationError'
          ? 400 // bad format
          : 500 // something went really wrong
      )
      err.cause = error

      next(err)
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
      await req.report.deleteOne()

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  getCleanFormattedReportObject(report) {
    const {
      user: { username, firstName, lastName },
      position,
      locationName,
      city,
      fishSpecies,
      weight,
      length,
      imageUrl,
      dateOfCatch,
      id
    } = report

    return {
      username,
      firstName,
      lastName,
      position,
      locationName,
      city,
      fishSpecies,
      weight,
      length,
      imageUrl,
      dateOfCatch,
      id
    }
  }
}
