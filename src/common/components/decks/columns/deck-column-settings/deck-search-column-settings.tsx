import { SearchDeckGridItem } from "../../types";
import React, { useContext, useEffect, useState } from "react";
import { DeckHeaderSettingsItem } from "../../header/deck-header-settings-item";
import { _t } from "../../../../i18n";
import { Button, Form } from "react-bootstrap";
import { SearchType } from "../../../../helper/search-query";
import { DateOpt, SearchSort } from "../../consts";
import useLocalStorage from "react-use/lib/useLocalStorage";
import "./_deck-search-column-settings.scss";
import { DeckGridContext } from "../../deck-manager";

interface Props {
  id: string;
  settings: SearchDeckGridItem["settings"];
}

export const DeckSearchColumnSettings = ({ id, settings }: Props) => {
  const { updateColumnSpecificSettings } = useContext(DeckGridContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  // Advanced settings
  const [query, setQuery] = useState(settings.query ?? "");
  const [lsDate, setLsDate] = useLocalStorage<string>("recent_date", DateOpt.W);
  const [author, setAuthor] = useState(settings.author ?? "");
  const [tags, setTags] = useState(settings.tags ?? "");
  const [type, setType] = useState(settings.type ?? "");
  const [category, setCategory] = useState(settings.category ?? "");
  const [date, setDate] = useState(settings.date ?? lsDate);
  const [sort, setSort] = useState(settings.sort ?? "");
  const [hideLow, setHideLow] = useState(settings.hideLow ?? false);

  useEffect(() => {
    setIsDisabled(!query);
  }, [query]);

  return (
    <DeckHeaderSettingsItem
      className="deck-search-column-settings"
      title={_t("decks.columns.filters")}
      hasBorderBottom={false}
    >
      <div className="form-list">
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder={_t("decks.columns.search-query")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder={_t("decks.username")}
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
          }}
        />
        <div className="row">
          <div className="col">
            <Form.Control as="select" value={type} onChange={(e) => setType(e.target.value)}>
              {Object.values(SearchType).map((x) => (
                <option value={x} key={x}>
                  {_t(`search-comment.type-${x}`)}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className="col">
            <Form.Control
              type="text"
              placeholder={_t("search-comment.category-placeholder")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <Form.Control
          type="text"
          placeholder={_t("search-comment.tags-placeholder")}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <div className="row">
          <div className="col">
            <Form.Control as="select" value={date} onChange={(e) => setDate(e.target.value)}>
              {Object.values(DateOpt).map((x) => (
                <option value={x} key={x}>
                  {_t(`search-comment.date-${x}`)}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className="col">
            <Form.Control as="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.values(SearchSort).map((x) => (
                <option value={x} key={x}>
                  {_t(`search-comment.sort-${x}`)}
                </option>
              ))}
            </Form.Control>
          </div>
        </div>
        <Form.Check
          className="py-2"
          label={_t("search-comment.hide-low")}
          checked={hideLow}
          onChange={(e) => setHideLow(e.target.checked)}
        />
        <Button
          variant="outline-primary"
          size="sm"
          disabled={isLoading || isDisabled}
          onClick={() => {
            setIsLoading(true);
            updateColumnSpecificSettings(id, {
              query,
              author,
              type,
              category,
              tags,
              date,
              sort,
              hideLow
            });
            setTimeout(() => setIsLoading(false), 1000);
          }}
        >
          {isLoading ? _t("g.applying") : _t("g.apply")}
        </Button>
      </div>
    </DeckHeaderSettingsItem>
  );
};
