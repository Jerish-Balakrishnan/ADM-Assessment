import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
  tagTypes: ['Insights'],
  endpoints: (builder) => ({
    submitPrompt: builder.mutation({
      query: (data) => ({
        url: '/submit',
        method: 'POST',
        body: data,
      }),
    }),
    getInsights: builder.query({
      query: ({ page = 1, size = 10, contextId = null } = {}) => {
        let url = `/insights?page=${page}&size=${size}`;
        // if (contextId) url += `&contextId=${contextId}`;
        return url;
      },
      providesTags: ['Insights'],
    }),
  }),
});

export const { useSubmitPromptMutation, useGetInsightsQuery } = apiSlice;
