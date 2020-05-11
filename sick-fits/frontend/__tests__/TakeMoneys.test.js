// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import nProgress from 'nprogress';
import Router from 'next/router';
Router.router = { push() {} };

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import { CURRENT_USER_QUERY } from '../components/User';
import TakeMoneys, { CREATE_ORDER_MUTATION } from '../components/TakeMoneys';

// Helpers
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: { ...fakeUser(), cart: [fakeCartItem()] } }
    }
  }
];

describe('<TakeMoney />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoneys />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    const checkOutButton = wrapper.find('ReactStripeCheckout');
    expect(toJson(checkOutButton)).toMatchSnapshot();
  });

  it('creates an order ontoken', async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: 'xyz789' } }
    });

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoneys />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    /**
     * Need to replace the "createOrder" callback in
     * "onToken" function with the mocked function
     */
    const component = wrapper.find('TakeMoneys').instance();
    component.onToken({ id: 'abc123' }, createOrderMock);
    expect(createOrderMock).toBeCalled();
    expect(createOrderMock).toBeCalledWith({ variables: { token: 'abc123' } });
  });

  it('turns the progress bar on', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoneys />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    nProgress.start = jest.fn();

    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: 'xyz789' } }
    });
    const component = wrapper.find('TakeMoneys').instance();
    component.onToken({ id: 'abc123' }, createOrderMock);

    expect(nProgress.start).toBeCalled();
  });

  it('routes to the order page when completed', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoneys />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    const createOrderMock = jest.fn().mockResolvedValue({
      data: { createOrder: { id: 'xyz789' } }
    });
    const component = wrapper.find('TakeMoneys').instance();
    Router.router.push = jest.fn();
    component.onToken({ id: 'abc123' }, createOrderMock);
    await wait();

    expect(Router.router.push).toBeCalledWith({
      pathname: '/order',
      query: { id: 'xyz789' }
    });
  });
});
