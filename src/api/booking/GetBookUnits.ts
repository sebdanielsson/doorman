// src/api/booking/GetBookUnits.ts
import { getClient } from '../client';
import { Client } from 'soap';

interface GetBookUnitsArgs {
  loginguid: string;
}

export const GetBookUnits = async (args: GetBookUnitsArgs): Promise<any[]> => {
  const client: Client = await getClient();
  const [result] = await client.GetBookUnitsAsync(args);
  return result.GetBookUnitsResult;
};
