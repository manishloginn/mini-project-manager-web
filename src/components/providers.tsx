"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { TOKEN_KEY } from "@/lib/token";
import { markHydrated, setToken, setUser, clearSession } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useMeQuery } from "@/store/api";
import { makeStore, AppStore } from "@/store/store";
import { Loader } from "@/components/ui";

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const { data, error, isFetching, refetch } = useMeQuery(undefined, {
    skip: !hydrated || !token,
  });

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) dispatch(setToken(stored));
    dispatch(markHydrated());
  }, [dispatch]);

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  const sessionGone =
    !!error && "status" in error && (error.status === 401 || error.status === 404);

  useEffect(() => {
    if (sessionGone) dispatch(clearSession());
  }, [sessionGone, dispatch]);

  if (!hydrated || (token && !user && !error)) {
    return <Loader />;
  }

  if (token && error && !sessionGone) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <p className="text-sm text-danger">The server did not respond.</p>
        <button
          type="button"
          className="mt-4 text-sm text-accent underline"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}
