import { Listener, OrderCreatedEvent, Subjects} from '@ac-tickets/common'
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue_group_name';
import { expirationQueue } from '../../queues/expiration_queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated
  readonly queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message){
    const delay  = new Date(data.expiresAt).getTime() - new Date().getTime()
    console.log('Delay in milliseconds is:', delay)

    await expirationQueue.add({
      orderId: data.id
    },{
      delay: delay
    })

    msg.ack()
  }
}