import axios from 'axios';

const API_URL = 'https://cshub.epr-apps.com/S0144BrfAsen/api/mobile/visionmobile.asmx';

export const login = async (systemname: string, username: string, password: string) => {
  const response = await axios.post(`${API_URL}/Login`, {
    systemname,
    username,
    password,
    timeout: 60,
  });
  return response.data;
};

export const getUser = async (loginguid: string) => {
  const response = await axios.get(`${API_URL}/GetUserData`, {
    params: { loginguid },
  });
  return response.data;
};
