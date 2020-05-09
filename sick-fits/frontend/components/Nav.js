// Dependencies
import Link from 'next/link';

// Styled Components
import NavStyles from './styles/NavStyles';
import User from './User';

const Nav = (props) => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/items">
          <a>Shop</a>
        </Link>
        {me && (
          <React.Fragment>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/signup">
              <a>Sign In</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
          </React.Fragment>
        )}

        {!me && (
          <Link href="/me">
            <a>Account</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;
