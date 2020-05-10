// Dependencies
import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

// Helpers
import Form from './styles/Form';
import Error from './ErrorMessage';

// GraphQL
import { CURRENT_USER_QUERY } from './User';

const RESET_MUTATION = gql`
  mutation RESET_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`;

// React
class ResetPW extends Component {
  state = { password: '', confirmPassword: '' };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    return (
      <Mutation
        mutation={RESET_MUTATION}
        variables={{ resetToken: this.props.resetToken, ...this.state }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { loading, error, called }) => (
          <Form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault();
              await resetPassword();
              this.setState({ password: '', confirmPassword: '' });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Password Reset</h2>
              <Error error={error} />
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <label htmlFor="confirmPassword">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Password"
                  value={this.state.confirmPassword}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <button type="submit">
                {loading ? 'Resetting' : 'Reset Password'}
              </button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default ResetPW;
