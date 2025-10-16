import { listUsers } from '../models/user';

export async function listUsersService(params?: { 
  isVerified?: boolean; 
  search?: string; 
  page?: number; 
  limit?: number; 
}) {
  return listUsers(params);
}
