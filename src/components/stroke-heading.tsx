import type { CSSProperties } from "react";

const latin = "Web3";
const chinese = Array.from("前端面试题库");

function character(char: string, index: number) {
  return (
    <span
      key={`${char}-${index}`}
      className="stroke-heading-char"
      data-char={char}
      style={
        {
          "--stroke-delay": `${index * 70}ms`,
          "--fill-delay": `${850 + index * 70}ms`,
        } as CSSProperties
      }
    >
      {char}
    </span>
  );
}

export function StrokeHeading() {
  return (
    <span aria-hidden="true" className="stroke-heading">
      <span className="stroke-heading-latin">
        {Array.from(latin).map((char, index) => character(char, index))}
      </span>{" "}
      {chinese.map((char, index) => character(char, latin.length + index))}
    </span>
  );
}
