// Enzyme
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

// Testees
import ItemComponent from '../components/Item';

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 4000,
  description: 'This item is really cool!',
  image: 'dog.jpg',
  largeImage: 'largerdog.jpg'
};

xdescribe('Non-Snapshot Testing of <Item/>', () => {
  it('renders the price tag and title properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    // Testing the text within an HTML element
    const PriceTag = wrapper.find('PriceTag');
    expect(PriceTag.children().text()).toBe('$50');
    expect(PriceTag.dive().text()).toBe('$50');

    // Testing the text within a nested element
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
  });

  it('renders the image properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    // Testing the tags of an image element
    const img = wrapper.find('img');
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it('renders the buttons properly', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    // Finding based off of class
    const buttonList = wrapper.find('.buttonList');

    // Test amount of children within an element (only 1 level deep)
    expect(buttonList.children()).toHaveLength(3);

    // Ways to test if an element exists
    expect(buttonList.find('Link')).toHaveLength(1);
    expect(buttonList.find('Link').exists()).toBe(true);
    expect(buttonList.find('Link')).toBeTruthy();

    expect(buttonList.find('AddToCart').exists()).toBe(true);
    expect(buttonList.find('DeleteItem').exists()).toBe(true);
  });
});

describe('Snapshot Testing of <Item/>', () => {
  it('renders and matches the snapshot', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
