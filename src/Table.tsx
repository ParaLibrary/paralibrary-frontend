import React, { cloneElement, useMemo, ReactElement } from "react";
import { Table } from "react-bootstrap";

interface TableProps<T> {
  title?: React.ReactNode;
  data: T[];
  children: React.ReactElement | React.ReactElement[];
  hideOnEmpty?: boolean;
  placeholder?: React.ReactNode;
}

interface TableHeaderProps {
  col: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return <th>{children}</th>;
};

interface CellProps<T> {
  point: T;
}

const TableCell = <T,>(props: CellProps<T>) => {
  return <td>{props.point}</td>;
};

interface RowProps<T> {
  index: number;
  template: React.ReactElement | React.ReactElement[];
  data: T;
}

const TableRow = <T,>(props: RowProps<T>) => {
  const { index, template, data } = props;
  return (
    <tr>
      {React.Children.map(template, (child: React.ReactElement) => {
        const col = (child.props as TableHeaderProps).col as keyof T;
        if (col) {
          return <TableCell point={data[col]}></TableCell>;
        }
        return <td>{cloneElement(child, child.props)}</td>;
      })}
    </tr>
  );
};

const AutoTable = <T extends { id: number }>(props: TableProps<T>) => {
  const { title, data, children, hideOnEmpty, placeholder } = props;
  const filteredHeaders = useMemo(
    () =>
      React.Children.map(children, (child) => {
        if (((child as ReactElement).props as TableHeaderProps).col) {
          return child;
        }
        return data.length > 0 ? <th></th> : null;
      }),
    [children]
  );
  return data.length === 0 && hideOnEmpty ? null : (
    <>
      {title}
      {data.length === 0 ? (
        placeholder
      ) : (
        <Table bordered size={"sm"}>
          <thead>
            <tr>{filteredHeaders}</tr>
          </thead>

          <tbody>
            {data.map((row: T) => (
              <TableRow
                index={row.id}
                data={row}
                template={children}
              ></TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AutoTable;
