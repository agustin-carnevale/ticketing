import express, {Request, Response} from 'express'
import { Ticket } from '../models/ticket'
import { body } from 'express-validator'
import { requiereAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@ac-tickets/common'
import { TicketUpdatedPublisher } from '../events/publishers/ticket_updated_publisher'
import { natsWrapper } from '../nats_wrapper'

const router = express.Router()

router.put('/api/tickets/:id',
  requiereAuth,
  [
    body('title')
    .not()
    .isEmpty()
    .withMessage('Title is required'),
    body('price')
    .isFloat({gt:0}) 
    .withMessage('Price must be a positive number')
  ],
  validateRequest,
  async (
    req: Request,
    res: Response
  )=>{
  const ticket = await Ticket.findById(req.params.id)

  if(!ticket){
    throw new NotFoundError()
  }

  // has to be same user that created the ticket
  if( ticket.userId !== req.currentUser!.id){
    throw new NotAuthorizedError()
  }

  //update ticket
  ticket.set({
    title: req.body.title,
    price: req.body.price
  })
  await ticket.save()

  await new TicketUpdatedPublisher(natsWrapper.client).publish({
    id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    userId: ticket.userId
  })

  res.send(ticket)
 })


 export { router as updateTicketRouter}