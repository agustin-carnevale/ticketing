import express, {Request, Response} from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { validateRequest } from '../middlewares/validate_request'
import {BadRequestError} from '../errors/bad_request_error'
import { User } from '../models/user'

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email')
      .isEmail()
      .withMessage("Email must be valid"),
    body('password')
      .trim()
      .isLength({min: 4, max:20})
      .withMessage('Password must be between 4 and 20 characters')
  ],
  validateRequest
  ,async (req: Request, res: Response)=>{
    const {email, password} = req.body
    const existingUser = await User.findOne({ email })

    if (existingUser){
      throw new BadRequestError('Email already in use')
    }

    const user = User.build({email, password})
    await user.save()

    //Generate JWT
    const userJWT = jwt.sign({
      id: user.id,
      email: user.email
    }, process.env.JWT_KEY! )

    //Store JWT on session object (cookie)
    req.session = {
      jwt: userJWT
    }
    
    res.status(201).send(user)
})

export { router as signupRouter }