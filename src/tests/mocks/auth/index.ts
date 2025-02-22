import * as rawMockUser from './user.json';

export const mockUser = {
  ...rawMockUser,
  createdAt: new Date(rawMockUser.createdAt),
  updatedAt: new Date(rawMockUser.updatedAt),
};
