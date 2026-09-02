import { getDreams } from "@/entities/dreams/repository";
import loginRequired from "@/features/auth/loginRequired";

const getUserDreams = async () => {
  const user = await loginRequired();

  const dreams = await getDreams(user.id);

  return dreams;
};

export default getUserDreams;
