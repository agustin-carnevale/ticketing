const OrdersIndex = ({ orders })=> {
  return <div>
    <ul>
      {orders.map(order =>{
        return <li key={order.id}>
          {order.ticket.title} - {order.status}
        </li>
      })}
    </ul>
  </div>
}


OrdersIndex.getInitialProps = async (context, client)=>{
  const {data} = await client.get('/api/orders')
  return {orders: data}
}

export default OrdersIndex