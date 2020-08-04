import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import {
  requiereAuth,
  validateRequest,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from '@ac-tickets/common'
import { Order } from '../models/order'
import { Payment } from '../models/payment'
import { stripe } from '../stripe/stripe'
import { PaymentCreatedPublisher } from '../events/publishers/payment_created_publisher'
import { natsWrapper } from '../nats_wrapper'

const router = express.Router()

router.post('/api/payments',
  requiereAuth,
  [
    body('token')
    .not()
    .isEmpty(),
    body('orderId')
    .not()
    .isEmpty()
  ],
  validateRequest,
  async (
   req: Request,
   res: Response
  )=>{
    const {token, orderId} = req.body
    const order = await Order.findById(orderId)

    if(!order){
      throw new NotFoundError()
    }

    if(order.userId !== req.currentUser!.id){
      throw new NotAuthorizedError()
    }

    if(order.status === OrderStatus.Cancelled){
      throw new BadRequestError('Cannot pay for a cancelled order')
    }

    //Charge to Stripe API
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100, //in cents
      source: token
    })

    console.log(charge.id)

    //Save Payment to DB
    const payment = Payment.build({
      orderId,
      stripeChargeId: charge.id
    })
    await payment.save()

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeChargeId: payment.stripeChargeId
    })

    res.status(201).send({success: true, paymentId: payment.id})
})

export {router as createChargeRouter}