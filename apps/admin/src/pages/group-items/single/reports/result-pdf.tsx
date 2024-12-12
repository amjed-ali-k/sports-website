import { apiClient } from "@/lib/api";
import { tw } from "@/lib/pdf";
import { cn } from "@/lib/utils";
import { Document, Page, Text, View, PDFViewer } from "@react-pdf/renderer";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

export const GroupResultReportPage = () => {
  const { itemId } = useParams();

  const { data: items = [] } = useQuery({
    queryKey: ["group-items"],
    queryFn: () => apiClient.getGroupItems(),
  });

  const currentItem = items?.find((item) => item.id === Number(itemId));

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => apiClient.getEvents(),
  });

  const event = events?.find((event) => event.id === currentItem?.eventId);

  const { data: results = [] } = useQuery({
    queryKey: ["group-results"],
    queryFn: () => apiClient.getGroupResults(),
    enabled: !!currentItem,
  });

  if (!currentItem || !event) return <div>Item not found</div>;

  return (
    <PDFViewer className="w-full h-screen">
      <ReportResultPdf
        eventDescription={event.description}
        eventName={event.name}
        results={results
          .filter((r) => r.result.groupItemId === currentItem.id)
          .sort((a, b) =>
            a.result.points - b.result.points > 0
              ? -1
              : a.result.points - b.result.points < 0
                ? 1
                : 0
          )}
        itemName={currentItem.name}
        itemGender={currentItem.gender}
      />
    </PDFViewer>
  );
};

const ReportResultPdf = ({
  eventName,
  eventDescription,
  results,
  itemGender,
  itemName,
}: {
  eventName?: string;
  eventDescription?: string | null;
  itemName?: string;
  itemGender?: string;
  results: {
    result: {
      id: number;
      createdAt: string;
      groupItemId: number;
      groupRegistrationId: number;
      position: "first" | "second" | "third";
      points: number;
    };
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
          <View
            style={tw(
              cn("w-full border-y  mb-4", {
                "bg-indigo-50 border-indigo-200": itemGender === "male",
                "bg-pink-100 border-pink-200": itemGender === "female",
                "bg-sky-50 border-sky-200": itemGender === "any",
              })
            )}
          >
            <Text
              style={tw(
                "text-xs mt-2 mb-0 leading-3 text-center  font-body text-slate-500"
              )}
            >
              Final Result
            </Text>
            <Text
              style={tw(
                "text-xl capitalize my-2 text-center font-body font-semibold text-slate-900"
              )}
            >
              {itemName} [{itemGender}]
            </Text>
          </View>
          {results.map((result) => {
            const participants = JSON.parse(result.participants) as {
              id: number;
              name: string;
              chestNo: string;
              sectionId: number;
              sectionName: string;
              batch: string;
            }[];
            return (
              <View style={tw(" px-4 w-full font-body text-sm")}>
                <View style={tw("")}>
                  <Text
                    style={tw(
                      `text-sm text-center mt-1 font-medium ${
                        result.result.position === "first"
                          ? "text-amber-600"
                          : result.result.position === "second"
                            ? "text-slate-600"
                            : "text-rose-600"
                      }`
                    )}
                  >
                    {result.registration.name ?? "GROUP"} •{" "}
                    {result.result.position.toUpperCase()} PLACE •{" "}
                    {result.result.points} Points
                  </Text>
                </View>
                <View style={tw("flex flex-row mx-auto font-bold bg-slate-50")}>
                  <View
                    style={tw("border border-slate-200 px-1 py-1  w-[10%]")}
                  >
                    <Text>Position</Text>
                  </View>
                  <View
                    style={tw("border border-slate-200 px-1 py-1  w-[10%]")}
                  >
                    <Text>Chest No</Text>
                  </View>
                  <View
                    style={tw("border border-slate-200 px-1 py-1  w-[40%]")}
                  >
                    <Text>Name</Text>
                  </View>
                  <View
                    style={tw("border border-slate-200 px-1 py-1  w-[20%]")}
                  >
                    <Text>Section</Text>
                  </View>
                  <View
                    style={tw("border border-slate-200 px-1 py-1  w-[20%]")}
                  >
                    <Text>Remarks</Text>
                  </View>
                </View>
                {participants.map((e) => (
                  <View style={tw("flex flex-row mx-auto ")}>
                    <View
                      style={tw(
                        `px-1 border capitalize font-bold border-slate-200 w-[10%] ${
                          result.result.position === "first"
                            ? "text-amber-600"
                            : result.result.position === "second"
                              ? "text-slate-600"
                              : "text-rose-600"
                        }`
                      )}
                    >
                      <Text>{result.result.position}</Text>
                    </View>
                    <View style={tw("px-1 border border-slate-200 w-[10%]")}>
                      <Text>{e.chestNo}</Text>
                    </View>
                    <View style={tw("px-1 border border-slate-200 w-[40%]")}>
                      <Text>{e.name}</Text>
                    </View>
                    <View style={tw("border border-slate-200 px-1 w-[20%]")}>
                      <Text>{e.sectionName}</Text>
                    </View>

                    <View
                      style={tw("px-1 border border-slate-200 w-[20%]")}
                    ></View>
                  </View>
                ))}
              </View>
            );
          })}
          {results.length === 0 && (
            <View
              style={tw(
                "h-16 px-24 rounded-xl bg-slate-50 flex items-center flex-row justify-center font-body text-sm"
              )}
            >
              <Text
                style={tw(
                  "text-sm my-2 text-center font-semibold text-slate-900"
                )}
              >
                No results found
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
