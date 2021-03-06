import React from "react";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import { Book } from "./ourtypes";
import styled from "styled-components";

const DangerDropdownItem = styled(Dropdown.Item)`
  background-color: white;
  color: #dc3545;
  border-radius: 3pt;
  border-color: #dc3545;

  :hover {
    color: white;
    background-color: #dc3545;
  }
`;
interface EditBookProps {
  rowitem: Book;
  onEdit: (book: Book | undefined) => void;
  onDelete: (book: Book | undefined) => void;
}

const BookEditButton: React.FC<EditBookProps> = ({
  rowitem,
  onEdit,
  onDelete,
}) => {
  return (
    <Dropdown size="sm" as={ButtonGroup}>
      <Button onClick={() => onEdit(rowitem)} block>
        Edit
      </Button>

      <Dropdown.Toggle
        split
        className="super-colors"
        id="dropdown-split-basic"
      />

      <Dropdown.Menu className="super-colors">
        <DangerDropdownItem onClick={() => onDelete(rowitem)}>
          Delete
        </DangerDropdownItem>
      </Dropdown.Menu>
    </Dropdown>
  );
};
export default BookEditButton;
