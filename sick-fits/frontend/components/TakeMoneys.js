// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import StripeCheckout from 'react-stripe-checkout';
import nProgress from 'nprogress';

// GraphQL

// Helpers
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

const totalItems = (items) =>
  items.reduce((tally, item) => (tally += item.quantity), 0);

// React
class TakeMoneys extends Component {
  static propTypes = {
    prop: PropTypes
  };

  onToken = (res) => {
    console.log(res);
  };

  render() {
    return (
      <User>
        {({ data: { me } }) => (
          <StripeCheckout
            amount={calcTotalPrice(me.cart)}
            name="Sick Fits"
            description={`Order of ${totalItems(me.cart)}`}
            image={me.cart[0].item && me.cart[0].item.image}
            stripeKey="pk_test_wQOcQMzlB9frKhhPFWzeMsy300uRmCyaL2"
            currency="USD"
            email={me.email}
            token={(res) => this.onToken(res)}
          >
            {this.props.children}
          </StripeCheckout>
        )}
      </User>
    );
  }
}
export default TakeMoneys;
