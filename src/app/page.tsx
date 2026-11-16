"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { Loader } from "@/components/ui";

export default function HomePage() {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    router.replace(token ? "/projects" : "/login");
  }, [token, router]);

  return <Loader />;
}
