import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import mongoose from 'mongoose'
import cookieSession from 'cookie-session'

// Router/Routes
import { currentUserRouter } from "./routes/current_user";
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'

// Middlewares
import {errorHandler} from './middlewares/error_handler'

//Errors
import { NotFoundError } from './errors/not_found_error'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: true,

  })
)

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

// Route with no handlers for "all" methods: Not Found
app.all('*', () => {
  throw new NotFoundError()
})

// Error Handler Middleware
app.use(errorHandler)

const start = async () => {
  if (!process.env.JWT_KEY){
    throw new Error('JWT_KEY must be defined')
  }
  
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth',{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    console.log("Connected to MongoDB")
  } catch (err) {
    console.error(err)
  }

  app.listen(3000,()=>{
    console.log("Listening on port 3000!!!")
  })
}

start()