import { useQuery } from "@tanstack/react-query";
import { Button } from "@sports/ui";
import { ParticipantList } from "@/components/participants/participant-list";
import { apiClient } from "@/lib/api";
import { Import, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ParticipantsPage() {
  const { data: participants = [] } = useQuery({
    queryKey: ["participants"],
    queryFn: () => apiClient.getParticipants(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Participants</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="new">
              <Plus className="mr-2 h-4 w-4" />
              Add Participant
            </Link>
          </Button>
          <Button asChild>
            <Link to="import">
              <Import className="mr-2 h-4 w-4" />
              Import bulk
            </Link>
          </Button>
        </div>
      </div>

      <ParticipantList participants={participants.map((p) => p.participant)} />
    </div>
  );
}
