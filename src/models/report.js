/**
 * Mongoose model Report.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    position: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    locationName: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    fishSpecies: {
      type: String,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    length: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: String,
      required: false
    },
    dateOfCatch: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

const convertOptions = {
  virtuals: true,
  versionKey: false,
  /**
   * Performs a transformation of the resulting object to remove sensitive information.
   *
   * @param {object} doc - The mongoose document which is being converted.
   * @param {object} ret - The plain object representation which has been converted.
   */
  transform: (doc, ret) => {
    delete ret._id
  }
}

schema.set('timestamps', true)
schema.set('toObject', convertOptions)
schema.set('toJSON', convertOptions)

// Create a model using the schema.
export const Report = mongoose.model('Report', schema)
