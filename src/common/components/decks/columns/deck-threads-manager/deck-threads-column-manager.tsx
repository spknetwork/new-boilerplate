import React, { createContext, FunctionComponent, PropsWithChildren } from "react";
import { ThreadItemEntry } from "./identifiable-entry";
import { communityThreadsQuery } from "./community-api";
import { threadsQuery } from "./threads-api";
import { useQueryClient } from "@tanstack/react-query";
import { FetchQueryOptions } from "@tanstack/query-core/src/types";

export const DeckThreadsColumnManagerContext = createContext<{
  fetch: (hosts: string[], lastContainers?: ThreadItemEntry[]) => Promise<ThreadItemEntry[]>;
}>({
  fetch: () => Promise.resolve([])
});

interface Props {
  children: JSX.Element;
}

export const DeckThreadsColumnManager = ({ children }: Props) => {
  const queryClient = useQueryClient();

  const fetch = async (hosts: string[], lastContainers?: ThreadItemEntry[]) => {
    let nextThreadItems: ThreadItemEntry[] = [];

    let usingHosts = lastContainers
      ? hosts.filter((h) => lastContainers.find((c) => c.host === h))
      : hosts;

    for (const host of usingHosts) {
      const lastContainer = lastContainers?.find((c) => c.host === host);
      let query: FetchQueryOptions;
      if ("dbuzz" === host) {
        query = communityThreadsQuery(host, "hive-193084", lastContainer);
      } else {
        query = threadsQuery(host, lastContainer);
      }

      const response = await queryClient.fetchQuery(query);

      if (response instanceof Array) {
        nextThreadItems = [...nextThreadItems, ...response];
      }
    }

    return nextThreadItems;
  };

  return (
    <DeckThreadsColumnManagerContext.Provider value={{ fetch }}>
      {children}
    </DeckThreadsColumnManagerContext.Provider>
  );
};

export function withDeckThreadsColumnManager<T, Y extends JSX.Element>(
  Component: FunctionComponent<T>
) {
  return (props: PropsWithChildren<T>) => {
    return (
      <DeckThreadsColumnManager>
        <Component {...props} />
      </DeckThreadsColumnManager>
    );
  };
}
