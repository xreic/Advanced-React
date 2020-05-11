// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Helpers
import { fakeItem } from '../lib/testUtils';

// Testees
import SingleItem, { SINGLE_ITEM_QUERY } from '../components/SingleItem';

describe('<SingleItem/>', () => {
  it('renders with proper data', async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' } },
        result: { data: { item: fakeItem() } }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );

    expect(wrapper.text()).toContain('Loading...');
    await wait();
    wrapper.update();

    expect(toJson(wrapper.find('h2'))).toMatchSnapshot();
    expect(toJson(wrapper.find('img'))).toMatchSnapshot();
    expect(toJson(wrapper.find('p'))).toMatchSnapshot();
  });

  // Unsure where the error is
  xit('Errors when an item is not found', async () => {
    const mocks = [
      {
        request: { query: SINGLE_ITEM_QUERY, variables: { id: '123' } },
        result: {
          errors: [{ message: 'Items Not Found!' }]
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();

    const item = wrapper.find('[data-test="graphql-error"]');
    expect(toJson(item)).toMatchSnapshot();
  });
});
