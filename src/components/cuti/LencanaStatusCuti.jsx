import { gayaStatusCuti } from "@/lib/kalkulasi-cuti";
import { Badge } from "@/components/ui/badge";

export default function LencanaStatusCuti({ status }) {
  return (
    <Badge variant="outline" className={gayaStatusCuti(status)}>
      {status}
    </Badge>
  );
}
