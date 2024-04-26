import jwt_decode from 'jwt-decode';
import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

interface TokenData {
    userId: string;
    email: string;
    role: string;
    verified: boolean;
  }

export interface IAuthState {
    token: string | null;
    refresh_token: string | null;
    loggedIn: boolean;
    email?: string | null;
    verified: boolean | null;
}

export const defaultState: IAuthState = {
    token: null,
    refresh_token: null,
    loggedIn: false,
    verified: null,
};

export const authState = atom({
    key: 'auth',
    default: defaultState,
    effects_UNSTABLE: [persistAtom],
});

export const tokenState = selector({
    key: 'token',
    get: ({ get }) => {
        const state = get(authState);
        console.log("Estado actual de authState:", state);
        return state.token;
    },
});

export const tokenData = selector({
    key: 'token_data',
    get: ({ get }) => {
        console.log("entra a")
        const token = get(authState)?.token;
        if (typeof token === 'string' && token.length > 0) {
            const decodedValue = jwt_decode<TokenData>(token);
            return decodedValue;
        } else {
            return null;
        }
    },
});


export const emailSelector = selector({
    key: 'email',
    get: ({ get }) => {
        console.log("entra b")
        const email = get(authState)?.email;
        return email;
    },
});

export const verifiedSelector = selector({
    key: 'verified',
    get: ({ get }) => {
        console.log("entra c")
        const verified = get(authState)?.verified;
        return verified;
    },
});

export const refreshTokenState = selector({
    key: 'refresh_token',
    get: ({ get }) => {
        console.log("entra f")
        const state = get(authState);
        return state.token;
    },
});

export const loggedInState = selector({
    key: 'loggedIn',
    get: ({ get }) => {
        console.log("entra e")
        const state = get(authState);
        return state.loggedIn;
    },
});
