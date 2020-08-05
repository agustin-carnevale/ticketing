import useRequest from "../../hooks/useRequest"
import Router from 'next/router'

const TicketShow = ({ticket})=>{
const [doRequest,errors] = useRequest({
  url:'/api/orders',
  method: 'post',
  body:{
    ticketId: ticket.id,
  },
  onSuccess: (order)=>Router.push('/orders/[orderId]', `/orders/${order.id}`)
})
  return <div>
    <h1>{ticket.title}</h1>
    <h4>{ticket.price}</h4>
    {errors}
    <button onClick={(e)=>doRequest()} className="btn btn-primary">Purchase</button>
  </div>
}


//Fetch data during server side rendering (on the server)
TicketShow.getInitialProps = async (context, client, currentUser)=> {
  const {ticketId} = context.query 
  const {data} = await client.get(`/api/tickets/${ticketId}`)

  return {ticket: data}
}

export default TicketShow