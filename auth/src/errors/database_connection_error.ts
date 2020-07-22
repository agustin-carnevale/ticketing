import { CustomError } from './custom_error'

export class DatabaseConnectionError extends CustomError {
  statusCode = 503
  reason = 'Error connecting to database.'

  constructor(){
    super("ERROR: Connecting to DB.")

    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors(){
    return [{ message: this.reason }]
  }
}