// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import OrderInfo, { SINGLE_ORDER_QUERY } from '../components/OrderInfo';

// Helpers
import { fakeOrder } from '../lib/testUtils';

const mocks = [
  {
    request: { query: SINGLE_ORDER_QUERY, variables: { id: 'ord123' } },
    result: { data: { order: fakeOrder() } }
  }
];

describe('<OrderInfo />', () => {
  it('renders the order', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <OrderInfo id="ord123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    const order = wrapper.find('div[data-test="order"]');
    expect(toJson(order)).toMatchSnapshot();
  });
});
