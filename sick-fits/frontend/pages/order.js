// Components
import ForceSignin from '../components/ForceSignin';
import OrderInfo from '../components/OrderInfo';

const Order = (props) => {
  return (
    <div>
      <ForceSignin>
        <OrderInfo id={props.query.id} />
      </ForceSignin>
    </div>
  );
};

export default Order;
