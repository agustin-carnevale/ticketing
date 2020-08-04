import {Publisher, PaymentCreatedEvent, Subjects} from '@ac-tickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated;
}