import { Message } from 'node-nats-streaming'
import { Listener, ExpirationCompleteEvent, Subjects } from '@ac-tickets/common'
import {queueGroupName} from './queue_group_name'
import {Order, OrderStatus} from '../../models/order'
import { OrderCancelledPublisher } from '../publishers/order_cancelled_publisher'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete
  readonly queueGroupName = queueGroupName

  // When a ticket is created by the Tickets Service, Orders service
  // will receive this event and save a copy to the Orders DB to keep record of all valid tickets
  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message){
    const order = await Order.findById(data.orderId).populate('ticket')

    if(!order){
      throw new Error('Order not found')
    }

    // if the order is already paid / completed then nothing to do
    if (order.status === OrderStatus.Complete){
      return msg.ack()
    }

    // else we mark the order as cancelled (because of expiration)
    order.set({
      status: OrderStatus.Cancelled
    })
    await order.save()

    // and emit an order:cancelled event
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    })

    msg.ack()
  }
}