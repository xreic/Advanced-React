// Dependencies
import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

// GraphQL
import { CURRENT_USER_QUERY } from './User';

const ADD_TO_CART_MUTATION = gql`
  mutation ADD_TO_CART_MUTATION($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

// React
class AddToCart extends Component {
  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { loading }) => (
          <button onClick={addToCart} disabled={loading} aria-busy={loading}>
            Add{loading && 'ing'} To Cart
          </button>
        )}
      </Mutation>
    );
  }
}

export default AddToCart;
export { ADD_TO_CART_MUTATION };
