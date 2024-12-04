// src/api/user/Login.ts
import { Client } from 'soap';
import { getClient } from '../client';
import { SYSTEMNAME } from '../config';

interface LoginArgs {
  systemname: string;
  username: string;
  Password: string;
  timeout: number;
}

export const Login = async (args: Omit<LoginArgs, 'systemname'>): Promise<string> => {
  const client: Client = await getClient();
  const request = {
    ...args,
    systemname: SYSTEMNAME,
  };
  console.log('Request sent to backend:', request);
  const [result] = await client.LoginAsync(request);
  console.log(result);
  return result.LoginResult;
};
