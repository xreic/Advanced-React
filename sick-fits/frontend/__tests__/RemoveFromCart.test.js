// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { ApolloConsumer } from 'react-apollo';
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import { CURRENT_USER_QUERY } from '../components/User';
import RemoveFromCart, {
  REMOVE_FROM_CART_MUTATION
} from '../components/RemoveFromCart';

// Helpers
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: { ...fakeUser(), cart: [fakeCartItem({ id: 'abc123' })] } }
    }
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'abc123' } },
    result: {
      data: { removeFromCart: { __typename: 'CartItem', id: 'abc123' } }
    }
  }
];

describe('<RemoveFromCart />', () => {
  it('renders and matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <RemoveFromCart id="abc123" />
      </MockedProvider>
    );

    expect(toJson(wrapper.find('button'))).toMatchSnapshot();
  });

  it('removes the item from cart', async () => {
    global.alert = console.log;

    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {(client) => {
            apolloClient = client;
            return <RemoveFromCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );

    const res = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(res.data.me.cart).toHaveLength(1);
    expect(res.data.me.cart[0].item.price).toEqual(5000);

    wrapper.find('button').simulate('click');
    await wait();

    const res2 = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(res2.data.me.cart).toHaveLength(0);
  });
});
