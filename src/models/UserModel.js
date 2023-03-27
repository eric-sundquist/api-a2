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
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    firstName: {
      type: String,
      required: true,
      minlength: 2
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    catches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catch'
      }
    ]
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
export const TaskModel = mongoose.model('User', schema)
