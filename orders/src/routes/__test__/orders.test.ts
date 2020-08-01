import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import mongoose from 'mongoose'

//user #1
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

it('returns orders for a particular user', async ()=>{
  //create 3 tickets
  const ticketOne = await buildTicket()
  const ticketTwo = await buildTicket()
  const ticketThree = await buildTicket()

  //create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({ticketId: ticketOne.id})
    .expect(201)

  //create two orders as User #2
  const {body: orderOne} = await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUser2Email, testUser2Id))
  .send({ticketId: ticketTwo.id})
  .expect(201)

  const {body: orderTwo } = await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUser2Email, testUser2Id))
  .send({ticketId: ticketThree.id})
  .expect(201)

  //make request to get orders for User #2
  const res = await request(app)
  .get('/api/orders')
  .set('Cookie', fakeSignin(testUser2Email, testUser2Id))
  .send({})
  .expect(200)

  //make sure we only get the orders for User #2 
  expect(res.body.length).toEqual(2)
  expect(res.body[0].id).toEqual(orderOne.id)
  expect(res.body[1].id).toEqual(orderTwo.id)

  expect(res.body[0].ticket.id).toEqual(ticketTwo.id)
  expect(res.body[1].ticket.id).toEqual(ticketThree.id)

})