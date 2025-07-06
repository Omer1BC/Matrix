import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import {Main} from "../home/index"
export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return <Main />;
}
