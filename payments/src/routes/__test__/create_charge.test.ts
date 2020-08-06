import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app'
import { fakeSignin } from '../../test/auth_help'
import { Order} from '../../models/order'
import { OrderStatus } from '@ac-tickets/common'
import { stripe } from '../../stripe/stripe'
import { Payment } from '../../models/payment'

// mocking the stripe call to the API for creating a charge
// jest.mock('../../stripe/stripe')

//User #1
const testUserEmail = 'test@test.com'
const testUserId = '1DFD45G9C'


it('returns a 404 when trying to purchase an order that does not exist', async ()=>{
  await request(app)
  .post('/api/payments')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({
    token: 'abababaa',
    orderId: mongoose.Types.ObjectId().toHexString()
  })
  .expect(404)

})

it('returns a 401 when the order does not belong to the user', async ()=>{
  //creates order as a random user
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created
  })
  await order.save()

  //try to pay for the same order as another user
  await request(app)
  .post('/api/payments')
  .set('Cookie', fakeSignin(testUserEmail, testUserId))
  .send({
    token: 'abababaa',
    orderId: order.id
  })
  .expect(401)
})

it('returns 400 when the order is already cancelled', async ()=>{
    //creates order as a user #1
    const order = Order.build({
      id: mongoose.Types.ObjectId().toHexString(),
      userId: testUserId,
      version: 0,
      price: 20,
      status: OrderStatus.Created,
    })

    //mark the order as cancelled and save it
    order.set({status: OrderStatus.Cancelled})
    await order.save()
  
    //try to pay for the same order as user #1
    await request(app)
    .post('/api/payments')
    .set('Cookie', fakeSignin(testUserEmail, testUserId))
    .send({
      token: 'abababaa',
      orderId: order.id
    })
    .expect(400)
})

// Mocking stripe API:

// it('returns 201 with valid inputs', async ()=>{
//    //creates order as a user #1
//    const order = Order.build({
//     id: mongoose.Types.ObjectId().toHexString(),
//     userId: testUserId,
//     version: 0,
//     price: 20,
//     status: OrderStatus.Created,
//   })
//   await order.save()

//   //try to pay for the same order as user #1
//   await request(app)
//   .post('/api/payments')
//   .set('Cookie', fakeSignin(testUserEmail, testUserId))
//   .send({
//     token: 'tok_visa', //valid token for tests
//     orderId: order.id
//   })
//   .expect(201)

//   expect(stripe.charges.create).toHaveBeenCalled()
//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
//   expect(chargeOptions.source).toEqual('tok_visa')
//   expect(chargeOptions.amount).toEqual(20 * 100)
//   expect(chargeOptions.currency).toEqual('usd')
// })


// Calling real Stripe API:
// A different approach

// it('returns 201 with valid inputs, creates a stripe charge and saves payment to DB', async ()=>{
//   const price = Math.floor(Math.random() *100000)
//   //creates order as a user #1
//   const order = Order.build({
//    id: mongoose.Types.ObjectId().toHexString(),
//    userId: testUserId,
//    version: 0,
//    price,
//    status: OrderStatus.Created,
//  })
//  await order.save()

//  //try to pay for the same order as user #1
//  await request(app)
//  .post('/api/payments')
//  .set('Cookie', fakeSignin(testUserEmail, testUserId))
//  .send({
//    token: 'tok_visa', //valid token for tests
//    orderId: order.id
//  })
//  .expect(201)


//   //Charge created in Stripe
//   const stripeCharges = await stripe.charges.list({limit: 10})
//   const stripeCharge = stripeCharges.data.find(charge => charge.amount === price*100)

//   expect(stripeCharge).toBeDefined()
//   expect(stripeCharge!.currency).toEqual('usd')


//   //Payment saved
//   const payment = await Payment.findOne({
//     orderId: order.id,
//     stripeChargeId: stripeCharge!.id
//   })

//   expect(payment).not.toBeNull()
// })


