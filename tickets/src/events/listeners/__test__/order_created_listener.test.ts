import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {OrderCreatedEvent, OrderStatus} from '@ac-tickets/common'
import {OrderCreatedListener} from '../order_created_listener'
import {natsWrapper} from '../../../nats_wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async ()=>{
  //create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  //create and save a ticket
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'live concert',
    price: 30
  })
  await ticket.save()

  //create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toUTCString(),
    ticket:{
      id: ticket.id,
      price: ticket.price
    }
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg}
}


it('sets the orderId of the ticket', async () => {
  const {listener, ticket, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //find the reserved ticket
  const reservedTicket = await Ticket.findById(ticket.id)

  expect(reservedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket:updated event with the correct orderId (reserved)', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //make sure publish function was called
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  //make sure the updated data has the correct orderId
  const ticketUpdatedData= JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(ticketUpdatedData.orderId).toEqual(data.id)

})