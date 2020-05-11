// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { ApolloConsumer } from 'react-apollo';
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import { CURRENT_USER_QUERY } from '../components/User';
import Signup, { SIGNUP_MUTATION } from '../components/Signup';

// Helpers
import { fakeUser } from '../lib/testUtils';

const me = fakeUser();
const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        email: me.email,
        name: me.name,
        password: '123'
      }
    },
    result: {
      data: {
        signup: {
          __typename: 'User',
          id: 'abc123',
          email: me.email,
          name: me.name
        }
      }
    }
  },
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me } }
  }
];

const type = (wrapper, name, value) => {
  wrapper
    .find(`input[name="${name}"]`)
    .simulate('change', { target: { name, value } });
};

describe('<Signup/>', () => {
  it('renders and matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>
    );

    expect(toJson(wrapper.find('form'))).toMatchSnapshot();
  });

  it('calls the mutation properly', async () => {
    let apolloClient;

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {(client) => {
            apolloClient = client;

            return <Signup />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    type(wrapper, 'name', me.name);
    type(wrapper, 'email', me.email);
    type(wrapper, 'password', '123');
    wrapper.update();

    wrapper.find('form').simulate('submit');
    await wait();

    const user = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(user.data.me).toMatchObject(me);
  });
});
