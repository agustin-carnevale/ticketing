import express, { Request, Response} from 'express'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import { User } from '../models/user'
import { BadRequestError, validateRequest } from '@ac-tickets/common';
import { Password } from '../utils/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage("Email must be valid"),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password must be supplied')
  ],
  validateRequest
 , async (req: Request, res: Response)=>{
  const {email, password} = req.body

  //Check email
  const existingUser = await User.findOne({ email })
  if (!existingUser){
    throw new BadRequestError('Invalid credentials')
  }

   //Check password
  const passwordsMatch = await Password.compare(existingUser.password, password)
  if (!passwordsMatch){
    throw new BadRequestError('Invalid credentials')
  }

  //Generate JWT
  const userJWT = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, process.env.JWT_KEY! )

  //Store JWT on session object (cookie)
  req.session = {
    jwt: userJWT
  }
  
  res.status(200).send(existingUser)
})

export { router as signinRouter }