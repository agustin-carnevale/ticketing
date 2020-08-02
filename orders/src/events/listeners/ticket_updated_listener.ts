import { Message } from 'node-nats-streaming'
import { Listener, TicketUpdatedEvent, Subjects } from '@ac-tickets/common'
import { Ticket } from '../../models/ticket'
import {queueGroupName} from './queue_group_name'


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated
  readonly queueGroupName = queueGroupName

  // When a ticket is updated by the Tickets Service, Orders service
  // will receive this event and update the copy inside the Orders DB to keep record of the changes
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message){
    
    const ticket = await Ticket.findByEvent(data)
    if(!ticket){
      throw new Error('Ticket not found')
    }

    const {title, price} = data
    ticket.set({title, price})
    await ticket.save()

    msg.ack()
  }
}