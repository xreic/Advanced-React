// Dependencies
import Link from 'next/link';
import { Mutation } from 'react-apollo';

// Helpers
import { TOGGLE_CART_MUTATION } from './Cart';

// Components
import User from './User';
import Signout from './Signout';

// Styles
import NavStyles from './styles/NavStyles';
import CartCount from './CartCount';

// React
const Nav = () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles data-test="nav">
        <Link href="/items">
          <a>Shop</a>
        </Link>
        {me && (
          <React.Fragment>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/me">
              <a>Account</a>
            </Link>
            <Signout />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {(toggleCart) => (
                <button onClick={toggleCart}>
                  My Cart{' '}
                  {
                    <CartCount
                      count={me.cart.reduce(
                        (prev, item) => prev + item.quantity,
                        0
                      )}
                    />
                  }
                </button>
              )}
            </Mutation>
          </React.Fragment>
        )}

        {!me && (
          <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;
