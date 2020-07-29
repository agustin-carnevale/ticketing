import {Publisher, Subjects, TicketCreatedEvent} from '@ac-tickets/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated;
}