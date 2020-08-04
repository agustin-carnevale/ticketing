import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {OrderCancelledEvent, OrderStatus} from '@ac-tickets/common'
import {OrderCancelledListener} from '../order_cancelled_listener'
import {natsWrapper} from '../../../nats_wrapper'
import { Order } from '../../../models/order'

const setup = async ()=>{
  //create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 20,
    userId: 'abcde',
    version: 0
  })
  await order.save()

  //create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version +1,
    ticket:{
      id: 'abcde',
    }
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, data, msg }
}


it('updates the status of the order to cancelled', async () => {
  const {listener, order, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //find the order
  const updatedOrder = await Order.findById(data.id)

  //make sure the order is marked as cancelled
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
})
