import {Publisher, OrderCancelledEvent, Subjects} from '@ac-tickets/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled;
}