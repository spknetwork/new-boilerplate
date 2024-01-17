import React, { useContext, useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  ChatContext,
  DirectContact,
  getRelativeDate,
  useGetPublicKeysQuery,
  useKeysQuery,
  useLastMessageQuery
} from "@ecency/ns-query";
import { _t } from "../../../../i18n";
import Tooltip from "../../../../components/tooltip";
import { informationOutlineSvg } from "../../../../img/svg";
import { Button } from "@ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@ui/badge";

interface Props {
  contact: DirectContact;
  isLink?: boolean;
  onClick?: () => void;
}

export function ChatSidebarDirectContact({ contact, onClick, isLink = true }: Props) {
  const { receiverPubKey, setReceiverPubKey, revealPrivateKey, setRevealPrivateKey } =
    useContext(ChatContext);

  const { publicKey } = useKeysQuery();
  const { data: contactKeys, isLoading: isContactKeysLoading } = useGetPublicKeysQuery(
    contact.name
  );
  const lastMessage = useLastMessageQuery(contact);
  const lastMessageDate = useMemo(() => getRelativeDate(lastMessage?.created), [lastMessage]);

  const isJoined = useMemo(() => (contactKeys ? contactKeys.pubkey : false), [contactKeys]);
  const isReadOnly = useMemo(
    () => (contactKeys && isJoined ? contact.pubkey !== contactKeys.pubkey : false),
    [contactKeys, contact, isJoined]
  );
  console.log(contact);

  const content = (
    <>
      <div
        className={classNameObject({
          grayscale: isContactKeysLoading ? true : isReadOnly || !isJoined
        })}
      >
        <UserAvatar username={contact.name} size="medium" />
      </div>
      <div className="flex flex-col w-[calc(100%-40px-0.75rem)]">
        <div className="flex justify-between w-full items-center">
          <div>
            {isReadOnly && !isContactKeysLoading && (
              <div className="text-gray-600 flex items-center text-xs">
                {_t("chat.read-only")}
                <Tooltip content={_t("chat.why-read-only")}>
                  <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
                </Tooltip>
              </div>
            )}
            {!isJoined && !isContactKeysLoading && (
              <div className="text-gray-600 flex items-center text-xs">
                {_t("chat.user-not-joined")}
                <Tooltip content={_t("chat.not-joined")}>
                  <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
                </Tooltip>
              </div>
            )}
            <div className="font-semibold truncate dark:text-white">{contact.name}</div>
          </div>
          <div className="text-xs text-gray-500">{lastMessageDate}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-sm text-gray-600 truncate">
            {lastMessage?.creator === publicKey && (
              <span className="mr-1 text-gray-500 dark:text-gray-700">{_t("g.you")}:</span>
            )}
            {lastMessage?.content}
          </div>
          {!!contact.unread && <Badge appearance="secondary">{contact.unread}</Badge>}
        </div>
      </div>
    </>
  );

  return isLink ? (
    <Link
      to="/chats"
      className={classNameObject({
        "flex items-center text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer":
          true,
        "bg-gray-100 dark:bg-gray-800": receiverPubKey === contact.pubkey
      })}
      onClick={() => {
        setReceiverPubKey(contact.pubkey);
        if (revealPrivateKey) {
          setRevealPrivateKey(false);
        }
        onClick?.();
      }}
    >
      {content}
    </Link>
  ) : (
    <div
      className={classNameObject({
        "flex items-center text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer":
          true,
        "bg-gray-100 dark:bg-gray-800": receiverPubKey === contact.pubkey
      })}
      onClick={() => {
        setReceiverPubKey(contact.pubkey);
        if (revealPrivateKey) {
          setRevealPrivateKey(false);
        }
        onClick?.();
      }}
    >
      {content}
    </div>
  );
}
