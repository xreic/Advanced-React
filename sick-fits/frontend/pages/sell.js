// Components
import CreateItem from '../components/CreateItem';
import ForceSignin from '../components/ForceSignin';

const Sell = () => {
  return (
    <div>
      <ForceSignin>
        <CreateItem />
      </ForceSignin>
    </div>
  );
};

export default Sell;
