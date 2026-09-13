import loginRequired from '@/lib/entities/users/loginRequired';
import { getDreamById } from '@/lib/entities/dreams/repository';

const getUserDreamById = async (dreamId: string) => {
  const id = Number(dreamId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const user = await loginRequired();

  const dream = await getDreamById(id, user.id);

  return dream;
};

export default getUserDreamById;
