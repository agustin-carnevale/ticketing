import { CustomError } from './custom_error'
import { ValidationError } from 'express-validator'

export class RequestValidationError extends CustomError {
  statusCode = 400

  constructor(public errors: ValidationError[]){
    super("ERROR: Invalid request parameters.")

    // only because were are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }

  serializeErrors(){
    return this.errors.map(error => ({ message: error.msg, field: error.param}))
  }
}