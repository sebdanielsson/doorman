import soap, { Client } from 'soap';
import { API_ENDPOINT } from './config';

let client: Client | null = null;

export const getClient = async (): Promise<Client> => {
  if (!client) {
    client = await soap.createClientAsync(`${API_ENDPOINT}?wsdl`);
  }
  return client;
};
