import { apiClient } from "@/lib/api";
import { tw } from "@/lib/pdf";
import { Document, Page, Text, View, PDFViewer } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const GroupRegistrationReportPage = () => {
  const { itemId } = useParams();

  const { data: items = [] } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["sections"],
    queryFn: () => apiClient.getSections(),
  });
  const currentItem = items?.find((item) => item.id === Number(itemId));

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  const event = events?.find((event) => event.id === currentItem?.eventId);

  const { data: registrations = [] } = useQuery({
    queryKey: ["group-registrations"],
    queryFn: () => apiClient.getGroupRegistrations(),
  });

  if (!currentItem || !event) return <div>Item not found</div>;

  return (
    <PDFViewer className="w-full h-screen">
      <ReportRegistrationPdf
        eventDescription={event.description}
        eventName={event.name}
        registrations={registrations.filter(
          (r) => r.item.id === currentItem.id
        )}
        itemName={currentItem.name}
        itemGender={currentItem.gender}
        sections={sections}
      />
    </PDFViewer>
  );
};

const ReportRegistrationPdf = ({
  eventName,
  eventDescription,
  registrations,
  itemName,
  itemGender,
  sections,
}: {
  eventName?: string;
  eventDescription?: string | null;
  itemName?: string;
  itemGender?: string;
  sections: {
    id: number;
    name: string;
    organizationId: number;
    logo: string | null;
    color: string | null;
    description: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  }[];
  registrations: {
    registration: {
      id: number;
      name: string | null;
      createdAt: string;
      groupItemId: number;
      participantIds: string;
    };
    item: {
      id: number;
      name: string;
      createdAt: string;
      gender: "male" | "female" | "any";
      pointsFirst: number;
      pointsSecond: number;
      pointsThird: number;
      iconName: string | null;
      canRegister: number;
      isFinished: number;
      isResultPublished: number;
      eventId: number;
      maxParticipants: number;
      minParticipants: number;
    };
    participants: string;
  }[];
}) => {
  return (
    <Document>
      <Page size="A4">
        <View style={{ alignItems: "center" }}>
          <View
            style={tw(
              "border font-body bg-sky-50 border-slate-200 w-full flex gap-x-8 flex-col items-center px-2 py-4"
            )}
          >
            <Text style={tw("text-lg font-bold font-sans leading-5")}>
              {eventName}
            </Text>
            <Text style={tw("text-sm text-slate-700")}>{eventDescription}</Text>
          </View>
          <Text
            style={tw("text-sm my-2 text-center font-body font-semibold text-slate-900")}
          >
            Registrations for {itemName} [{itemGender}]
          </Text>
          {registrations.map((registration) => {
            const participants = JSON.parse(registration.participants) as {
              id: number;
              name: string;
              chestNo: string;
              sectionId: number;
              sectionName: string;
              batch: string;
            }[];
            return (
              <View style={tw("mb-8 px-4 mx-auto font-body text-sm")}>
                <Text
                  style={tw(
                    "text-sm my-2 text-center font-semibold text-slate-900"
                  )}
                >
                  {registration.registration.name}
                </Text>
                <View style={tw("flex flex-row w-full ")}>
                  <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                    <Text>Id</Text>
                  </View>
                  <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                    <Text>Chest No</Text>
                  </View>
                  <View style={tw("border border-slate-200 px-1 w-[40%]")}>
                    <Text>Name</Text>
                  </View>
                  <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                    <Text>Batch</Text>
                  </View>
                  <View style={tw("border border-slate-200 px-1 w-[20%]")}>
                    <Text>Section</Text>
                  </View>
                </View>
                {participants.map((e) => (
                  <View style={tw("flex flex-row w-full ")}>
                    <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                      <Text>{e.id}</Text>
                    </View>
                    <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                      <Text>{e.chestNo}</Text>
                    </View>
                    <View style={tw("px-1 border border-slate-200 w-[40%]")}>
                      <Text>{e.name}</Text>
                    </View>
                    <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                      <Text>{e.batch}</Text>
                    </View>
                    <View style={tw("px-1 border border-slate-200 w-[20%]")}>
                      <Text>
                        {sections.find((s) => s.id === e.sectionId)?.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};
