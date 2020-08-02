import mongoose from 'mongoose'
import {Message} from 'node-nats-streaming'
import {TicketUpdatedEvent} from '@ac-tickets/common'
import {TicketUpdatedListener} from '../ticket_updated_listener'
import {natsWrapper} from '../../../nats_wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async ()=>{
  //create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'live concert',
    price: 30
  })

  await ticket.save()

  //create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version+1,
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 100,
    title: 'new show'
  }

  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg}
}


it('finds, updates and saves a ticket', async () => {
  const {listener, ticket, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  const updatedTicket = await Ticket.findById(ticket.id)

  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const {listener, data, msg} = await setup()

  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg)

  //write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled()
})


it('does not call ack if the event has a skipped version number', async () => {
  const {listener, data, msg} = await setup()

  //future version (version should be 1 or 2)
  data.version = 10

  try {
    await listener.onMessage(data, msg)
  } catch (err) {
    // console.log(err)
  }
  //write assertions to make sure ack function was NOT called
  //meaning we are not processing event with "future" versions 
  expect(msg.ack).not.toHaveBeenCalled()
})



