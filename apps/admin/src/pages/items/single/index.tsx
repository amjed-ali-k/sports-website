import { Button } from "@sports/ui";
import { Link } from "react-router-dom";

export const ItemsSinglePage = () => {
  return (
    <div>
      <div className="flex gap-4 mt-4 flex-wrap">
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="registrations">Registration</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="results">Results</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="reports">Reports</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="edit">Edit</Link>
        </Button>
      </div>
    </div>
  );
};
