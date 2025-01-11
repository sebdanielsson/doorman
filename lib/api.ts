import axios from 'axios';

export const login = async (apiUrl: string, username: string, password: string) => {
  const systemname = new URL(apiUrl).pathname.split('/')[1];
  console.log('systemname', systemname);
  console.log('username', username);
  console.log('password', password);
  console.log('apiUrl', apiUrl);
  const response = await axios.post(`${apiUrl}/mobile/visionmobile.asmx`, {
    systemname,
    username,
    password,
    timeout: 60,
  }, {
    headers: {
      'SOAPAction': 'http://www.rco.se/Api/Mobile/Login'
    }
  });
  return response.data;
};

export const getUser = async (apiUrl: string, loginguid: string) => {
  const response = await axios.get(`${apiUrl}/mobile/visionmobile.asmx`, {
    params: { loginguid },
    headers: {
      'SOAPAction': 'http://www.rco.se/Api/Mobile/GetUserData'
    }
  });
  return response.data;
};
