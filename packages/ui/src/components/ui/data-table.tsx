'use client';

import * as React from 'react';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnSort,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  TableState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Input } from './input';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from 'lucide-react';
import { title } from 'radash';
import { ScrollArea } from './scroll-area';


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterCols?: {
    id: string;
    title: string;
  }[];
  filterPlaceholder?: string;
  stripped?: boolean;
  isLoading?: boolean;
  url?: string;
  defaultSort?: ColumnSort;
  endComponent?: React.ReactNode;
  startComponent?: React.ReactNode;
  pageIndex?: number;
  pageSize?: number;
  hidePagination?: boolean;
}

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
    exactMatch: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const exactMatchFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const path = columnId.split('.');
  let rowValue = row.original;

  for (const p of path) {
    rowValue = rowValue?.[p];
  }

  console.log('Filter function called with:', rowValue, filterValue);
  if (typeof rowValue === 'number') {
    return rowValue === Number(filterValue);
  }
  return String(rowValue) === String(filterValue);
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterPlaceholder,
  isLoading,
  stripped = false,
  defaultSort,
  endComponent,
  startComponent,
  pageIndex,
  pageSize = 30,
  hidePagination = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(() =>
    defaultSort ? [defaultSort] : []
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState('');

  const state: Partial<TableState> | undefined = {
    sorting,
    columnFilters,
    globalFilter,
  };
  if (pageIndex !== undefined) {
    state.pagination = {
      pageIndex,
      pageSize,
    };
  }

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
      exactMatch: exactMatchFilter,
    },
    state,
    enableFilters: true,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    autoResetPageIndex: false,
  });

  return (
    <div className="w-full overflow-x-auto">
      {(filterPlaceholder ) && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            {filterPlaceholder && (
              <DebouncedInput
                placeholder={title(filterPlaceholder)}
                value={globalFilter ?? ''}
                onChange={setGlobalFilter as any}
                className="max-w-sm"
              />
            )}
           
            {startComponent}
          </div>
          <div>{endComponent}</div>
        </div>
      )}

      <ScrollArea className="rounded-md border relative">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-white z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-cy="job-card-select"
                  className={cn('group/row', {
                    'even:bg-slate-200/70': stripped,
                  })}
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      {!hidePagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          {(table.getCanPreviousPage() || table.getCanNextPage()) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}


// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    initialValue && setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="flex">
      <div className="flex justify-center items-center bg-slate-50 px-3 border border-r-0 rounded-l-md">
        <Search className="size-4" />
      </div>
      <Input
        {...props}
        value={value}
        className="!rounded-l-none"
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting()}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ChevronDown className="ml-2 size-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ChevronUp className="ml-2 size-4" />
        ) : (
          <ChevronsUpDown className="ml-2 size-4" />
        )}
      </Button>
    </div>
  );
}
