// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import { CURRENT_USER_QUERY } from '../components/User';
import RequestReset, {
  REQUEST_RESET_MUTATION
} from '../components/RequestReset';

// Helpers
import { fakeUser } from '../lib/testUtils';

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: 'email@email.com' }
    },
    result: {
      data: { requestReset: { message: 'success', __typename: 'Message' } }
    }
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
];

describe('<RequestReset/>', () => {
  it('renders and matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="requestReset"]');
    expect(toJson(form)).toMatchSnapshot();
  });

  it('calls the mutation', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestReset />
      </MockedProvider>
    );

    // This works as the RequestReset component only has a single input
    wrapper.find('input').simulate('change', {
      target: { name: 'email', value: 'email@email.com' }
    });
    wrapper.find('form').simulate('submit');
    await wait();
    wrapper.update();

    expect(wrapper.find('p').text()).toContain(
      'Check your email for the reset link.'
    );
  });
});
