import request from 'supertest'
import { app } from '../../app'
import { signup } from '../../test/auth_help'

it('returns the correct details of the current user', async ()=>{

  const email = 'test@test.com'
  const password = 'password'
  const cookie = await signup(email, password)

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie) //set cookie manually
    .send()
    .expect(200)

  expect(response.body.currentUser.email).toEqual(email)
})


it('returns null if not authenticated', async ()=>{
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200)

  expect(response.body.currentUser).toEqual(null)
})