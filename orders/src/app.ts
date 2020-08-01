import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

//Routes
import {ordersRouter} from './routes/orders'
import {createOrderRouter} from './routes/create_order'
import {showOrderRouter} from './routes/show_order'
import {cancelOrderRouter} from './routes/cancel_order'

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

app.use(ordersRouter)
app.use(createOrderRouter)
app.use(showOrderRouter)
app.use(cancelOrderRouter)


// Route with no handlers for "all" methods: Not Found
app.all('*', () => {
  throw new NotFoundError()
})

// Error Handler Middleware
app.use(errorHandler)

export { app }