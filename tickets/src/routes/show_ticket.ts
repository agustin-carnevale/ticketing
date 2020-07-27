import express, {Request, Response} from 'express'
import { NotFoundError} from '@ac-tickets/common'
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
   } catch (err) {
    console.log(err)
   }
   
   if(!ticket){
      throw new NotFoundError()
   }
   res.send(ticket)
 })


 export { router as showTicketRouter}