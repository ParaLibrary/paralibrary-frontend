export interface Friend {
  id: string;
  display_name: string;
  name: string;
  status: "requested" | "friends";
}

export interface Loan {
  id: string;
  owner_id: string;
  requester_id: string;
  book_id: string;
  request_date: Date;
  accept_date: Date;
  loan_start_date: Date;
  loan_end_date: Date;
  status: "pending" | "accepted" | "loaned" | "returned" | "late";
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  isbn: string;
  summary: string;
  private: boolean;
}

export interface User {
  id: string;
  display_name: string;
  name: string;
}
