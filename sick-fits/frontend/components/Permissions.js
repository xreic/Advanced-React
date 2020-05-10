// Dependencies
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

// Helpers
import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const perms = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONSUPDATE'
];

// GraphQL
const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UPDATE_PERMISSIONS_MUTATION(
    $userId: ID!
    $permissions: [Permission]
  ) {
    updatePermissions(userId: $userId, permissions: $permissions) {
      id
      name
      email
      permissions
    }
  }
`;

// React
const PermissionsList = () => {
  return (
    <Query query={ALL_USERS_QUERY}>
      {({ data, loading, error }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <Error error={error} />;
        return (
          <div>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {perms.map((perm, index) => (
                    <th key={index}>{perm}</th>
                  ))}
                  <th>👇</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <UserPermissions key={user.id} user={user} />
                ))}
              </tbody>
            </Table>
          </div>
        );
      }}
    </Query>
  );
};

class UserPermissions extends Component {
  static propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  };

  // Only use props to seed state
  state = {
    permissions: this.props.user.permissions
  };

  handleChange = (e, updatePermissionsCallback) => {
    const checkbox = e.target;

    let updatedPerms = [...this.state.permissions];

    if (checkbox.checked) updatedPerms.push(checkbox.value);
    else updatedPerms = updatedPerms.filter((perm) => perm !== checkbox.value);

    this.setState({ permissions: updatedPerms });
    updatePermissionsCallback();
  };

  render() {
    const { user } = this.props;

    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          userId: user.id,
          permissions: this.state.permissions
        }}
      >
        {(updatePermissions, { loading, error }) => (
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            {perms.map((perm, index) => (
              <td key={index}>
                <label htmlFor={`${user.id}-permission-${perm}`}>
                  <input
                    id={`${user.id}-permission-${perm}`}
                    type="checkbox"
                    checked={this.state.permissions.includes(perm)}
                    value={perm}
                    onChange={(e) => this.handleChange(e, updatePermissions)}
                  />
                </label>
              </td>
            ))}
            <td>
              <SickButton
                type="button"
                disabled={loading}
                aria-busy={loading}
                onClick={updatePermissions}
              >
                Updat{loading ? 'ing' : 'e'}
              </SickButton>
            </td>
          </tr>
        )}
      </Mutation>
    );
  }
}

export default PermissionsList;
