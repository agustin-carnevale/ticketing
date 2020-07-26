import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Ticket } from '../../models/ticket'

const testEmail = 'test@test.com'
const testId = '1DFD45G9C'

it('returns a 404 if ticket is not found', async ()=>{
  await request(app)
    .get('/api/tickets/kdlsnfjsfkddj')
    .set('Cookie', fakeSignin(testEmail, testId))
    .send({})
    .expect(404)
})

it('returns the ticket if it is found', async ()=>{
  const title = 'concert'
  const price = 22

  //create a ticket
  const res = await request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title,
    price
  })
  .expect(201)
  
  //fetch it
  const ticketResponse = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .set('Cookie', fakeSignin(testEmail, testId))
    .send({})
    .expect(200)

  expect(ticketResponse.body.title).toEqual(title)
  expect(ticketResponse.body.price).toEqual(price)
})