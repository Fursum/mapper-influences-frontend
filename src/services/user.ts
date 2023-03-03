import axios from "axios";

export async function getUserBase(userId?: string) {
  const route = "api/v1/user/get";
  const { data } = await axios.get(process.env.NEXT_PUBLIC_BACKEND_URL + route);
  return data;
}
