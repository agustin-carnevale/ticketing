import { Message } from 'node-nats-streaming'
import { Listener, TicketCreatedEvent, Subjects } from '@ac-tickets/common'
import { Ticket } from '../../models/ticket'
import {queueGroupName} from './queue_group_name'


export class TicketCreatedListener extends Listener<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated
  readonly queueGroupName = queueGroupName

  // When a ticket is created by the Tickets Service, Orders service
  // will receive this event and save a copy to the Orders DB to keep record of all valid tickets
  async onMessage(data: TicketCreatedEvent['data'], msg: Message){
    const {id, title, price} = data
    const ticket = Ticket.build({id, title, price})
    await ticket.save()
    msg.ack()
  }
}