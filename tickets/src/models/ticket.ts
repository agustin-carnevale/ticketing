import mongoose from 'mongoose'

// An interface that describes the properties required 
// to create a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// An interface that describes the properties
// that a Ticket Document has
interface TicketDoc extends mongoose.Document{
  title: string;
  price: number;
  userId: string;
}

// An interface that describes the properties/methods
// that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc>{
  build(attrs: TicketAttrs): TicketDoc;
}

// Mongoose Schema for Ticket
const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true
  },
  userId:{
    type: String,
    required: true
  }
},{
  toJSON:{
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
})

// Use this build function to involve Typescript
// and then calling new Ticket()
ticketSchema.statics.build = (attrs: TicketAttrs) =>{
  return new Ticket(attrs)
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)

export { Ticket }