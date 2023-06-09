/**
 * Module for the Reports controller.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import createError from 'http-errors'
import { Report } from '../../models/report.js'
import { Webhook } from '../../models/webhook.js'

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
  async findReport(req, res, next) {
    const rep = await req.report.populate('user')
    const repObj = rep.toObject()
    repObj._links = this.#createReportHateoasLinks(rep, req.user.id === rep.user.id, !!req.user)
    res.json(repObj)
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
      const reportsWithLinks = []
      let reports
      if (req.user) {
        reports = await Report.find().populate('user')
      } else {
        reports = await Report.find()
      }

      for (const report of reports) {
        const reportWithLinks = report.toObject()

        // If anonomous user remove user data from report
        if (!req.user) delete reportWithLinks.user

        reportWithLinks._links = this.#createReportHateoasLinks(report, report.user?.id === req.user?.id, !!req.user)
        reportsWithLinks.push(reportWithLinks)
      }

      const anonLinks = {
        reports: reportsWithLinks,
        _links: {
          self: {
            href: `${process.env.BASEURL}/reports`,
            method: 'GET'
          }
        }
      }

      const subHookLink = {
        subscribeWebhookUpdatesAllNewReports: {
          href: `${process.env.BASEURL}/reports/webhooks`,
          method: 'POST'
        }
      }

      req.user ? res.json({ ...anonLinks, ...subHookLink }) : res.json(anonLinks)
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
  async createReport(req, res, next) {
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

      const repObj = report.toObject()
      this.#triggerWebhook(req, res, next, repObj)
      repObj._links = this.#createReportHateoasLinks(report, true, !!req.user)

      res.status(201).json(repObj)
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
  async replaceReport(req, res, next) {
    try {
      const { position, locationName, city, fishSpecies, weight, length, imageUrl, dateOfCatch } = req.body
      const user = req.report.user.toHexString()

      await Report.findOneAndReplace(
        { _id: req.params.id },
        { user, position, locationName, city, fishSpecies, weight, length, imageUrl, dateOfCatch },
        {
          new: true,
          runValidators: true
        }
      )

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

      await Report.findByIdAndUpdate(req.params.id, partialReport, { new: true })

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
  async deleteReport(req, res, next) {
    try {
      await req.report.deleteOne()

      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Register new webhook subscriber.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async registerWebhook(req, res, next) {
    try {
      const webhook = new Webhook({ url: req.body.url, userId: req.user.id })
      await webhook.save()
      const withLinks = webhook.toObject()
      withLinks._link = {
        self: {
          href: `${process.env.BASEURL}/reports/webhook`,
          method: 'GET'
        },
        all: {
          href: `${process.env.BASEURL}}/reports`,
          method: 'GET'
        },
        create: {
          href: `${process.env.BASEURL}}/reports`,
          method: 'POST'
        }
      }
      res.status(201).json(withLinks)
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
   * Triggers webhook and notifies subscribers.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {Function} report - data to send to subscribers.
   */
  async #triggerWebhook(req, res, next, report) {
    try {
      const webhooks = await Webhook.find()
      webhooks.forEach((webhook) => {
        // add relevant links to data.
        report._links = this.#createReportHateoasLinks(report, report.user.id === webhook.userId, !!req.user)

        fetch(webhook.url, {
          method: 'POST',
          body: JSON.stringify(report),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns js object with hateoas links.
   *
   * @param {object} report - report object
   * @param {boolean} isOwner - true if links for owner be displayed
   * @param {boolean} isAuth - true if links for authenticated user is to be displayed
   * @returns {object} hateoas links
   */
  #createReportHateoasLinks(report, isOwner, isAuth) {
    const baseUrl = process.env.BASEURL
    const generalLinks = {
      self: {
        href: `${baseUrl}/reports/${report.id}`,
        method: 'GET'
      },
      all: {
        href: `${baseUrl}/reports`,
        method: 'GET'
      }
    }

    const authLinks = {
      create: {
        href: `${baseUrl}/reports`,
        method: 'POST'
      }
    }

    const ownerLinks = {
      update: {
        href: `${baseUrl}/reports/${report.id}`,
        method: 'PATCH'
      },
      replace: {
        href: `${baseUrl}/reports/${report.id}`,
        method: 'PUT'
      },
      delete: {
        href: `${baseUrl}/reports/${report.id}`,
        method: 'DELETE'
      }
    }

    if (isOwner) {
      return { ...generalLinks, ...authLinks, ...ownerLinks }
    } else if (isAuth) {
      return { ...generalLinks, ...authLinks }
    } else {
      return generalLinks
    }
  }
}
