import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Ticket } from '../../models/ticket'

const testEmail = 'test@test.com'
const testId = '1DFD45G9C'

it('has a route handler listening to /api/tickets for post requests', async ()=>{
  const res = await request(app)
    .post('/api/tickets')
    .send({})
    
    expect(res.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async ()=>{
  await request(app)
  .post('/api/tickets')
  .send({})
  .expect(401)
})

it('returns a status other than 401 if the user is signed in', async ()=>{
  const res = await request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({})
  
  expect(res.status).not.toEqual(401)
})

it('returns an error if an invalid title is provided', async ()=>{
  //empty title
  await request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))  
  .send({
    title: '',
    price: 10
  })
  .expect(400)

  //no title
  await request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    price: 10
  })
  .expect(400)

})

it('returns an error if an invalid price is provided ', async ()=>{
    //negative price
    await request(app)
    .post('/api/tickets')
    .set('Cookie', fakeSignin(testEmail, testId))
    .send({
      title: 'title',
      price: -10
    })
    .expect(400)
  
    //no price
    await request(app)
    .post('/api/tickets')
    .set('Cookie', fakeSignin(testEmail, testId))
    .send({
      title:'title'
    })
    .expect(400)

})

it('creates a ticket with valid inputs', async ()=>{
  let tickets = await Ticket.find({})
  expect(tickets.length).toEqual(0)

  const title = 'title 1'
  const price = 25

  await request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title,
    price
  })
  .expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1)
  expect(tickets[0].title).toEqual(title)
  expect(tickets[0].price).toEqual(price)

})
