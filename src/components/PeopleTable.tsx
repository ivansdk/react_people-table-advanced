import React, { useCallback, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import cn from "classnames";
import { Person } from "../types";
import { PeopleLink } from "./PeopleLink";
import { SearchLink } from "./SearchLink";

type Props = {
  people: Person[];
  noMatches: boolean;
  setNoMatches: (value: boolean) => void;
};

function filterPeople(
  people: Person[],
  query: string,
  sex: string,
  centuries: string[],
  sort: string,
  order: string
): Person[] {
  let copyPeople = [...people];

  if (query) {
    copyPeople = copyPeople.filter(
      (person) =>
        person.name
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) ||
        (person.motherName
          ? person.motherName
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase())
          : false) ||
        (person.fatherName
          ? person.fatherName
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase())
          : false)
    );
  }

  if (sex) {
    copyPeople = copyPeople.filter((person) => person.sex === sex);
  }

  if (centuries.length) {
    copyPeople = copyPeople.filter((person) => {
      return centuries.some((century) => {
        return Math.ceil(person.born / 100) === +century;
      });
    });
  }

  if (sort) {
    copyPeople = copyPeople.sort((a, b) => {
      switch (sort) {
        case "name":
        case "sex":
          return a[sort].localeCompare(b[sort]);
        case "born":
        case "died":
          return a[sort] - b[sort];

        default:
          return 0;
      }
    });

    if (order) {
      copyPeople.reverse();
    }
  }

  return copyPeople;
}

export const PeopleTable: React.FC<Props> = ({
  people,
  noMatches,
  setNoMatches,
}) => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams();
  const query = searchParams.get("query") || "";
  const sex = searchParams.get("sex") || "";
  const sort = searchParams.get("sort") || "";
  const order = searchParams.get("order") || "";
  const centuries = searchParams.getAll("centuries") || [];

  let currentPeople = filterPeople(people, query, sex, centuries, sort, order);

  const findParent = useCallback((name: string) => {
    const parent = people.find((person) => person.name === name);

    if (parent) {
      return <PeopleLink person={parent} />;
    }

    return name;
  }, []);

  useEffect(() => {
    if (noMatches) {
      setNoMatches(false);
    }

    currentPeople = filterPeople(people, query, sex, centuries, sort, order);

    if (currentPeople.length === 0) {
      setNoMatches(true);
    }
  }, [people, query]);

  const sortOrderIcon = (field: string) =>
    cn("fas", {
      "fa-sort": sort !== `${field}`,
      "fa-sort-up": sort === `${field}` && order !== "desc",
      "fa-sort-down": sort === `${field}` && order === "desc",
    });

  const handleSort = (field: string) => {
    if (!order && sort === field) {
      return {
        sort: field,
        order: "desc",
      };
    }

    if (order && sort === field) {
      return {
        sort: null,
        order: null,
      };
    }

    return {
      sort: field,
      order: null,
    };
  };

  return (
    <table
      data-cy="peopleTable"
      className="table is-striped is-hoverable is-narrow is-fullwidth"
    >
      <thead>
        <tr>
          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Name
              <SearchLink params={handleSort("name")}>
                <span className="icon">
                  <i className={sortOrderIcon("name")} />
                </span>
              </SearchLink>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Sex
              <SearchLink params={handleSort("sex")}>
                <span className="icon">
                  <i className={sortOrderIcon("sex")} />
                </span>
              </SearchLink>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Born
              <SearchLink params={handleSort("born")}>
                <span className="icon">
                  <i className={sortOrderIcon("born")} />
                </span>
              </SearchLink>
            </span>
          </th>

          <th>
            <span className="is-flex is-flex-wrap-nowrap">
              Died
              <SearchLink params={handleSort("died")}>
                <span className="icon">
                  <i className={sortOrderIcon("died")} />
                </span>
              </SearchLink>
            </span>
          </th>

          <th>Mother</th>
          <th>Father</th>
        </tr>
      </thead>

      <tbody>
        {currentPeople.map((person) => (
          <tr
            key={person.slug}
            data-cy="person"
            className={cn({
              "has-background-warning": slug === person.slug,
            })}
          >
            <td>
              <Link
                to={{
                  pathname: `/people/${person.slug}`,
                  search: searchParams.toString(),
                }}
                className={cn({
                  "has-text-danger": person.sex === "f",
                })}
              >
                {person.name}
              </Link>
            </td>

            <td>{person.sex}</td>
            <td>{person.born}</td>
            <td>{person.died}</td>
            <td>{person.motherName ? findParent(person.motherName) : "-"}</td>
            <td>{person.fatherName ? findParent(person.fatherName) : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
