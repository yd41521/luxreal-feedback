import { Suspense } from "react";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
