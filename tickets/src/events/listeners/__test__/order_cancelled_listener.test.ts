import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {OrderCancelledEvent} from '@ac-tickets/common'
import {OrderCancelledListener} from '../order_cancelled_listener'
import {natsWrapper} from '../../../nats_wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async ()=>{
  //create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  //create and save a ticket
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'live concert',
    price: 30,
  })

  const orderId = new mongoose.Types.ObjectId().toHexString()
  ticket.set({orderId}),
  await ticket.save()

  //create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket:{
      id: ticket.id,
    }
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg}
}


it('updates the ticket', async () => {
  const {listener, ticket, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //find the reserved ticket
  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.orderId).not.toBeDefined()
})

it('acks the message', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket:updated event with undefined orderId (not reserved)', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //make sure publish function was called
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  //make sure the updated data has the orderId undefined 
  const ticketUpdatedData= JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  expect(ticketUpdatedData.orderId).not.toBeDefined()

})