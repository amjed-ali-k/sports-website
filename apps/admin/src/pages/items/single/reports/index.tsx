import { Link, useParams } from "react-router-dom";
import { Button } from "@sports/ui";

export const ItemReportsPage = () => {
  return (
    <div>
      <Button>
        <Link to={`registration`}>Registration Report</Link>
      </Button>
    </div>
  );
};
