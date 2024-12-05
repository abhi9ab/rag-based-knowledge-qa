import React, { ChangeEvent } from 'react'
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
    }
  }

  function extractDetails(): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
      <fieldset className='relative grid gap-6 rounded-lg border p-4'>
        <legend className="text-sm font-medium">Report</legend>
        <Input type='file'
          // accept='image/*' 
          onChange={handleReportSelection} />
        <Button onClick={extractDetails}>1. Upload File</Button>
        <Label>Report Summary</Label>
        <Textarea
          placeholder="Extracted data from the report will appear here. Get better recommendations by providing additional patient history and symptoms..."
          className="min-h-72 resize-none border-0 p-3 shadow-none focus-visible:ring-0" />
        <Button
          variant="destructive"
          className="bg-[#D90013]"
        >
          2. Looks Good
        </Button>
      </fieldset>
    </div>
  )
}

export default ReportComponent