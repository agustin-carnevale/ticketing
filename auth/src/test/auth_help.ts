import request  from "supertest"
import { app } from '../app'

export const signup = async (email: string, password: string)=>{

  const res = await request(app)
    .post('/api/users/signup')
    .send({ email, password})
    .expect(201)

  const cookie = res.get('Set-Cookie')
  
  return cookie
}

