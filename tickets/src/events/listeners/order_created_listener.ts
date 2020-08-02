import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@ac-tickets/common'
import { Ticket } from '../../models/ticket'
import {queueGroupName} from './queue_group_name'
import { TicketUpdatedPublisher } from '../publishers/ticket_updated_publisher'


export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName

  async onMessage(data: OrderCreatedEvent['data'], msg: Message){
    //find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id)

    //If no ticket, throw error
    if(!ticket){
      throw new Error('Ticket not found')
    }

    //mark the ticket as being reserved by setting its orderId property
    ticket.set({orderId: data.id})

    //save the ticket
    await ticket.save()

    //publish the updated ticket for consistency in version between services
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version
    })

    //ack the message
    msg.ack()
  }
}