import { Welcome } from "../welcome/welcome";
import {Main} from "../templates/interactive_page"
export function meta({}) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}


export default function Home() {
  return <Main />;
}
