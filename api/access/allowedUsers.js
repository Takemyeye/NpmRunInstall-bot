import dotenv from 'dotenv';
dotenv.config();

const allowedUsersEnv = process.env.ALLOWED_USERS || '';
const allowedUsers = allowedUsersEnv.split(',').map(u => u.trim()).filter(u => u.length > 0);

export function isUserAllowed(username) {
  return allowedUsers.includes(username);
}
