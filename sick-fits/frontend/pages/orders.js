// Components
import ForceSignin from '../components/ForceSignin';
import OrdersList from '../components/OrdersList';

const Orders = (props) => {
  return (
    <div>
      <ForceSignin>
        <OrdersList />
      </ForceSignin>
    </div>
  );
};

export default Orders;
