import { auth } from '@clerk/nextjs';
import { Prisma } from '@prisma/client';
import { prisma } from './db';

type Params =
  | {
      include?: Prisma.UserInclude;
    }
  | {
      select?: Prisma.UserSelect;
    };

export const getUserByClerkID = async (params: Params = {}) => {
  const { userId } = await auth();

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      clerkId: userId as string,
    },
    ...params,
  });

  return user;
};
