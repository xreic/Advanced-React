// Components
import ForceSignin from '../components/ForceSignin';
import PermissionsList from '../components/Permissions';

const Permissions = (props) => {
  return (
    <div>
      <ForceSignin>
        <PermissionsList />
      </ForceSignin>
    </div>
  );
};

export default Permissions;
