import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Ticket } from '../../models/ticket'

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

it('fetches the order', async ()=>{
  
  const ticket = await buildTicket()

  //create an order as User #1
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({ticketId: ticket.id})
    .expect(201)

  //make request to fetch order as User #1
  const res = await request(app)
  .get(`/api/orders/${order.id}`)
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({})
  .expect(200)

  //make sure we get the order we just created
  expect(res.body.id).toEqual(order.id)
  expect(res.body.ticket.id).toEqual(ticket.id)
})

it('returns an error if the user is not the owner of the order', async ()=>{
  const ticket = await buildTicket()

  //create an order as User #1
  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({ticketId: ticket.id})
    .expect(201)

  //make request to fetch the order as User #2
  await request(app)
  .get(`/api/orders/${order.id}`)
  .set('Cookie', fakeSignin(testUser2Email, testUser2Id))
  .send({})
  .expect(401) //401: unauthorized
})