import axios from 'axios';

export const login = async (apiUrl: string, systemname: string, username: string, password: string) => {
  const response = await axios.post(`${apiUrl}/Login`, {
    systemname,
    username,
    password,
    timeout: 60,
  });
  return response.data;
};

export const getUser = async (apiUrl: string, loginguid: string) => {
  const response = await axios.get(`${apiUrl}/GetUserData`, {
    params: { loginguid },
  });
  return response.data;
};
