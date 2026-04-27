import { BookingsTable } from "./BookingsTable"

export function BookingsPage() {
  return (
    <div className="p-8 flex flex-col w-full h-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Agendamientos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos los agendamientos y su estado actual.
        </p>
      </div>
      <BookingsTable />
    </div>
  )
}
