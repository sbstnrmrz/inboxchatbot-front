import { ContactsTable } from "./ContactsTable"

export function ContactsPage() {
  return (
    <div className="mx-auto my-auto flex flex-col ">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contactos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos los clientes y sus canales de contacto.
        </p>
      </div>
      <ContactsTable />
    </div>
  )
}
