// Enzyne
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

// Router
import Router from 'next/router';
Router.router = {
  push() {},
  prefetch() {}
};

// Apollo
import { MockedProvider } from 'react-apollo/test-utils';
import wait from 'waait';

// Testees
import Pagination, { PAGINATION_QUERY } from '../components/Pagination';

// Helpers
const makeMocksFor = (length) => {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: 'aggregate',
            aggregate: {
              __typename: 'count',
              count: length
            }
          }
        }
      }
    }
  ];
};

describe('<Pagination/>', () => {
  it('displays a loading message', () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    expect(wrapper.text()).toContain('Loading...');
  });

  it('renders pagination for 18 items', async () => {
    const numItems = 18;
    const itemsPerPage = 4;

    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(numItems)}>
        <Pagination page={1} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Count number of pages
    expect(wrapper.find('.totalPages').text()).toEqual(
      Math.ceil(numItems / itemsPerPage).toString()
    );

    const nav = wrapper.find('div[data-test="pagination"]');
    expect(toJson(nav)).toMatchSnapshot();
  });

  it('disables prev button on first page', async () => {
    const numItems = 18;
    const firstPage = 1;
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(numItems)}>
        <Pagination page={firstPage} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Finds the <a> with a className of prev or next
    // Then checks the aria-disabled value
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(true);
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
  });
  it('disables next button on last page', async () => {
    const numItems = 18;
    const itemsPerPage = 4;

    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(numItems)}>
        <Pagination page={Math.ceil(numItems / itemsPerPage)} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Finds the <a> with a className of prev or next
    // Then checks the aria-disabled value
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(true);
  });
  it('enables all buttons on middle pages', async () => {
    const numItems = 18;
    const itemsPerPage = 4;

    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(numItems)}>
        <Pagination page={Math.ceil(numItems / itemsPerPage) / 2} />
      </MockedProvider>
    );

    await wait();
    wrapper.update();

    // Finds the <a> with a className of prev or next
    // Then checks the aria-disabled value
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false);
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false);
  });
});
