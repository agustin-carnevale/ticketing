import request from 'supertest'
import { app } from '../../app'
import { fakeSignin} from '../../test/auth_help'

const testEmail = 'test@test.com'
const testId = '1DFD45G9C'

const createTicket = (title: string, price:number)=>{
  return request(app)
  .post('/api/tickets')
  .set('Cookie', fakeSignin(testEmail, testId))
  .send({
    title,
    price
  })
}

it('returns a list of tickets', async ()=>{
  await createTicket('concert',22)
  await createTicket('show',32)
  await createTicket('standup',42)

  const res = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

    expect(res.body.length).toEqual(3)
})

it('returns an empty list when there are no tickets', async ()=>{

  const res = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200)

    expect(res.body.length).toEqual(0)
})