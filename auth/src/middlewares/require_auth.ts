import { Request, Response, NextFunction } from 'express'
import { NotAuthorizedError } from '../errors/not_authorized_error'

export const requiereAuth = (
  req: Request,
  res: Response,
  next: NextFunction
)=>{
  if (!req.currentUser){
    throw new NotAuthorizedError()
  }
  next()
}