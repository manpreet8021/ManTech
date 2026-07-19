import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {BASE_URL} from '@env';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers, {getState}) => {
    const token = await EncryptedStorage.getItem('token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWith401Handler = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    // await removeAsyncStorageData(ACCOUNT_PARTIAL_CREATED)
    // await removeAsyncStorageData(ACCOUNT_CREATED)
    // api.dispatch(setShowScreen('loggedIn'));
  }

  return result.error ? Promise.reject(result) : result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWith401Handler,
  endpoints: builder => ({}),
});
