import express, {Request, Response} from 'express'
import {requiereAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError} from '@ac-tickets/common'
import {body} from 'express-validator'
import mongoose from 'mongoose'
import {Ticket} from '../models/ticket'
import {Order} from '../models/order'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 10 * 60

router.post('/api/orders',
requiereAuth,
[
  body('ticketId')
  .not()
  .isEmpty()
  .custom((input: string)=> mongoose.Types.ObjectId.isValid(input))
  .withMessage('A valid ticketId must be provided')
],
validateRequest,
async (
  req: Request,
  res: Response
)=>{
  const {ticketId} = req.body

  // Find the ticket the user is trying to order in the DB
  const ticket = await Ticket.findById(ticketId)

  if(!ticket){
    throw new NotFoundError()
  }

  // Make sure the ticket is not already reserved
  const isReserved = await ticket.isReserved()
  if(isReserved){
    throw new BadRequestError('Ticket is already reserved')
  }

  //Calculate an expiration date for this order
  const expiration = new Date()
  expiration.setSeconds(expiration.getSeconds()+ EXPIRATION_WINDOW_SECONDS)

  //Build the order and save it to the DB
  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  })
  await order.save()

  //Publish an event of 'order:created'


  res.status(201).send(order)
})

export { router as createOrderRouter}