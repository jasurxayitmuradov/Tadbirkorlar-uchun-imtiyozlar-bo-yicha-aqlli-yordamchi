const USER_KEY = 'bn_user';
const SESSION_KEY = 'bn_session';

const simpleHash = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return `mvp_${Math.abs(hash)}`;
};

export const getUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (!user.plan) user.plan = 'freemium';
    return user;
  } catch {
    return null;
  }
};

export const isAuthed = () => {
  const session = localStorage.getItem(SESSION_KEY);
  return session === 'true' && !!getUser();
};

export const register = ({ firstName, lastName, email, password }) => {
  const user = {
    firstName,
    lastName,
    email,
    passwordHash: simpleHash(password),
    plan: 'freemium',
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(SESSION_KEY, 'true');
  localStorage.setItem(
    'user_profile',
    JSON.stringify({ name: firstName, region: 'Barcha hududlar' })
  );
  return user;
};

export const login = ({ email, password }) => {
  const user = getUser();
  if (!user) return { ok: false };
  if (!user.plan) user.plan = 'freemium';
  const isMatch = user.email === email && user.passwordHash === simpleHash(password);
  if (!isMatch) return { ok: false };
  localStorage.setItem(SESSION_KEY, 'true');
  const existingProfile = localStorage.getItem('user_profile');
  if (!existingProfile) {
    localStorage.setItem(
      'user_profile',
      JSON.stringify({ name: user.firstName, region: 'Barcha hududlar' })
    );
  }
  return { ok: true, user };
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('user_profile');
};

export const setPlan = (plan) => {
  const user = getUser();
  if (!user) return;
  user.plan = plan;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};
