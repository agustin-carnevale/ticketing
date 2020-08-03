import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {ExpirationCompleteEvent} from '@ac-tickets/common'
import {ExpirationCompleteListener} from '../expiration_complete_listener'
import {natsWrapper} from '../../../nats_wrapper'
import { Ticket } from '../../../models/ticket'
import { Order, OrderStatus } from '../../../models/order'

const setup = async ()=>{
  //create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'live concert',
    price: 30
  })
  await ticket.save()

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'abc',
    expiresAt: new Date(),
    ticket,
  })
  await order.save()

  //create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
   orderId: order.id
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, order, data, msg }
}

it('updated the order status to cancelled', async () => {
  const {listener, order, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)
  //make sure the order was updated with a cancelled status
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order:cancelled event', async () => {
  const {listener, order, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //make sure the order:cancelled event was emitted and the orderId is the correct one
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(eventData.id).toEqual(order.id)

})

it('acks the message', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
})