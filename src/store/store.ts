import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { TOKEN_KEY } from "@/lib/token";
import authReducer, { clearSession, setSession } from "./auth-slice";
import { projectApi } from "./api";

const listener = createListenerMiddleware();

listener.startListening({
  actionCreator: setSession,
  effect: (action) => {
    localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
  },
});

listener.startListening({
  actionCreator: clearSession,
  effect: (_action, api) => {
    localStorage.removeItem(TOKEN_KEY);
    api.dispatch(projectApi.util.resetApiState());
  },
});

export function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [projectApi.reducerPath]: projectApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault().concat(projectApi.middleware, listener.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
