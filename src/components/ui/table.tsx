import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} ref={ref} {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead className={cn("bg-muted [&:where([data-state='selected'])]]:bg-accent", className)} ref={ref} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody className={cn(" [&:where([data-state='selected'])]]:bg-accent", className)} ref={ref} {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot className={cn("bg-muted font-medium [&:where([data-state='selected'])]]:bg-accent", className)} ref={ref} {...props} />
))
TableFooter.displayName = "TableFooter"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    ref={ref}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    className={cn(
      "border-b transition-colors data-[state=selected]:bg-muted hover:bg-accent hover:text-accent-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    ref={ref}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    ref={ref}
    {...props}
  />
))
TableCell.displayName = "TableCell"

// Add these new mobile-friendly table components
export function TableMobileCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type TableMobileFieldProps = {
  label: string
  children: React.ReactNode
  badgeValue?: boolean
  badgePositive?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export function TableMobileField({
  label,
  children,
  badgeValue = false,
  badgePositive = true,
  className,
  ...props
}: TableMobileFieldProps) {
  return (
    <div className={cn("flex justify-between py-1", className)} {...props}>
      <span className="text-muted-foreground">{label}:</span>
      {badgeValue ? (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          badgePositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        )}>
          {children}
        </span>
      ) : (
        <span className="font-medium">{children}</span>
      )}
    </div>
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell }
