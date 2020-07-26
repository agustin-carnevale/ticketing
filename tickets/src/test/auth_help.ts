import jwt from 'jsonwebtoken'

//Manually build the cookie
export const fakeSignin = (email: string, id: string)=>{

  //Create the JWT
  const token = jwt.sign({email, id}, process.env.JWT_KEY!)

  //Build Session Object {jwt: MY_TOKEN}
  const session = {jwt: token}

  //Turn that Session into json
  const sessionJSON = JSON.stringify(session)

  //Take json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  //Return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`]
}

