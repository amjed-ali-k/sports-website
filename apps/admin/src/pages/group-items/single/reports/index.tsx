import { Link } from "react-router-dom";
import { Button } from "@sports/ui";

export const GroupItemReportsPage = () => {
  return (
    <div>
        <div className="flex gap-4 mt-4">
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="registration">Registration Report</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="results">Result Report</Link>
        </Button>
      
      </div>
    </div>
  );
};
