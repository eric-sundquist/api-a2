/**
 * Mongoose model User.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const schema = new mongoose.Schema(
  {
    userId: {
      type: String
    },
    valid: {
      type: Boolean
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

/**
 * Validate a token.
 *
 * @param {string} id - token Id.
 */
schema.statics.validateToken = async function (id) {
  const token = await this.findById(id)

  if (!token || !token.valid) {
    throw new Error('Token has been disabled.')
  }
}

// Create a model using the schema.
export const TaskModel = mongoose.model('Token', schema)
