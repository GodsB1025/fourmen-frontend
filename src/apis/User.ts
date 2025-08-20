import api from "./Client";
import type { User } from "./Types";

export const getUser = async () : Promise<User> => {
    const { data } = await api.get('/user/me')
    return data.data
}