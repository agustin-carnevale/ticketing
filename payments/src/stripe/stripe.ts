import Stripe from 'stripe'

// if( process.env.NODE_ENV === 'test'){
//   const { STRIPE_SK } = require('../../keys')
//   process.env.STRIPE_SECRET_KEY = STRIPE_SK
//   console.log("TEST_MODE_STRIPE_KEY")
// }

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
  apiVersion: '2020-03-02'
})