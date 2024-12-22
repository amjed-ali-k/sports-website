import { useState } from "react";
import Dropzone from "react-dropzone";
import { filesize } from "filesize"; // Ensure you have this library installed
import { Button, Label } from "@sports/ui";
import { Image, Loader, Trash } from "lucide-react";
import { apiClient } from "@/lib/api";

export const FileUpload = ({
  onFileUpload,
}: {
  onFileUpload: (file: { url: string }) => Promise<void> | void;
}) => {
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]); // State to manage accepted files
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  return (
    <Dropzone
      accept={{
        "image/*": [".jpg", ".jpeg", ".png"],
      }}
      disabled={uploading}
      multiple={false}
      onDrop={(files) => {
        setAcceptedFiles(files);
        const fd = new FormData();
        fd.append("image", files[0]);
        setError(false);
        setUploading(true);
        apiClient
          .uploadFile(fd)
          .then((res: { url: string }) => {
            onFileUpload(res);
          })
          .catch(() => {
            setAcceptedFiles([]);
            setError(true);
          })
          .finally(() => {
            setUploading(false);
          });
      }}
      maxSize={5000000}
    >
      {({ getRootProps, getInputProps, inputRef }) => (
        <div
          {...getRootProps({
            className:
              "px-3 mb-4 flex flex-col items-center justify-center w-full rounded-md cursor-pointer border border-dashed border-[#e2e8f0]",
          })}
        >
          {acceptedFiles.length < 1 && (
            <div className="flex items-center gap-x-3 py-4">
              <Label
                htmlFor="Products"
                className="text-sm flex-col text-[7E8DA0] flex items-center cursor-pointer focus:outline-none focus:underline"
              >
                <Image />
                <div>Upload Image</div>
                <input
                  id="Products"
                  {...getInputProps()}
                  disabled={uploading}
                />
              </Label>
            </div>
          )}
          {acceptedFiles.length > 0 && (
            <div className="flex py-4 px-2 w-full rounded-md items-center gap-x-3">
              <div className="flex items-center">
                <Image className="mr-3" />
                <div className="text-sm">{acceptedFiles[0].name}</div>
                {uploading && <Loader className="ml-2 animate-spin" />}
              </div>
              <div className="text-sm ml-auto">
                {filesize(acceptedFiles[0].size)}
              </div>
              <Button
                type="button"
                variant="outline"
                className="border rounded-full p-2"
                onClick={() => {
                  setAcceptedFiles([]); // Clear the accepted files
                  if (inputRef.current) {
                    inputRef.current.value = ""; // Clear the file input
                  }
                  onFileUpload({ url: "" });
                }}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          )}
          {error && <p className="text-rose-600 text-xs pb-3">Uploading image failed. Try again!</p>}
        </div>
      )}
    </Dropzone>
  );
};
