// Dependencies
import React, { Component } from 'react';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import StripeCheckout from 'react-stripe-checkout';
import nProgress from 'nprogress';

// GraphQL
const CREATE_ORDER_MUTATION = gql`
  mutation CREATE_ORDER_MUTATION($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`;

// Helpers
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';
import Order from '../pages/order';

const totalItems = (items) =>
  items.reduce((tally, item) => tally + item.quantity, 0);

// React
class TakeMoneys extends Component {
  onToken = async (res, createOrder) => {
    nProgress.start();

    const order = await createOrder({
      variables: {
        token: res.id
      }
    }).catch((err) => {
      alert(err.message);
    });

    Router.push({
      pathname: '/order',
      query: { id: order.data.createOrder.id }
    });
  };

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <Mutation
            mutation={CREATE_ORDER_MUTATION}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
          >
            {(createOrder) => (
              <StripeCheckout
                amount={calcTotalPrice(me.cart)}
                name="Sick Fits"
                description={`Order of ${totalItems(me.cart)} items!`}
                image={
                  me.cart.length && me.cart[0].item && me.cart[0].item.image
                }
                stripeKey="pk_test_wQOcQMzlB9frKhhPFWzeMsy300uRmCyaL2"
                currency="USD"
                email={me.email}
                token={(res) => this.onToken(res, createOrder)}
              >
                {this.props.children}
              </StripeCheckout>
            )}
          </Mutation>
        )}
      </User>
    );
  }
}
export default TakeMoneys;
