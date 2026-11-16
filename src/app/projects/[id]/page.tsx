import { Suspense } from "react";
import { ProjectDetailView } from "@/components/project-detail-view";
import { Loader } from "@/components/ui";

export default function ProjectPage() {
  return (
    <Suspense fallback={<Loader label="Loading project…" />}>
      <ProjectDetailView />
    </Suspense>
  );
}
