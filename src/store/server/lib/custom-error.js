const ERROR_CODES = {
  AUTHENTICATION_ERROR: {
    message: "User not Authenticated",
    status: 401,
  },
  DEFAULT_ERROR: {
    message: "Something Went Wrong ☹ ",
    status: 400,
  },
  SERVER_ERROR: {
    message: "Internal Server Error",
    status: 500,
  },
  LOGOUT_ERROR: {
    message: "You are not Logged in",
    status: 400,
  },
  AUTHORIZATION_ERROR: {
    message: "You are not authorized to perform this action",
    status: 403,
  },
  USER_CREATION_ERROR: {
    message: "User cannot be created",
    status: 400,
  },
  PASSWORD_UPDATE_ERROR: {
    message: "Could not update password for the user",
    status: 400,
  },
}

// class CustomError {
//   name

//   message

//   status

//   constructor(info) {
//     if (!(this instanceof CustomError)) {
//       const knownError = ERROR_CODES[info.name]
//       this.name = info.name || "DEFAULT_ERROR"
//       this.message = knownError ? knownError.message : info.message
//       const infoStatus = info.status ? info.status : 400
//       this.status = knownError ? knownError.status : infoStatus
//       return new CustomError(info)
//     }
//   }
// }

// export default CustomError

/**
 * CustomError Type Definition.
 *
 * @param {Object} info error information
 *
 */
function CustomError(info) {
  if (!(this instanceof CustomError)) {
    return new CustomError(info)
  }

  const knownError = ERROR_CODES[info.name]

  this.name = info.name || "DEFAULT_ERROR"
  this.message = knownError ? knownError.message : info.message
  const infoStatus = info.status ? info.status : 400
  this.status = knownError ? knownError.status : infoStatus
}

CustomError.prototype = Object.create(Error.prototype)

CustomError.prototype.constructor = CustomError

export default CustomError

// Expose Constructor
