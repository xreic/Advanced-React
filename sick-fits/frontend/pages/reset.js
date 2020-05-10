// Components
import ResetPW from '../components/ResetPW';

const Reset = (props) => {
  return (
    <div>
      <ResetPW resetToken={props.query.resetToken} />
    </div>
  );
};

export default Reset;
