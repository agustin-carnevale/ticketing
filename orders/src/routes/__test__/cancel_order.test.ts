import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import {natsWrapper} from '../../nats_wrapper'

//User #1
const testUserEmail = 'test@test.com'
const testUserId = '1DFD45G9C'

//user #2
const testUser2Email = 'test2@test.com'
const testUser2Id = '1DFD45G22'

const buildTicket = async ()=>{
  const ticket = Ticket.build({
    title: 'concert',
    price: 20
  })
  await ticket.save()

  return ticket
}

it('cancels the order', async ()=>{
  const ticket = await buildTicket()

  //create an order as User #1
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({ticketId: ticket.id})
    .expect(201)

  //make request to cancel order as User #1
  await request(app)
  .patch(`/api/orders/${order.id}`)
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({})
  .expect(200)

  //make sure we updated the order in the DB with status of: Cancelled
  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

})

it('returns an error if the user is not the owner of the order', async ()=>{
  const ticket = await buildTicket()

  //create an order as User #1
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({ticketId: ticket.id})
    .expect(201)

  //make request to cancel the order as User #2
  await request(app)
  .patch(`/api/orders/${order.id}`)
  .set('Cookie', fakeSignin(testUser2Email, testUser2Id))
  .send({})
  .expect(401) //401: unauthorized
})

it('emits an order:cancelled event', async()=>{
  const ticket = await buildTicket()

  //create an order as User #1
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({ticketId: ticket.id})
    .expect(201)

  //make request to cancel order as User #1
  await request(app)
  .patch(`/api/orders/${order.id}`)
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({})
  .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})