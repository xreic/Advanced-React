// Enzyme
import { mount } from 'enzyme';

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import ForceSignin from '../components/ForceSignin';
import { CURRENT_USER_QUERY } from '../components/User';

// Helpers
import { fakeUser } from '../lib/testUtils';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } }
  }
];

describe('<ForceSignin/>', () => {
  it('renders the sign in dialog to those who are not signed in', async () => {
    const Adopted = () => <p>Child</p>;
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <ForceSignin>
          <Adopted />
        </ForceSignin>
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    expect(wrapper.text()).toContain('Sign in before trying to sell items.');
    expect(wrapper.find('Signin').exists()).toBe(true);
    expect(wrapper.contains(<Adopted />)).toBe(false);
  });

  it('renders the child component for those who are signed in', async () => {
    const Adopted = () => <p>Child</p>;
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <ForceSignin>
          <Adopted />
        </ForceSignin>
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Find the Adopted element, then the p within, then the text within
    expect(wrapper.find('Adopted p').text()).toContain('Child');
    expect(wrapper.contains(<Adopted />)).toBe(true);
  });
});
