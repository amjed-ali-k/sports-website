import { Button } from "@sports/ui";
import { Link } from "react-router-dom";

export const ItemsSinglePage = () => {
  return (
    <div>
      <div className="flex gap-4 mt-4">
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="registrations">Registration</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="results">Results</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="reports">Reports</Link>
        </Button>
      </div>
    </div>
  );
};
