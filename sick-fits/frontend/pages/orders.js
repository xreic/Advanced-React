// Components
import ForceSignin from '../components/ForceSignin';
import OrdersList from '../components/OrdersList';

const Orders = () => {
  return (
    <div>
      <ForceSignin>
        <OrdersList />
      </ForceSignin>
    </div>
  );
};

export default Orders;
