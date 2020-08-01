import {Publisher, OrderCreatedEvent, Subjects} from '@ac-tickets/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated;
}