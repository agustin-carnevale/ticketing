import nats from 'node-nats-streaming'
import {Listener} from './listener'
import { TicketCreatedEvent } from './ticket_created_event'
import { Subjects } from './subjects'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = 'payments-service'

  onMessage(data: TicketCreatedEvent['data'], msg: nats.Message): void {
    console.log('DATA: ', data)

    msg.ack()
  }

}
