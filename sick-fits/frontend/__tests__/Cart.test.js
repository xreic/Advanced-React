// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import { CURRENT_USER_QUERY } from '../components/User';
import Cart, { LOCAL_STATE_QUERY } from '../components/Cart';

// Helpers
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [fakeCartItem()] } } }
  },
  {
    request: { query: LOCAL_STATE_QUERY },
    result: { data: { cartOpen: true } }
  }
];

describe('<Cart/>', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <Cart />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    expect(toJson(wrapper.find('header'))).toMatchSnapshot();
    // Only length of 1, because we only call fakeCartItem once in the mocks
    expect(wrapper.find('CartItem')).toHaveLength(1);
  });
});
