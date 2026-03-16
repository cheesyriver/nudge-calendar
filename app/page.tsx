import { Header } from "../components/Header";
import { Calendar } from "@/components/calendar/Calendar";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-20">
      <Header />
      <Calendar />
    </div>
  );
}