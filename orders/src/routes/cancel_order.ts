import express, {Request, Response} from 'express'
import { requiereAuth, NotFoundError, NotAuthorizedError } from '@ac-tickets/common'
import { Order, OrderStatus } from '../models/order'
import { natsWrapper } from '../nats_wrapper'
import { OrderCancelledPublisher } from '../events/publishers/order_cancelled_publisher'

const router = express.Router()

router.patch('/api/orders/:orderId', 
requiereAuth,
async (
  req: Request,
  res: Response
)=>{
  const order = await Order.findById(req.params.orderId).populate('ticket')

  if(!order){
    throw new NotFoundError()
  }

  if(order.userId !== req.currentUser!.id){
    throw new NotAuthorizedError()
  }

  order.status = OrderStatus.Cancelled
  await order.save()

  // publish an event saying this order was Cancelled
  new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    ticket:{
      id: order.ticket.id
    }
  })

  res.send(order)
})

export { router as cancelOrderRouter}