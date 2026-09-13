import { getDreams } from '@/lib/entities/dreams/repository';
import loginRequired from '@/lib/entities/users/loginRequired';

const getUserDreams = async () => {
  const user = await loginRequired();

  const dreams = await getDreams(user.id);

  return dreams;
};

export default getUserDreams;
