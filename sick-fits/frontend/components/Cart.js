// Dependencies
import React from 'react';
import { adopt } from 'react-adopt';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

// Components
import User from './User';
import CartItem from './CartItem';
import TakeMoneys from './TakeMoneys';

// Helpers
import formatMoney from '../lib/formatMoney';
import calcTotalPrice from '../lib/calcTotalPrice';

// GraphQL
const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

// Styles
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';

// Adopt
const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
  ),
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>
});

// React
const Cart = () => (
  <Composed>
    {({ user, toggleCart, localState }) => {
      const { me } = user.data;
      if (!me) return null;

      return (
        <CartStyles open={localState.data.cartOpen}>
          <header>
            <CloseButton className="close" onClick={toggleCart}>
              &times;
            </CloseButton>
            <Supreme>
              {me.name}
              {me.name[me.name.length - 1] === 's' ? "'" : "'s"} Cart
            </Supreme>
            <p>
              You have {me.cart.reduce((prev, item) => prev + item.quantity, 0)}{' '}
              Item(s) in your cart.
            </p>
          </header>
          <ul>
            {me.cart.map((item) => (
              <CartItem key={item.id} cartItem={item} />
            ))}
          </ul>
          <footer>
            <p>{formatMoney(calcTotalPrice(me.cart))}</p>
            {me.cart.length ? (
              <TakeMoneys>
                <SickButton>Checkout</SickButton>
              </TakeMoneys>
            ) : null}
          </footer>
        </CartStyles>
      );
    }}
  </Composed>
);

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
