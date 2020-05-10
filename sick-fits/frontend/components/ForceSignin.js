// Dependencies
import { Query } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';

// Components
import Signin from './Signin';

const ForceSignin = (props) => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading }) => {
      if (loading) return <p>Loading...</p>;
      if (!data.me) {
        return (
          <React.Fragment>
            <p>Sign in before trying to sell items.</p>
            <Signin />
          </React.Fragment>
        );
      }
      return props.children;
    }}
  </Query>
);

export default ForceSignin;
