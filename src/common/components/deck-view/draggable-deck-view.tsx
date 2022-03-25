import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  resetServerContext,
} from "react-beautiful-dnd";
import { _t } from "../../i18n";
import { Deck } from "../deck";
import * as ls from "../../util/local-storage";
import { success } from "../feedback";
import { normalizeHeader } from ".";

export const getItems = (decks: any[], user: string | undefined) => {
  if (user && decks.length > 0) {
    ls.set(`user-${user}-decks`, decks);
  } else if (!user && decks.length > 0) {
    ls.set(`user-unauthed-decks`, decks);
  }
  return decks.map((k, index) => ({
    id: `item-${index}`,
    content: `item ${index}`,
    ...decks[index],
  }));
};

// a little function to help us with reordering the result
const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean, theme: string) => ({
  background: theme === "night" ? "#232e3b" : "#e9f2fc",
  display: "flex",
  padding: "8px 80px 28px 28px",
  overflow: "auto",
  scrollBehavior: "smooth",
});

resetServerContext();

const DraggableDeckView = ({
  decks,
  toggleListStyle,
  loading,
  setDecks,
  onReloadColumn,
  ...rest
}: any) => {
  const [items, setItems] = useState<any>(
    getItems(decks, (rest.activeUser && rest.activeUser.username) || "")
  );
  const [mounted, setMounted] = useState(false);

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    setItems(reorderedItems);
    setDecks(reorderedItems);
  };

  useEffect(() => {
    setItems(decks);
  }, [decks]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (rest.activeUser && rest.activeUser.username) {
      let newItems = ls.get(`user-${rest.activeUser.username}-decks`);
      if (newItems) {
        let defaultDecks = [...newItems];
        defaultDecks = normalizeHeader(defaultDecks);
        setDecks(
          getItems(
            [...defaultDecks],
            (rest.activeUser && rest.activeUser.username) || ""
          )
        );
      }
    } else {
      let newItems = ls.get(`user-unauthed-decks`);

      if (newItems) {
        let defaultDecks = [...newItems];
        defaultDecks = normalizeHeader(defaultDecks);
        setDecks(getItems([...defaultDecks], undefined));
      }
    }
  }, [rest.activeUser]);

  return mounted ? (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={
              getListStyle(snapshot.isDraggingOver, rest.global.theme) as any
            }
            {...provided.droppableProps}
            id="draggable-container"
          >
            {items.map((item: any, index: any) => (
              <Draggable
                key={item.id + index}
                draggableId={item.id}
                index={index}
              >
                {(provided, snapshot) => {
                  const notificationTranslated = _t("decks.notifications");
                  const containerClass = item.header.title.includes(
                    notificationTranslated
                  )
                    ? "list-body pb-0"
                    : "";

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                      id={item.id}
                      className={
                        item.header.title.includes(_t("decks.notifications"))
                          ? "notification-list"
                          : ""
                      }
                    >
                      <Deck
                        toggleListStyle={toggleListStyle}
                        onRemove={(option: string) => {
                          let filteredDecks = items.filter(
                            (item: any) => item.header.title !== option
                          );
                          setDecks(filteredDecks);
                          success(_t("decks.removed", { deck: option }));
                        }}
                        onReloadColumn={onReloadColumn}
                        {...item}
                        {...rest}
                      />
                    </div>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}

            {loading && (
              <div className="d-flex justify-content-center align-items-center h-100 w-100 deck">
                <div
                  className="spinner-border text-primary spinner-border"
                  role="status"
                >
                  <span className="sr-only">{_t("g.loading")}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ) : null;
};

export { DraggableDeckView };