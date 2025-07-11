function ApplicationException(error, message)
{
  this.error = error;
  this.message = message;
}

export default {
  BAD_REQUEST: {message: 'BAD_REQUEST', code: 400},
  UNAUTHORIZED: {message: 'UNAUTHORIZED', code: 401},
  FORBIDDEN: {message: 'FORBIDDEN', code: 403},
  NOT_FOUND: {message: 'NOT_FOUND', code: 404},
  METHOD_NOT_ALLOWED: {message: 'METHOD_NOT_ALLOWED', code: 405},
  VALIDATION_FAILURE: {message: 'VALIDATION_FAILURE', code: 406},
  CONFLICT: {message: 'CONFLICT', code: 409},
  PRECONDITION_FAILED: {message: 'PRECONDITION_FAILED', code: 412},
  is: function (error, errorCode)
  {
    return error instanceof ApplicationException && (null == errorCode || error.error === errorCode);
  },
  new: function (code, message)
  {
    return new ApplicationException(code, message);
  },
  errorHandler: function (error, response)
  {
    if (error instanceof  ApplicationException) {
      response.status(error.error.code).send(error.message || error.error.message);
    } else {
      console.error(error && error.stack || error);
      response.sendStatus(500);
    }
  }
};