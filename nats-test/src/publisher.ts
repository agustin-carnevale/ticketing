import nats from 'node-nats-streaming'
import {TicketCreatedPublisher} from './events/ticket_created_publisher'

console.clear()

const stan = nats.connect('ticketing', 'abc',{
  url: 'http://localhost:4222'
})

stan.on('connect', async() => {
  console.log("Publisher connected to NATS")

  const publisher = new TicketCreatedPublisher(stan)
  try {
   await publisher.publish({
      id: '12345',
      title: 'Live Concert',
      price: 55
    })
  } catch (err) {
    console.error(err)
  }
  

})

// const data = JSON.stringify({
//   id:'1234',
//   title: 'concert',
//   price: 20
// })

// stan.publish('ticket:created', data, ()=>{
//   console.log("Event published")
// })