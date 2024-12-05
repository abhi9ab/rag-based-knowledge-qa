import { ModeToggle } from '@/components/mode-toggle'
import React from 'react'

const HomeComponent = () => {
  return (
    <div className="grid h-screen w-full">
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] bg-background items-center gap-1 border-b px-4">
          <h1 className="text-xl font-semibold">
            <span className="flex flex-row">Sage</span>
          </h1>
          <div className="w-full flex flex-row justify-end gap-2">
            <ModeToggle />
          </div>
        </header>
      </div>
    </div>

  )
}

export default HomeComponent