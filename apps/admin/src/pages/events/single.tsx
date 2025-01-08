import { format } from "date-fns";
import { CalendarIcon, ClockIcon, AwardIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@sports/ui";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useParams } from "react-router-dom";

export default function EventSinglePage() {
  // In a real application, you would fetch this data based on the event ID.

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  const eventId = useParams().eventId;

  const event = events.find((event) => event.id === Number(eventId));
 if (isLoading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="relative h-96">
     {event.image &&   <img
          src={event.image}
          alt={event.name}
          className="brightness-50 object-cover w-full h-full"
        />}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{event.name}</h1>
          <p className="text-xl md:text-2xl">
            {format(new Date(event.startDate), "MMMM d, yyyy")} -{" "}
            {format(new Date(event.endDate), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Event Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{event.description}</p>
              </CardContent>
            </Card>

            {/* Registration Details */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Maximum registrations per participant:{" "}
                  {event.maxRegistrationPerParticipant}
                </p>
                {event.registrationStartDate && event.registrationEndDate ? (
                  <p>
                    Registration Period:{" "}
                    {format(
                      new Date(event.registrationStartDate),
                      "MMMM d, yyyy"
                    )}{" "}
                    -{" "}
                    {format(
                      new Date(event.registrationEndDate),
                      "MMMM d, yyyy"
                    )}
                  </p>
                ) : (
                  <p>Registration dates not specified</p>
                )}
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader>
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {event.certificateTemplates && Object.entries(event.certificateTemplates).map(
                    ([type]) => (
                      <div key={type} className="text-center">
                        <div className="bg-gray-200 p-4 rounded-lg mb-2">
                          <AwardIcon className="mx-auto h-12 w-12 text-gray-500" />
                        </div>
                        <p className="font-semibold capitalize">{type}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Event Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2" />
                  <div>
                    <p className="font-semibold">Start Date</p>
                    <p>{format(new Date(event.startDate), "MMMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2" />
                  <div>
                    <p className="font-semibold">End Date</p>
                    <p>{format(new Date(event.endDate), "MMMM d, yyyy")}</p>
                  </div>
                </div>
                {event.eventStartTime && event.eventEndTime && (
                  <div className="flex items-center">
                    <ClockIcon className="mr-2" />
                    <div>
                      <p className="font-semibold">Event Time</p>
                      <p>
                        {event.eventStartTime} - {event.eventEndTime}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p>For more details, please contact the event organizers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
