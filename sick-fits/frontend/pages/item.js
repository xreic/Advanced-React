// Components
import SingleItem from '../components/SingleItem';

// React
const Item = ({ query }) => (
  <div>
    <SingleItem id={query.id} />
  </div>
);

export default Item;
