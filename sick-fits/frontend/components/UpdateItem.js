// Dependencies
import React, { Component } from 'react';
import Router from 'next/router';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

// Helpers
import Error from './ErrorMessage';

// Styles
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';

// GraphQL
const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
    }
  }
`;

// React
class UpdateItem extends Component {
  state = {};

  handleChange = (e) => {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;

    this.setState({ [name]: val });
  };

  updateItem = async (e, updateItemCallback) => {
    e.preventDefault();

    const res = await updateItemCallback({
      variables: {
        id: this.props.id,
        ...this.state
      }
    });
  };

  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (!data.item)
            return <p>Item does not exist! ID: {this.props.id}</p>;
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={(e) => this.updateItem(e, updateItem)}>
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        defaultValue={data.item.title}
                        onChange={this.handleChange}
                        required
                      />
                    </label>

                    <label htmlFor="Price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        defaultValue={data.item.price}
                        onChange={this.handleChange}
                        required
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Description"
                        defaultValue={data.item.description}
                        onChange={this.handleChange}
                        required
                      />
                    </label>
                    <button type="submit">
                      {loading ? 'Saving Changes' : 'Submit Changes'}
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };
