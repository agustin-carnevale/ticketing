import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

//Routes
import { createTicketRouter } from './routes/new_ticket'
import { showTicketRouter } from './routes/show_ticket'
import { getTicketsRouter } from './routes/tickets'
import { updateTicketRouter } from './routes/update_ticket'

// Middlewares, Errors
import {errorHandler, NotFoundError, currentUser} from '@ac-tickets/common'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)
app.use(currentUser)
app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(getTicketsRouter)
app.use(updateTicketRouter)

// Route with no handlers for "all" methods: Not Found
app.all('*', () => {
  throw new NotFoundError()
})

// Error Handler Middleware
app.use(errorHandler)

export { app }