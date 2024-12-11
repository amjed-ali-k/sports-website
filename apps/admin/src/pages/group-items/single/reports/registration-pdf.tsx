import { apiClient } from "@/lib/api";
import { tw } from "@/lib/pdf";
import {
  Document,
  Page,
  Text,
  View,
  PDFViewer,
} from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useParams } from "react-router-dom";

export const RegistrationReportPage = () => {
  const { itemId } = useParams();

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => apiClient.getItems(),
  });

  const currentItem = items?.find(
    (item) => item.item.id === Number(itemId)
  )?.item;

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  const event = events?.find((event) => event.id === currentItem?.eventId);

  const { data: registrations = [] } =
    useQuery({
      queryKey: ["registrations"],
      queryFn: () => apiClient.getRegistrations(),
    });

  if (!currentItem || !event) return <div>Item not found</div>;

  return (
    <PDFViewer className="w-full h-screen">
      <ReportRegistrationPdf
        eventDescription={event.description}
        eventName={event.name}
        registrations={registrations.filter(r => r.item.id === currentItem.id).sort((a, b) => a.participant.chestNo.localeCompare(b.participant.chestNo))}
        itemName={currentItem.name}
      />
    </PDFViewer>
  );
};

const ReportRegistrationPdf = ({
  eventName,
  eventDescription,
  registrations,
  itemName,
}: {
  eventName?: string;
  eventDescription?: string | null;
  itemName?: string;
  registrations: {
    registration: {
      id: number;
      createdAt: string | null;
      updatedAt: string | null;
      itemId: number;
      participantId: number;
      metaInfo: string | null;
      status: "registered" | "participated" | "not_participated";
    };
    participant: {
      id: number;
      fullName: string;
      chestNo: string;
      sectionId: number;
      sectionName: string;
    };
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
          <View style={tw(" px-4 w-full font-body text-sm")}>
            <Text style={tw("text-sm my-2 text-center font-semibold text-slate-900")}>
              Registrations for {itemName}
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
              <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                <Text>Time</Text>
              </View>
            </View>
            {registrations.map((registration) => (
              <View style={tw("flex flex-row w-full ")}>
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  <Text>{registration.registration.id}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  <Text>{registration.participant.chestNo}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[40%]")}>
                  <Text>{registration.participant.fullName}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  <Text>{registration.participant.sectionId}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[20%]")}>
                  <Text>{registration.participant.sectionName}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  {registration.registration.createdAt && (
                    <Text>
                      {format(
                        new Date(registration.registration.createdAt),
                        "hh:mm a"
                      )}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};
