// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

// GraphQL
const REMOVE_FROM_CART_MUTATION = gql`
  mutation REMOVE_FROM_CART_MUTATION($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

// Helpers
import { CURRENT_USER_QUERY } from './User';

// Styled
const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${(props) => props.theme.red};
    cursor: pointer;
  }
`;

class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  };

  // Called when a response is received from the server
  // after the mutation has been performed
  update = (cache, payload) => {
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });

    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter(
      (cartItem) => cartItem.id !== cartItemId
    );

    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };

  render() {
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: { __typename: 'CartItem', id: this.props.id }
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="Delete Item"
            onClick={() => removeFromCart().catch((err) => alert(err.message))}
            disabled={loading}
            aria-busy={loading}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

export default RemoveFromCart;
export { REMOVE_FROM_CART_MUTATION };
