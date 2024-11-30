import { useRef, useState } from "react";
import { Button } from "@sports/ui";
import { Input } from "@sports/ui";
import { Alert, AlertDescription } from "@sports/ui";
import { Upload } from "lucide-react";
import Papa from "papaparse";

interface CSVRow {
  fullName: string;
  sectionId: string;
  semester: string;
  gender: string;
  avatar?: string;
}

interface CSVImportFormProps {
  onImport: (data: CSVRow[]) => void;
  isLoading: boolean;
}

export function CSVImportForm({ onImport, isLoading }: CSVImportFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredFields = ["fullName", "sectionId", "semester", "gender"];
        const headers = Object.keys(results.data[0] || {});

        const missingFields = requiredFields.filter(
          (field) => !headers.includes(field),
        );

        if (missingFields.length > 0) {
          setError(`Missing required fields: ${missingFields.join(", ")}`);
          return;
        }

        const validData = results.data.filter((row: any) => {
          return (
            row.fullName &&
            row.sectionId &&
            row.semester &&
            ["male", "female"].includes(row.gender.toLowerCase())
          );
        });

        if (validData.length === 0) {
          setError("No valid data found in CSV");
          return;
        }

        setError("");
        onImport(validData as CSVRow[]);
      },
      error: () => {
        setError("Failed to parse CSV file");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Importing..." : "Select CSV File"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground">
        <p>CSV file should contain the following columns:</p>
        <ul className="list-disc list-inside mt-2">
          <li>fullName (required)</li>
          <li>sectionId (required, number 1-4)</li>
          <li>semester (required, number 1-8)</li>
          <li>gender (required, 'male' or 'female')</li>
          <li>avatar (optional, URL)</li>
        </ul>
      </div>
    </div>
  );
}
