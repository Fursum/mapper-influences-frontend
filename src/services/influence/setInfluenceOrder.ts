import axios from 'axios';

export function setInfluenceOrder(order: number[]) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/influence-order`;
  return axios.post(
    url,
    {
      influence_user_ids: order,
    },
    { withCredentials: true },
  );
}
