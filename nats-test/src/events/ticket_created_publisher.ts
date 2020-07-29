import {Publisher} from './publisher'
import {TicketCreatedEvent} from './ticket_created_event'
import { Subjects } from './subjects'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated
}