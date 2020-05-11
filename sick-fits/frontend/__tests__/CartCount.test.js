// Enzyme
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

// Testees
import CartCount from '../components/CartCount';

describe('<CartCount/>', () => {
  it('renders', () => {
    shallow(<CartCount count={10} />);
  });

  it('matches the snapshot', () => {
    const wrapper = shallow(<CartCount count={11} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('updates via props', () => {
    const wrapper = shallow(<CartCount count={50} />);

    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 10 });
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
