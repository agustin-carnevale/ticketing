import {Request, Response, NextFunction} from 'express'
import {CustomError} from '../errors/custom_error';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) =>{
  
  //Custom Errors
  if (err instanceof CustomError){
   return res.status(err.statusCode).send({errors: err.serializeErrors()})
  }

  //Generic Error
  res.status(400).send({
    errors: [{ message: 'Something went wrong' }]
  })
}