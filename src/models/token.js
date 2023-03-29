/**
 * Mongoose model token.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import mongoose from 'mongoose'

// Create a schema.
const schema = new mongoose.Schema({
  userId: {
    type: String
  },
  valid: {
    type: Boolean
  }
}, {
  timestamps: true,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    },
    virtuals: true // ensure virtual fields are serialized
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

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
export const Token = mongoose.model('Token', schema)
