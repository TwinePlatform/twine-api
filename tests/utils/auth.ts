import * as Shot from 'shot';
import * as Cookie from 'cookie';

export const getCookie = (res: Shot.ResponseObject) => {
  const cookie = Cookie.parse(res.headers['set-cookie'][0]);
  return cookie['tw-api-session'];
};
