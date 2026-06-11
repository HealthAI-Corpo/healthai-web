import { redirect } from "next/navigation";
import { APP_TARGET } from "@/lib/runtime";
import { RootRedirect } from "@/components/navigation/RootRedirect";

export default function Home() {
  if (APP_TARGET === "mobile") {
    return <RootRedirect href="/overview" />;
  }

  redirect("/overview");
}
