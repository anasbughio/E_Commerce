import api from '../api/axios';


const Logout = async () => {
  try {
    await api.post('/auth/logout', {}, {
      headers: { 'x-csrf-token': csrf }
    });
  } catch (err) {
    console.error("Logout error", err);
  }
  setAccessToken(null);
  setCsrf(null);
};



export default Logout;