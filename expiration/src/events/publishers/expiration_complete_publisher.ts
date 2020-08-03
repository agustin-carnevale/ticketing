import {Publisher, ExpirationCompleteEvent, Subjects} from '@ac-tickets/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete;
}