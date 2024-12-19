import { Button } from "@sports/ui";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@sports/ui";
import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { FileUpload } from "@/components/file-upload";
import { Editor } from "@monaco-editor/react";

export const singleCertTemplate = z
  .object({
    certificateElements: z.array(
      z.object({
        text: z.string().optional(),
        styles: z.object({}).passthrough(),
        variable: z.enum([
          "name",
          "eventName",
          "itemName",
          "position",
          "points",
          "date",
          "sectionName",
        ]).optional(),
      })
    ),
    height: z.number(),
    width: z.number(),
    fonts: z.array(z.string()),
    certificateBackground: z.string().optional(),
  })
  .optional();

const eventSchema = z.object({
  participationCertificate: z.string().optional(),
  participationBg: z.string().optional(),
  firstPrizeCertificate: z.string().optional(),
  firstPrizeCertificateBg: z.string().optional(),
  secondPrizeCertificate: z.string().optional(),
  secondPrizeCertificateBg: z.string().optional(),
  thirdPrizeCertificate: z.string().optional(),
  thirdPrizeCertificateBg: z.string().optional(),
});

export const CertificateInput = ({
  label,
  name,
  bgName,
}: {
  label: string;
  name:
    | "participationCertificate"
    | "firstPrizeCertificate"
    | "secondPrizeCertificate"
    | "thirdPrizeCertificate";
  bgName:
    | "participationBg"
    | "firstPrizeCertificateBg"
    | "secondPrizeCertificateBg"
    | "thirdPrizeCertificateBg";
}) => {
  const form = useFormContext<z.infer<typeof eventSchema>>();

  return (
    <div className="grid gap-y-2 border p-4 rounded-md bg-slate-50/40">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between">
              <FormLabel>{label}</FormLabel>

              <Button
                role="button"
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  field.onChange(`{
    "certificateElements": [
        {
            "text": "Sample Cert",
            "styles": {
                "position": "absolute",
                "top": 59
            }
        },
        {
            "variable": "name",
            "styles": {
                "position": "absolute",
                "top": 150
            }
        }
    ],
    "height": 300,
    "width": 499,
    "fonts": [
        "Roboto Condensed"
    ]
}`)
                }
              >
                Prefill Sample Data
              </Button>
            </div>
            <FormControl>
              <Editor
                height="200px"
                language="json"
                value={field.value}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={bgName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Background</FormLabel>
            <FormControl>
              <div className="flex gap-4">
                {field.value && (
                  <img
                    src={field.value}
                    className="w-full rounded-md overflow-hidden h-[78px] object-cover"
                  />
                )}
                <FileUpload onFileUpload={({ url }) => field.onChange(url)} />
              </div>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
