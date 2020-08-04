import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {OrderCreatedEvent, OrderStatus} from '@ac-tickets/common'
import {OrderCreatedListener} from '../order_created_listener'
import {natsWrapper} from '../../../nats_wrapper'
import { Order } from '../../../models/order'

const setup = async ()=>{
  //create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  //create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toUTCString(),
    ticket:{
      id: 'abcde',
      price: 10
    }
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}


it('replicates the order info', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //find the order
  const order = await Order.findById(data.id)

  //make sure the order exists and has the correct data
  expect(order).not.toBeNull()
  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
})
