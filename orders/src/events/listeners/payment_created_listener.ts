import { Message } from 'node-nats-streaming'
import { Listener, PaymentCreatedEvent, Subjects, OrderStatus } from '@ac-tickets/common'
import {queueGroupName} from './queue_group_name'
import { Order } from '../../models/order'


export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated
  readonly queueGroupName = queueGroupName

  // When an order is paid Orders Service
  // will receive this event and mark the order as completed
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message){
    const order = await Order.findById(data.orderId)

    if(!order){
      throw new Error('Order not found')
    }

    order.set({
      status: OrderStatus.Complete
    })
    await order.save()

    //todo: as we are modifying the order, we should create and emit an event of order:updated
    //to notify other services of the update

    msg.ack()
  }
}