import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

jest.mock('../nats_wrapper')

let mongo: any;
beforeAll(async ()=>{
  process.env.JWT_KEY= 'slnjksjdj'

  mongo = new MongoMemoryServer()
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

beforeEach(async ()=>{
  //reset mock functions invocations etc
  jest.clearAllMocks()

  const collections = await mongoose.connection.db.collections()

  for (let collection of collections){
    await collection.deleteMany({})
  }
})

afterAll(async ()=>{
  await mongo.stop()
  await mongoose.connection.close()
})