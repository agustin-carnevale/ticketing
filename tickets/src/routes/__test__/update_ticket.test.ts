import request from 'supertest'
import { app } from '../../app'
import { fakeSignin, generateObjectId} from '../../test/auth_help'
import { natsWrapper } from '../../nats_wrapper'
import { Ticket } from '../../models/ticket'
import mongoose from 'mongoose'

const testEmail = 'test@test.com'
const testId = generateObjectId()

const createTicket = (title: string, price:number)=>{
  return request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title,
    price
  })
}

it('returns a 404: not found, if the provided id does not exist', async ()=>{
  const id = generateObjectId()
  await request(app)
  .put(`/api/tickets/${id}`)
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title:'concert',
    price: 25
  })
  .expect(404)
})

it('returns a 401: unauthorized, if the user is not authenticated', async ()=>{
  const id = generateObjectId()
  await request(app)
  .put(`/api/tickets/${id}`)
  .send({
    title:'concert',
    price: 25
  })
  .expect(401)
  
})

it('returns a 401: unauthorized, if the user does not own the ticket', async ()=>{
  //create ticket with one user
  const res = await createTicket('concert', 40)

  //try to update with different user credentials
  await request(app)
  .put(`/api/tickets/${res.body.id}`)
  .set('Cookie', fakeSignin('other@user.com', generateObjectId()))
  .send({
    title:'live concert',
    price: 25
  })
  .expect(401)
})

it('returns a 400 if the user provides invalid inputs for title or price', async ()=>{
    //create ticket with one user
    const res = await createTicket('concert', 40)

    //try to update with invalid title
    await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', fakeSignin(testEmail, testId))
    .send({
      title:'',
      price: 25
    })
    .expect(400)

    //try to update with invalid price
    await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', fakeSignin(testEmail, testId))
    .send({
      title:'live concert',
      price: -25
    })
    .expect(400)
  
})

it('updates the ticket provided valid inputs', async ()=>{
  //create ticket with one user
  const res = await createTicket('concert', 40)

  const newTitle = 'New Title'
  const newPrice = 25

  await request(app)
  .put(`/api/tickets/${res.body.id}`)
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title: newTitle,
    price: newPrice
  })
  .expect(200)

  const ticketResponse = await request(app)
  .get(`/api/tickets/${res.body.id}`)
  .send({})
  .expect(200)

  expect(ticketResponse.body.title).toEqual(newTitle)
  expect(ticketResponse.body.price).toEqual(newPrice)
})


it('publishes an event of ticket:updated', async ()=>{
  //create ticket with one user
  const res = await createTicket('concert', 40)

  const newTitle = 'New Title'
  const newPrice = 25

  await request(app)
  .put(`/api/tickets/${res.body.id}`)
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title: newTitle,
    price: newPrice
  })
  .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})


it('rejects updates if the ticket is reserved', async ()=>{
  //create ticket
  const res = await createTicket('concert', 40)


  //mark the ticket as reserved (set an orderId)
  const ticket = await Ticket.findById(res.body.id)
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString()})
  await ticket!.save()

  const newTitle = 'New Title'
  const newPrice = 25

  //try to update the ticket
  await request(app)
  .put(`/api/tickets/${res.body.id}`)
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title: newTitle,
    price: newPrice
  })
  .expect(400)
})