import React, { HTMLProps, useRef, useState } from "react";
import { DropdownContext } from "@ui/dropdown/dropdown-context";
import { classNameObject } from "../../../helper/class-name-object";
import useClickAway from "react-use/lib/useClickAway";
import { useFilteredProps } from "../../../util/props-filter";

export * from "./dropdown-item";
export * from "./dropdown-menu";
export * from "./dropdown-toggle";

interface Props {
  show?: boolean;
  setShow?: (v: boolean) => void;
  closeOnClickOutside?: boolean;
}

export function Dropdown(props: HTMLProps<HTMLDivElement> & Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useClickAway(ref, () => {
    if (props.closeOnClickOutside ?? true) {
      setShow(false);
    }
  });
  const nativeProps = useFilteredProps(props, ["show", "setShow", "closeOnClickOutside"]);

  return (
    <DropdownContext.Provider
      value={{
        show: props.show ?? show,
        setShow: (v) => {
          setShow(v);
          props.setShow?.(v);
        }
      }}
    >
      <div
        {...nativeProps}
        ref={ref}
        className={classNameObject({
          relative: true,
          [props.className ?? ""]: !!props.className
        })}
      />
    </DropdownContext.Provider>
  );
}
