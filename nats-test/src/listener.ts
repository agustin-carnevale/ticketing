import nats from 'node-nats-streaming'
import { randomBytes } from 'crypto'
import {TicketCreatedListener} from './events/ticket_created_listener'

console.clear()

//stan ==  nats client
const stan = nats.connect('ticketing', randomBytes(4).toString('hex'),{
  url: 'http://localhost:4222',
})

stan.on('connect', ()=>{
  console.log("Listener connected to NATS")

  stan.on('close', ()=>{
    console.log('NATS connection closed!!')
    process.exit()
  })

  new TicketCreatedListener(stan).listen()

})

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())




// const options = stan.subscriptionOptions()
// .setManualAckMode(true) //Manual Acknowledge to true, to be sure the event received by a listener was processed successfully
// const subscription = stan.subscribe(
// 'ticket:created', //param1= channel,
// 'orders-service-QueueGroup', //param2= queue group
// options, //param3= options
// )

// subscription.on('message', (msg: Message)=>{
// const data = msg.getData();
// if( typeof data === 'string'){
//   console.log(`Received event #${msg.getSequence()}`)
//   console.log(`Data: ${data}`)
// }
// msg.ack()
// })