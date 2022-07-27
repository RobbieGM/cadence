import type { Component } from "solid-js";

const Loader: Component = () => (
  <svg
    viewBox="20 20 160 160"
    width="20"
    height="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <path
        fill-rule="evenodd"
        d="M 0 -17 A 22 17 0 0 0 0 17 A 22 17 0 0 0 0 -17
      M 0 -13 A 10 13 0 0 1 0 13 A 10 13 0 0 1 0 -13"
        id="semibreve"
        fill="#000"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          dur="1.5s"
          repeatCount="indefinite"
          keySplines="0.7 1 0.3 0"
          calcMode="spline"
          values="150; -150"
          keyTimes="0;1"
          fill="freeze"
        />
      </path>
      <path
        fill-rule="evenodd"
        d="M 0 -17 A 22 17 0 0 0 0 17 A 22 17 0 0 0 0 -17
      M 0 -13 A 10 13 0 0 1 0 13 A 10 13 0 0 1 0 -13"
        id="semibreve2"
        fill="#000"
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          dur="1.5s"
          repeatCount="indefinite"
          keySplines="0.7 1 0.3 0"
          calcMode="spline"
          values="150; -150"
          keyTimes="0;1"
          fill="freeze"
          begin="-0.75s"
        />
      </path>
      <path d="M 20 0 L 180 0" id="line" stroke="#666"></path>
    </defs>
    <g stroke-width="4" stroke="#000000">
      <use href="#line" x="0" y="40" />
      <use href="#line" x="0" y="70" />
      <use href="#line" x="0" y="100" />
      <use href="#line" x="0" y="130" />
      <use href="#line" x="0" y="160" />
    </g>
    <g>
      <use href="#semibreve" x="100" y="100" />
      <use href="#semibreve" x="100" y="70" />
      <use href="#semibreve" x="100" y="130" />
      <use href="#semibreve2" x="100" y="115" />
      <use href="#semibreve2" x="100" y="55" />
      <use href="#semibreve2" x="100" y="145" />
    </g>
  </svg>
);

export default Loader;
