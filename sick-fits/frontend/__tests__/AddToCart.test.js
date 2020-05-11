// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { ApolloConsumer } from 'react-apollo';
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import { CURRENT_USER_QUERY } from '../components/User';
import AddToCart, { ADD_TO_CART_MUTATION } from '../components/AddToCart';

// Helpers
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: { ...fakeUser(), cart: [] } } }
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: { ...fakeUser(), cart: [fakeCartItem({ id: 'abc123' })] } }
    }
  },
  {
    request: { query: ADD_TO_CART_MUTATION, variables: { id: 'abc123' } },
    result: { data: { addToCart: { ...fakeCartItem(), quantity: 1 } } }
  }
];

describe('<AddToCart/>', () => {
  it('renders and matches the snap shot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id="abc123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    expect(toJson(wrapper.find('button'))).toMatchSnapshot();
  });

  xit('adds an item to cart when clicked', async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {(client) => {
            apolloClient = client;
            return <AddToCart id="abc123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    const {
      data: { me }
    } = await apolloClient.query({ query: CURRENT_USER_QUERY });

    expect(me.cart).toHaveLength(0);

    wrapper.find('button').simulate('click');
    await wait();

    /**
     * Second CURRENT_USER_QUERY is being called
     * but the cart is not being saved
     */
    const secondRes = await apolloClient.query({ query: CURRENT_USER_QUERY });

    expect(secondRes.data.me.cart).toHaveLength(1);
    expect(secondRes.data.me.cart[0].id).toBe('omg123');
    expect(secondRes.data.me.cart[0].quantity).toBe(3);
  });

  it('changes from add to adding when clicked', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <AddToCart id="abc123" />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    expect(wrapper.text()).toContain('Add To Cart');
    wrapper.find('button').simulate('click');
    expect(wrapper.text()).toContain('Adding To Cart');
  });
});
