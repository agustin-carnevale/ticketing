import {Publisher, Subjects, TicketUpdatedEvent} from '@ac-tickets/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
}