// Dependencies
import React from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

// Components
import User from './User';
import CartItem from './CartItem';

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

const Cart = () => (
  <User>
    {({ data: { me } }) => {
      if (!me) return null;

      console.log(me);
      return (
        <Mutation mutation={TOGGLE_CART_MUTATION}>
          {(toggleCart) => (
            <Query query={LOCAL_STATE_QUERY}>
              {({ data }) => (
                <CartStyles open={data.cartOpen}>
                  <header>
                    <CloseButton className="close" onClick={toggleCart}>
                      &times;
                    </CloseButton>
                    <Supreme>
                      {me.name}
                      {me.name[me.name.length - 1] === 's' ? "'" : "'s"} Cart
                    </Supreme>
                    <p>You have {me.cart.length} Item(s) in your cart.</p>
                  </header>
                  <ul>
                    {me.cart.map((item) => (
                      <CartItem key={item.id} cartItem={item} />
                    ))}
                  </ul>
                  <footer>
                    <p>{formatMoney(calcTotalPrice(me.cart))}</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyles>
              )}
            </Query>
          )}
        </Mutation>
      );
    }}
  </User>
);

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
