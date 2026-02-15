import { createAuthClient } from "better-auth/client";
import { writable } from "svelte/store";
import { adminClient } from "better-auth/client/plugins";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const client = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [
    adminClient()
  ]
});

export const session = writable(null);
export const isLoading = writable(true);

// Initial fetch
client
  .getSession()
  .then(({ data }) => {
    session.set(data);
    isLoading.set(false);
  })
  .catch((err) => {
    console.error("Failed to load session:", err);
    session.set(null);
    isLoading.set(false);
  });

export const signIn = async (email, password) => {
  const res = await client.signIn.email({ 
    email, 
    password,
  });
  
  if (!res.error) {
     // Fetch fresh session to ensure we have all data
     const { data } = await client.getSession();
     session.set(data);
  }
  return res;
};

export const signUp = async (email, password, name) => {
  const res = await client.signUp.email({ 
    email, 
    password, 
    name,
  });
  
  if (!res.error) {
     const { data } = await client.getSession();
     session.set(data);
  }
  return res;
};

export const signOut = async () => {
  await client.signOut();
  session.set(null);
};

export const authClient = client;
