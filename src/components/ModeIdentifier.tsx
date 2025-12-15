import React from "react";

import { Modes } from "../types";

import "./styles.css";

export const ModeIdentifier = React.memo((props: { mode: Modes }) => {
  const getModeString = () => {
    const STRINGS = {
      [Modes.Rectangle]: "Rectangle Mode",
      [Modes.Freehand]: "Freehand Mode",
      [Modes.Line]: "Line Mode",
      [Modes.Typography]: "TextMode",
      [Modes.Arrow]: "Arrow Mode",
      [Modes.Elipse]: "Elipse Mode",
      [Modes.Select]: "Select Mode",
    };

    return STRINGS[props.mode] ?? "";
  };

  const text = getModeString();

  if (text === "") {
    return;
  }

  return (
    <div className="modeContainer">
      <h1>{text}</h1>
    </div>
  );
});
