// Dependencies
import styled from 'styled-components';

// Components
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
      <Signin />
    </Columns>
  );
};

export default SignUpPage;
