import { ProtectedView } from "@/lib/auth";
import { Button } from "@sports/ui";
import { Link } from "react-router-dom";

export const ItemsSinglePage = () => {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="registrations">Registration</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="certificates">Certificates</Link>
        </Button>
        <Button size="lg" asChild className="px-16 text-lg py-12">
          <Link to="results">Results</Link>
        </Button>
        <ProtectedView requiredRole="manager">
          <Button size="lg" asChild className="px-16 text-lg py-12">
            <Link to="reports">Reports</Link>
          </Button>
          <Button size="lg" asChild className="px-16 text-lg py-12">
            <Link to="edit">Edit</Link>
          </Button>
        </ProtectedView>
      </div>
    </div>
  );
};
