import React, { ChangeEvent, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from "@/hooks/use-toast"

type Props = {
  onReportConfirmation: (data: string) => void
}

const ReportComponent = ({ onReportConfirmation }: Props) => {
  const { toast } = useToast()
  const [base64Data, setBase64Data] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState("");

  function handleReportSelection(event: ChangeEvent<HTMLInputElement>): void {
    if (!event.target.files) return;
    const file = event.target.files[0];
    if (file) {
      let isValidImage = false;
      let isValidDoc = false;
      const validImages = ['image/jpeg', 'image/png', 'image/webp'];
      const validDocs = ['application/pdf'];
      if (validImages.includes(file.type)) {
        isValidImage = true;
      }
      if (validDocs.includes(file.type)) {
        isValidDoc = true;
      }
      if (!(isValidImage || isValidDoc)) {
        toast({
          variant: 'destructive',
          description: "Filetype not supported!",
        });
        return;
      }

      if (isValidImage) {
        compressImage(file, (compressedFile) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            const base64String = reader.result as string;
            setBase64Data(base64String);
            console.log(base64String);
          };

          reader.readAsDataURL(compressedFile);
        });
      }

      if (isValidDoc) {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result as string;
          setBase64Data(base64String);
          console.log(base64String);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async function extractDetails(): Promise<void> {
    if (!base64Data) {
      toast({
        variant: 'destructive',
        description: "Upload a valid report!",
      });
      return;
    }

    setIsLoading(true);
    const response = await fetch("api/extractreportgemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64: base64Data,
      }),
    });

    if (response.ok) {
      const reportText = await response.text();
      console.log(reportText);
      setReportData(reportText);
      setIsLoading(false);
    }

  }

  function compressImage(file: File, callback: (compressedFile: File) => void) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx!.drawImage(img, 0, 0);

        const quality = 0.1; // Adjust quality as needed

        const dataURL = canvas.toDataURL('image/jpeg', quality);

        const byteString = atob(dataURL.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);

        }
        const compressedFile = new File([ab], file.name, { type: 'image/jpeg' });

        callback(compressedFile);
      };
      img.src = e.target!.result as string;
    };

    reader.readAsDataURL(file);
  }

  async function handleLooksGood() {
    try {
      setIsLoading(true);

      const uploadResponse = await fetch("/api/docchatgemini", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documents: [
            {
              id: `doc_${Date.now()}`,
              text: reportData,
              metadata: {
                source: "user_upload",
                uploadDate: new Date().toISOString(),
                documentType: "report",

                originalFileName: base64Data ? base64Data.substring(0, 50) : "unknown"
              }
            }
          ]
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload document to vector database");
      }

      onReportConfirmation(reportData);

      toast({
        description: "Document processed and ready for querying!"
      });
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        variant: 'destructive',
        description: "Failed to process document. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
      <fieldset className='relative grid gap-6 rounded-lg border p-4'>
        <legend className="text-sm font-medium">Report</legend>
        {isLoading && (
          <div
            className={"absolute z-10 h-full w-full bg-card/90 rounded-lg flex flex-row items-center justify-center"
            }
          >
            extracting...
          </div>
        )}
        <Input type='file'
          // accept='image/*' 
          onChange={handleReportSelection} />
        <Button onClick={extractDetails}>1. Upload File</Button>
        <Label>Report Summary</Label>
        <Textarea
          value={reportData}
          onChange={(e) => {
            setReportData(e.target.value);
          }}
          placeholder="Extracted data from the document will appear here. Get better recommendations by providing additional data..."
          className="min-h-72 resize-none border-0 p-3 shadow-none focus-visible:ring-0" />
        <Button
          variant="destructive"
          className="bg-[#D90013]"
          onClick={handleLooksGood}
          disabled={isLoading || !reportData}
        >
          Looks Good
        </Button>
      </fieldset>
    </div>
  )
}

export default ReportComponent