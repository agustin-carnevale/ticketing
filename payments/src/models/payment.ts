import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface PaymentAttrs {
  orderId: string;
  stripeChargeId: string;
}

interface PaymentDoc extends mongoose.Document{
  orderId: string;
  stripeChargeId: string;
  version: number;
}

interface PaymentModel extends mongoose.Model<PaymentDoc>{
  build(attrs: PaymentAttrs): PaymentDoc;
  findByEvent(event: {id: string, version: number}): Promise<PaymentDoc| null>;
}

const paymentSchema = new mongoose.Schema({
  orderId:{
    type: String,
    required: true,
  },
  stripeChargeId:{
    type: String,
    required: true,
  }
},{
  toJSON:{
    transform(doc,ret){
      ret.id = ret._id
      delete ret._id
    }
  }
})

paymentSchema.set('versionKey','version')
paymentSchema.plugin(updateIfCurrentPlugin)

paymentSchema.statics.build = (attrs: PaymentAttrs)=>{
  return new Payment(attrs)
}

paymentSchema.statics.findByEvent = (event: {id: string, version: number})=>{
  return Payment.findOne({
    _id: event.id,
    version: event.version -1 
  })
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema)

export { Payment }