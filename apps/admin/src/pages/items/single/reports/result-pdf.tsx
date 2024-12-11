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

export const ResultReportPage = () => {
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

  const { data: results = [], } = useQuery({
    queryKey: ["results"],
    queryFn: () => apiClient.getResults(),
    enabled: !!currentItem,
  });

  if (!currentItem || !event) return <div>Item not found</div>;

  return (
    <PDFViewer className="w-full h-screen">
      <ReportResultPdf
        eventDescription={event.description}
        eventName={event.name}
        results={results
          .filter((r) => r.result.itemId === currentItem.id)
          .sort((a, b) =>
            a.participant.chestNo.localeCompare(b.participant.chestNo)
          )}
        itemName={currentItem.name}
      />
    </PDFViewer>
  );
};

const ReportResultPdf = ({
  eventName,
  eventDescription,
  results,
  itemName,
}: {
  eventName?: string;
  eventDescription?: string | null;
  itemName?: string;
  results: {
    result: {
      id: number;
      createdAt: string | null;
      updatedAt: string | null;
      position: "first" | "second" | "third";
      points: number;
      itemId: number;
      registrationId: number;
    };
    participant: {
      id: number;
      chestNo: string;
      fullName: string;
      sectionId: number;
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
            <Text
              style={tw(
                "text-sm my-2 text-center font-semibold text-slate-900"
              )}
            >
              Results of {itemName}
            </Text>
            <View style={tw("flex flex-row w-full ")}>
              <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                <Text>Position</Text>
              </View>
              <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                <Text>Chest No</Text>
              </View>
              <View style={tw("border border-slate-200 px-1 w-[60%]")}>
                <Text>Name</Text>
              </View>

              <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                <Text>Points</Text>
              </View>
              <View style={tw("border border-slate-200 px-1 w-[10%]")}>
                <Text>Time</Text>
              </View>
            </View>
            {results.map((result) => (
              <View style={tw("flex flex-row w-full ")}>
                <View style={tw("px-1 border capitalize font-bold border-slate-200 w-[10%]")}>
                  <Text>{result.result.position}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  <Text>{result.participant.chestNo}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[60%]")}>
                  <Text>{result.participant.fullName}</Text>
                </View>
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  <Text>{result.result.points}</Text>
                </View>   
                <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                  {result.result.createdAt && (
                    <Text>
                      {format(new Date(result.result.createdAt), "hh:mm a")}
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
