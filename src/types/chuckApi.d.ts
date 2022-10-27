import apiResponse from '../data/chuck.json';

export type ChuckApiResponse = typeof apiResponse;
export type ChuckQuote = typeof apiResponse.result[0];
