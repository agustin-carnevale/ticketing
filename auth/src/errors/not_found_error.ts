import { CustomError } from './custom_error'

export class NotFoundError extends CustomError {
  statusCode = 404

  constructor(){
    super("ERROR: Route not found.")

    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  serializeErrors(){
    return [{ message: 'Not Found'}]
  }
}