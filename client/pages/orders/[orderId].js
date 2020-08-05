import {useEffect, useState} from 'react'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/useRequest'

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [doRequest, errors] = useRequest({
    url: '/api/payments',
    method:'post',
    body:{
      orderId: order.id,
    },
    onSuccess: ()=>Router.push('/orders')
  })
 
   useEffect(() => {
     const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft/1000))
     }
     findTimeLeft()
     const timerId = setInterval(findTimeLeft, 1000);

     return ()=>{
       clearInterval(timerId)
     }
   },[])


if(timeLeft<0){
  return <div>Order Expired!!</div>
}
  return (<div>
    <h4>{timeLeft} seconds until order expirates</h4>
   <StripeCheckout 
    amount={order.ticket.price *100} //in cents
    email={currentUser.email}
    token={({id}) => doRequest({ token: id })}
    stripeKey='pk_test_0QOYYJRfU05ishAS8W5fRPNq' 
    //todo: although it is a public/publishable key, it should be put into an env. variable
    //read docs for next variables
   />
   {errors}
  </div>)
}

//Fetch data during server side rendering (on the server)
OrderShow.getInitialProps = async (context, client, currentUser)=> {
  const {orderId} = context.query 
  const {data} = await client.get(`/api/orders/${orderId}`)

  return {order: data}
}

export default OrderShow