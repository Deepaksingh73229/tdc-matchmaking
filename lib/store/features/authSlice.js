import { createSlice } from "@reduxjs/toolkit";
import { storage } from '@/lib/utils/storage'

// Get token safely
const getInitialToken = () => {
    const tokenString = storage.getItem("token");

    if (tokenString) {
        try {
            return JSON.parse(tokenString);
        } catch (e) {
            return null;
        }
    }
    return null;
};

const initialState = {
    signupData: null,
    loading: false,
    token: getInitialToken()
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,

    reducers: {
        setSignupData(state, value) {
            state.signupData = value.payload
        },

        setLoading(state, value) {
            state.loading = value.payload
        },

        setToken(state, value) {
            state.token = value.payload
            storage.setItem("token", JSON.stringify(value.payload))
        }
    }
})

export const { setSignupData, setLoading, setToken } = authSlice.actions
export default authSlice.reducer