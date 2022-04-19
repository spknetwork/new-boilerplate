import { CreateAction, DeckState, IdentifiableDeckModel } from '../types';

export function createDeckReducer(state: DeckState, data: CreateAction['data']): DeckState {
  const [listItemComponent, title, icon, dataParams, createdAt, updateIntervalMs] = data;
  const id = `item-${state.items.length}`;
  const deck: IdentifiableDeckModel = {
    listItemComponent,
    header: {
      title,
      icon,
      reloading: false,
      updateIntervalMs: updateIntervalMs || 60000,
    },
    dataParams,
    id,
    content: id,
    createdAt: createdAt || new Date(),
  };
  return {
    ...state,
    items: [...state.items, deck],
  };
}