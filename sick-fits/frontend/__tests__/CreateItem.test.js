// Enzyme
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import Router from 'next/router';

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem';

// Helpers
import { fakeItem, fakeUser } from '../lib/testUtils';

// Mock Global Fetch API (Browser functionality)
const dogImage = 'https://dog.com/dog.jpg';
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }]
  })
});

describe('<CreateItem/>', () => {
  it('renders and matches snapshot', () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="createItem"]');
    expect(toJson(form)).toMatchSnapshot();
  });

  it('uploads a file when changed', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const input = wrapper.find('input[type="file"]');
    input.simulate('change', { target: { files: ['fakedog.jpg'] } });
    await wait();

    const component = wrapper.find('CreateItem').instance();
    expect(component.state.image).toEqual(dogImage);
    expect(component.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();

    /**
     * https://jestjs.io/docs/en/mock-function-api#mockfnmockclear
     * https://jestjs.io/docs/en/mock-function-api#mockfnmockreset
     */
    global.fetch.mockReset();
  });

  it('handles state updates', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    wrapper.find('#title').simulate('change', {
      target: { name: 'title', value: 'testing title' }
    });

    wrapper.find('#price').simulate('change', {
      target: { name: 'price', value: 50000, type: 'number' }
    });

    wrapper.find('#description').simulate('change', {
      target: { name: 'description', value: 'testing description' }
    });

    expect(wrapper.find('CreateItem').instance().state).toMatchObject({
      title: 'testing title',
      price: 50000,
      description: 'testing description'
    });
  });

  it('creates an item when the form is submitted', async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTATION,
          variables: {
            title: item.title,
            description: item.description,
            image: '',
            largeImage: '',
            price: item.price
          }
        },
        result: {
          data: {
            createItem: {
              ...fakeItem(),
              __typename: 'Item'
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    wrapper.find('#title').simulate('change', {
      target: { name: 'title', value: item.title }
    });

    wrapper.find('#price').simulate('change', {
      target: { name: 'price', value: item.price, type: 'number' }
    });

    wrapper.find('#description').simulate('change', {
      target: { name: 'description', value: item.description }
    });

    Router.router = { push: jest.fn() };
    wrapper.find('form').simulate('submit');
    await wait(50);

    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: '/item',
      query: { id: 'abc123' }
    });
  });
});
