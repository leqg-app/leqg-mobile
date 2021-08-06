import { post } from './index';

function signUp(data) {
  return post('/auth/local/register', data);
}

function signIn(data) {
  return post('/auth/local', data);
}

export { signUp, signIn };
