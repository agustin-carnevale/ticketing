import express, {Request, Response} from 'express'
import { requiereAuth, validateRequest, NotFoundError} from '@ac-tickets/common'
import {body} from 'express-validator'
import { Ticket } from '../models/ticket'

const router = express.Router()

router.get('/api/tickets/:id',
 async (
   req: Request,
   res: Response
 )=>{
   let ticket;
   try {
      ticket = await Ticket.findById(req.params.id)
   } catch (error) {
      throw new NotFoundError()
   }
   if(!ticket){
      throw new NotFoundError()
   }
  res.send(ticket)
 })


 export { router as showTicketRouter}