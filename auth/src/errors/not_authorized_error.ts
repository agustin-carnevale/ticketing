import { CustomError } from './custom_error'

export class NotAuthorizedError extends CustomError {
  statusCode = 401

  constructor(){
    super("ERROR: Not Authorized.")

    Object.setPrototypeOf(this, NotAuthorizedError.prototype)
  }

  serializeErrors(){
    return [{ message: 'Not Authorized'}]
  }
}