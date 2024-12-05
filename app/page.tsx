'use client'
import { ModeToggle } from '@/components/mode-toggle'
import ReportComponent from '@/components/ReportComponent'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Settings } from 'lucide-react'
import React, { useState } from 'react'
import { useToast } from "@/hooks/use-toast"

const HomeComponent = () => {
  const { toast } = useToast()
  
  const [reportData, setreportData] = useState("");
  const onReportConfirmation = (data: string) => {
    setreportData(data);
    toast({
      description: "Updated!"
    });
  }
  
  return (
    <div className="grid h-screen w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] bg-background items-center gap-1 border-b px-4">
          <h1 className="text-xl font-semibold">
            <span className="flex flex-row">Sage</span>
          </h1>
          <div className="w-full flex flex-row justify-end gap-2">
            <ModeToggle />
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Settings />
                  <span className="sr-only">Settings</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[80vh]">
                <ReportComponent onReportConfirmation={onReportConfirmation}/>
              </DrawerContent>
            </Drawer>
          </div>
        </header>
      </div>
    </div>

  )
}

export default HomeComponent