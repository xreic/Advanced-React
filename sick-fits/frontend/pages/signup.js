// Dependencies
import styled from 'styled-components';

// Components
import User from '../components/User';
import Signup from '../components/Signup';
import Signin from '../components/Signin';

// Styled
const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

// React
const SignUpPage = () => {
  return (
    <Columns>
      <Signup />
      <User>{({ data: { me } }) => !me && <Signin />}</User>
    </Columns>
  );
};

export default SignUpPage;
