/**
 * Mongoose model User.
 *
 * @author Eric Sundqvist
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// Create a schema.
const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      // - A valid username should start with an alphabet so, [A-Za-z].
      // - All other characters can be alphabets, numbers or an underscore so, [A-Za-z0-9_-].
      // - Since length constraint is 3-256 and we had already fixed the first character, so we give {2, 255}.
      // - We use ^ and $ to specify the beginning and end of matching.
      match: [
        /^[A-Za-z][A-Za-z0-9_-]{2,255}$/,
        'Please provide a valid username.'
      ]
    },
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      minLength: [1, 'The first name must be of minimum length 1 characters.'],
      maxLength: [
        256,
        'The first name must be of maximum length 256 characters.'
      ],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      minLength: [1, 'The last name must be of minimum length 1 characters.'],
      maxLength: [
        256,
        'The last name must be of maximum length 256 characters.'
      ],
      trim: true
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

/**
 * Authenticates a user.
 *
 * @param {string} username - ...
 * @param {string} password - ...
 * @returns {Promise<User>} ...
 */
schema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  // If no user found or password is wrong, throw an error.
  if (!user || !(await bcrypt.compare(password, user?.password))) {
    throw new Error('Invalid credentials.')
  }

  // User found and password correct, return the user.
  return user
}

// Create a model using the schema.
export const TaskModel = mongoose.model('User', schema)
