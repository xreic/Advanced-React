// Dependencies
import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

// Helpers
import Form from './styles/Form';
import Error from './ErrorMessage';

// GraphQL
import { CURRENT_USER_QUERY } from './User';

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

// React
class RequestReset extends Component {
  state = { name: '' };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    return (
      <Mutation
        mutation={REQUEST_RESET_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(requestReset, { loading, error, called }) => (
          <Form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault();
              await requestReset();
              this.setState({ email: '' });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request Password Reset</h2>
              <Error error={error} />
              {!error && !loading && called && (
                <p>Check your email for the reset link.</p>
              )}
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <button type="submit">
                {loading ? 'Requesting' : 'Request Reset'}
              </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default RequestReset;
