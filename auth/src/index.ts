import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'

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
app.use(json())

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

app.listen(3000,()=>{
  console.log("Listening on port 3000!!!!!!!")
})