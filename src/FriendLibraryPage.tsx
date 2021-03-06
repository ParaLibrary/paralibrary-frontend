import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { Redirect, useParams } from "react-router";

import PageLayout from "./PageLayout";
import { Book, Loan, User } from "./ourtypes";
import { toLibrary } from "./mappers";
import FriendshipStatusButton from "./FriendManagers";
import { AuthContext } from "./AuthContextProvider";
import BookCard from "./BookCard";
import List from "./List";
import { SingleUserProvider } from "./UserListContext";
import LibraryToolbar from "./LibraryToolbar";
import { useToasts } from "./ToastProvider";
import LibraryHeader from "./LibraryHeader";

const FriendLibraryPage: React.FC = () => {
  const { id } = useParams();
  const auth = useContext(AuthContext);
  const thisUsersEmail = useMemo(async () => {
    if (!auth.credential.userId) {
      return "";
    }
    return fetch(
      `http://paralibrary.digital/api/users/${auth.credential.userId}`,
      {
        credentials: "include",
      }
    )
      .then((res: Response) => res.json())
      .then((user: User) => user.email)
      .catch(() => "");
  }, [auth]);

  const { addToast } = useToasts();

  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [user, setUser] = useState<User>();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>();

  const categories = useMemo(
    () =>
      Array.from(
        new Set(books.flatMap((book: Book) => book.categories))
      ).sort(),
    [books]
  );

  function filterResults(searchTerm: string) {
    setSearchTerm(searchTerm);
  }

  const filteredBooks: Book[] = useMemo(() => {
    const regExp = new RegExp(searchTerm.trim(), "gi");
    return books.filter(
      (book: Book) =>
        (!searchTerm ||
          book.title.match(regExp) ||
          book.author.match(regExp)) &&
        (!categoryFilter || book.categories.includes(categoryFilter))
    );
  }, [searchTerm, books, categoryFilter]);

  const userStatus = useMemo(() => {
    return user?.status;
  }, [user]);

  useEffect(() => {
    fetch(`http://paralibrary.digital/api/libraries/${id}`, {
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then(
        (result) => {
          const lib = toLibrary(result);
          setBooks(lib.books.reverse());
          setUser(lib.user);
        },
        (e) => {
          console.log(e);
          setError(true);
        }
      )
      .catch((e) => {
        console.log(e);
        setError(true);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [id, userStatus]);

  const handleRequest = useCallback(
    async (bookID: string) => {
      if (!(await thisUsersEmail)) {
        addToast({
          header: "Could not request book",
          body:
            "Must provide email address to request a book. Visit settings to add an email.",
          type: "error",
        });
        return;
      }
      fetch("http://paralibrary.digital/api/loans", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: bookID,
          requester_id: auth.credential.userId,
          status: "pending",
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          const emptyUser: User = {
            id: "",
            name: "",
            status: null,
            email: "",
            picture: "",
          };
          const owner: User = user || emptyUser;
          const requester: User = {
            ...emptyUser,
            id: auth.credential.userId || "",
          };
          const loan: Loan = {
            id: res.id,
            status: "pending",
            owner,
            requester,
          };
          setBooks(
            books.map((book) => (book.id !== bookID ? book : { ...book, loan }))
          );
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [auth, books, user, addToast, thisUsersEmail]
  );

  const handleCancel = useCallback(async (loan: Loan) => {
    fetch(`http://paralibrary.digital/api/loans/${loan.id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loan),
    });
  }, []);

  if (auth.credential.userId === id) {
    return <Redirect to="/library" />;
  } else {
    return (
      <PageLayout
        header={
          !isLoaded ? (
            <h1>Loading...</h1>
          ) : !user ? (
            <h1>User Not Found</h1>
          ) : (
            <LibraryHeader name={user.name} picture={user.picture} />
          )
        }
        error={error}
        loaded={isLoaded}
      >
        {user && (
          <SingleUserProvider user={user} setUser={setUser}>
            <FriendshipStatusButton friend={user} />
          </SingleUserProvider>
        )}
        <hr />
        <LibraryToolbar
          onCategoryChange={setCategoryFilter}
          options={categories}
          onSearchChange={filterResults}
        />

        <List
          title={<h3>Books</h3>}
          items={filteredBooks}
          component={BookCard}
          userRole="requester"
          onRequest={handleRequest}
          onCancel={handleCancel}
          friendStatus={userStatus}
          placeholder={
            books.length ? (
              <span>No search results found</span>
            ) : (
              <span>
                Huh, looks like {user ? user.name : "this user"} hasn't added
                anything to their library, or their privacy settings don't allow
                you to see this library.
              </span>
            )
          }
        />
      </PageLayout>
    );
  }
};

export default FriendLibraryPage;
