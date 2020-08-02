import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Ticket } from '../../models/ticket'
import { Order, OrderStatus } from '../../models/order'
import mongoose from 'mongoose'
import {natsWrapper} from '../../nats_wrapper'

const testUserEmail = 'test@test.com'
const testUserId = '1DFD45G9C'

it('has a route handler listening to /api/orders for post requests', async ()=>{
  const res = await request(app)
    .post('/api/orders')
    .send({})
    
    expect(res.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async ()=>{
  await request(app)
  .post('/api/orders')
  .send({})
  .expect(401)
})

it('returns a status other than 401 if the user is signed in', async ()=>{
  const res = await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({})
  
  expect(res.status).not.toEqual(401)
})

it('returns an error if the ticket does not exist', async ()=>{
  const ticketId = mongoose.Types.ObjectId()
  await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({ ticketId })
  .expect(404) //Not found error
})

it('returns an error if the ticket is already reserved', async ()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'LIVE CONCERT',
    price: 40
  })
  await ticket.save()
  const order = Order.build({
    ticket,
    userId: testUserId,
    status: OrderStatus.Created,
    expiresAt: new Date()
  })
  await order.save()

  await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({ ticketId: ticket.id })
  .expect(400) //Bad request because is already reserved
})

it('reserves a ticket when valid inputs', async ()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'LIVE CONCERT',
    price: 40
  })
  await ticket.save()

  let ordersCreated = await Order.find({})

  //We start with 0 orders in the DB
  expect(ordersCreated.length).toEqual(0)

  const res = await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({ ticketId: ticket.id })
  .expect(201) //code 201 -> 'created'

  ordersCreated = await Order.find({})

  //We have now created an order and saved it to DB
  expect(ordersCreated.length).toEqual(1)

})

it('emits an order created event', async ()=>{
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'LIVE CONCERT',
    price: 40
  })
  await ticket.save()

  let ordersCreated = await Order.find({})

  //We start with 0 orders in the DB
  expect(ordersCreated.length).toEqual(0)

  const res = await request(app)
  .post('/api/orders')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({ ticketId: ticket.id })
  .expect(201) //code 201 -> 'created'

  expect(natsWrapper.client.publish).toHaveBeenCalled()

})

