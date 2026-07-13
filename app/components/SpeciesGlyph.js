"use client";

export default function SpeciesGlyph({ name }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };

  switch (name) {
    case "microbe":
      return <g {...common}><path d="M12 31c0-14 10-23 25-23s27 9 27 23-12 25-27 25S12 45 12 31Z"/><circle cx="29" cy="25" r="4"/><circle cx="45" cy="38" r="3"/><path d="M61 18c11-9 17-3 8 6M14 20C4 15 2 25 9 29"/></g>;
    case "bacteria":
      return <g {...common}><rect x="12" y="14" width="48" height="38" rx="19"/><circle cx="28" cy="30" r="3"/><circle cx="43" cy="39" r="3"/><path d="M59 22c16-12 18 4 6 8M14 44C2 50 5 61 16 54"/></g>;
    case "archaea":
      return <g {...common}><path d="M17 17 37 8l22 10 5 23-17 17-25-4L10 34Z"/><path d="m24 25 13-7 13 8-4 16-17 2-8-9Z"/><circle cx="37" cy="31" r="3"/></g>;
    case "cell":
      return <g {...common}><circle cx="37" cy="32" r="25"/><circle cx="42" cy="30" r="10"/><path d="M18 25c8-4 9 7 16 3M48 46c6-8 12 2 15-5"/><circle cx="25" cy="43" r="3"/></g>;
    case "leaf":
      return <g {...common}><path d="M12 51C14 22 31 9 64 9c0 28-15 45-43 45"/><path d="M16 55c12-17 24-27 43-38M34 37c-1-8 0-13 4-19M39 34c8 0 13 2 18 6"/></g>;
    case "fungus":
      return <g {...common}><path d="M13 31C16 15 26 8 38 8s24 8 26 23H13Z"/><path d="M31 31c1 8 0 18-5 26h25c-5-9-6-18-5-26"/><path d="M23 22h1M38 17h1M52 24h1"/></g>;
    case "embryo":
      return <g {...common}><path d="M54 18c-8-13-29-12-38 3-10 18 3 39 22 38 17-1 24-17 17-29-6-10-20-10-25-2-4 7 1 15 9 14 7-1 10-8 7-13"/><circle cx="47" cy="18" r="3"/></g>;
    case "sponge":
      return <g {...common}><path d="M22 57c5-13 1-24 3-38 1-9 9-11 14-5 4-7 14-4 14 5 3 12-1 26 5 38H22Z"/><circle cx="32" cy="28" r="3"/><circle cx="45" cy="22" r="3"/><circle cx="42" cy="41" r="4"/><circle cx="52" cy="34" r="2"/></g>;
    case "jellyfish":
      return <g {...common}><path d="M14 31c2-15 11-23 24-23s23 9 25 23H14Z"/><path d="M21 32c-3 8 6 12 2 21M34 32c-4 9 5 13 0 24M47 32c-3 8 7 12 2 21M58 32c-2 6 4 9 0 16"/><circle cx="31" cy="24" r="2"/><circle cx="47" cy="24" r="2"/></g>;
    case "worm":
      return <g {...common}><path d="M8 43c8-23 23 9 32-14 8-20 21 4 28-13"/><path d="M11 49c12-16 23 10 35-10 8-14 16-1 22-12"/></g>;
    case "arthropod":
      return <g {...common}><ellipse cx="38" cy="32" rx="13" ry="20"/><circle cx="38" cy="13" r="8"/><path d="M27 25 14 18M27 34 11 34M28 43 15 51M49 25l13-7M49 34h16M48 43l13 8M34 7l-6-5M42 7l6-5"/></g>;
    case "shell":
      return <g {...common}><path d="M62 47C51 61 22 59 13 42 3 23 20 7 39 9c17 2 27 18 19 31-7 12-26 12-32 1-6-10 3-20 13-18 8 1 11 10 6 15-4 5-11 2-11-3"/></g>;
    case "starfish":
      return <g {...common}><path d="m38 6 7 17 18-5-10 16 13 13-19-2-8 17-5-18-19 2 14-13-10-15 18 5Z"/><circle cx="38" cy="34" r="4"/></g>;
    case "lancelet":
      return <g {...common}><path d="M7 32c15-17 36-21 61-3-18 19-42 24-61 3Z"/><path d="m57 27 12-10-2 15 3 13-13-9M16 32h39"/></g>;
    case "fish":
      return <g {...common}><path d="M8 34c13-15 34-18 50-7l11-8-3 12 4 11-12-7C42 48 22 47 8 34Z"/><path d="m31 25-7-11 15 8M31 42l-7 11 15-8"/><circle cx="55" cy="29" r="2"/></g>;
    case "eel":
      return <g {...common}><path d="M8 42c13-29 29 11 44-16 8-14 17-8 18 2"/><circle cx="66" cy="25" r="2"/></g>;
    case "shark":
      return <g {...common}><path d="M8 34c14-15 32-19 49-10l13-9-4 14 5 13-15-8c-18 10-34 9-48 0Z"/><path d="m34 23 7-12 6 13M19 34l-8 8M58 29l4 1"/><circle cx="55" cy="27" r="1.8"/></g>;
    case "rayfish":
      return <g {...common}><path d="M8 34c12-12 24-17 31-17s20 5 29 17c-12 4-20 10-29 22-9-12-18-18-31-22Z"/><path d="M39 56c1 6 4 9 8 11M23 31h1M54 31h1"/></g>;
    case "lobefin":
      return <g {...common}><path d="M8 33c13-15 34-19 51-7l10-7-3 12 4 11-12-6C41 48 21 47 8 33Z"/><path d="m29 39-9 16 16-12M45 40l7 14 6-17M31 24l-7-12 15 10"/><circle cx="55" cy="29" r="2"/></g>;
    case "salamander":
      return <g {...common}><path d="M10 34c13-9 25-12 39-6 8 4 14 2 20-4-3 10-9 16-19 17-13 2-25 1-40-7Z"/><path d="M27 27 18 14M29 40 19 53M45 27l9-12M46 41l10 12"/><circle cx="50" cy="32" r="2"/></g>;
    case "frog":
      return <g {...common}><ellipse cx="38" cy="35" rx="21" ry="16"/><circle cx="25" cy="21" r="7"/><circle cx="51" cy="21" r="7"/><circle cx="25" cy="20" r="2"/><circle cx="51" cy="20" r="2"/><path d="M21 42 8 55M55 42l13 13M29 49l-5 10M47 49l5 10"/></g>;
    case "egg":
      return <g {...common}><path d="M38 7c13 0 23 25 23 37 0 12-10 18-23 18s-23-6-23-18C15 32 25 7 38 7Z"/><path d="M28 43c6-8 14-9 22-2M31 34c5-4 10-4 15-1"/></g>;
    case "feather":
      return <g {...common}><path d="M13 58C20 25 36 8 65 7c-1 27-17 45-48 52"/><path d="M14 62 57 16M31 43l-12-5M40 34l-12-7M48 26l9 5M38 41l10 7"/></g>;
    case "mammal":
      return <g {...common}><path d="M10 41c8-17 20-23 38-18l10-8 7 8-4 8c7 5 7 13 0 16H19c-5 0-8-2-9-6Z"/><path d="M24 46v13M49 46v13M16 38 7 30M57 27h1"/><circle cx="57" cy="27" r="1.5"/></g>;
    case "hand":
      return <g {...common}><path d="M23 58c-5-12-8-22-8-31 0-5 6-5 7 0l3 10-1-24c0-5 7-5 7 0v21l2-27c1-5 7-4 7 1l-1 26 5-23c1-5 8-3 7 2l-4 24 5-12c2-5 8-2 7 3-3 13-8 23-15 30H23Z"/></g>;
    case "ape":
      return <g {...common}><path d="M18 28c0-13 9-21 20-21s20 8 20 21c8 7 6 19-4 23-5 9-27 9-32 0-10-4-12-16-4-23Z"/><path d="M27 29c3-7 18-7 22 0v14c-4 8-18 8-22 0Z"/><circle cx="31" cy="31" r="2"/><circle cx="45" cy="31" r="2"/><path d="M33 44c3 2 7 2 10 0"/></g>;
    case "chimp":
      return <g {...common}><path d="M16 29C13 14 24 7 38 7s25 7 22 22c8 8 5 20-5 24-6 8-28 8-34 0-10-4-13-16-5-24Z"/><path d="M27 30c5-8 18-8 23 0v13c-5 9-18 9-23 0Z"/><circle cx="31" cy="31" r="2"/><circle cx="46" cy="31" r="2"/><path d="M31 45c5 4 10 4 15 0"/></g>;
    case "footprints":
      return <g {...common}><path d="M22 12c9 1 12 14 8 24-3 8-11 13-17 8-6-6-2-15 1-22 2-6 3-11 8-10ZM49 27c8 1 11 12 8 21-3 8-10 12-16 7-5-5-2-13 0-19 2-5 3-10 8-9Z"/><circle cx="14" cy="12" r="3"/><circle cx="22" cy="7" r="3"/><circle cx="31" cy="9" r="3"/><circle cx="44" cy="19" r="3"/><circle cx="52" cy="16" r="3"/><circle cx="60" cy="20" r="3"/></g>;
    case "human":
      return <g {...common}><circle cx="38" cy="12" r="7"/><path d="M38 20v20M24 31l14-8 14 8M38 40 27 59M38 40l11 19"/><path d="M30 25c2 9 14 9 16 0"/></g>;
    case "skull-early":
      return <g {...common}><path d="M18 31c0-15 9-24 22-24 15 0 24 11 22 27-1 8-6 13-12 16v10H27V49c-6-4-9-10-9-18Z"/><circle cx="31" cy="31" r="4"/><circle cx="48" cy="31" r="4"/><path d="M37 38v7M30 51h20M34 55v5M43 55v5"/></g>;
    case "upright-ape":
      return <g {...common}><circle cx="36" cy="11" r="7"/><path d="M36 19c-5 7-6 17-3 26M33 28 20 40M34 29l14 10M33 45 24 60M34 45l15 13"/><path d="M31 22c8 1 13 5 15 11"/></g>;
    case "skull-robust":
      return <g {...common}><path d="M17 30c0-16 9-24 22-24 15 0 25 10 25 27 0 10-5 16-11 19l-3 10H25l-2-11c-5-4-6-12-6-21Z"/><path d="M27 19h25M24 27h33"/><circle cx="30" cy="35" r="4"/><circle cx="49" cy="35" r="4"/><path d="M39 41v7M28 53h23"/></g>;
    case "skull-homo":
      return <g {...common}><path d="M16 31C16 14 26 6 40 6c16 0 25 11 24 29 0 8-5 14-12 17l-2 9H27l-2-10c-6-4-9-11-9-20Z"/><circle cx="30" cy="33" r="4"/><circle cx="48" cy="33" r="4"/><path d="M39 39v8M28 53h22M33 56v5M44 56v5"/></g>;
    case "walker":
      return <g {...common}><circle cx="36" cy="10" r="7"/><path d="M36 18 32 38l12 9M33 25 19 35M34 38 22 58M43 47l16 9M45 27l10 11"/><path d="M25 59h-8M59 56h8"/></g>;
    case "island":
      return <g {...common}><path d="M9 50c9-8 18-6 26-3 10 4 21 4 32-2"/><path d="M39 47c0-16 5-27 16-36M54 12c-8-1-14 2-18 8M55 12c7 0 12 3 15 8M52 21c-7 0-11 3-14 8"/><path d="M17 54h42"/></g>;
    case "skull-neanderthal":
      return <g {...common}><path d="M13 33C13 15 25 7 42 7c16 0 27 10 26 26 0 9-6 15-14 18l-4 10H24l-2-11c-6-4-9-9-9-17Z"/><path d="M20 27c12-5 27-5 41 0"/><circle cx="29" cy="35" r="4"/><circle cx="50" cy="35" r="4"/><path d="M40 41v8M26 53h26"/></g>;
    case "dna":
      return <g {...common}><path d="M21 7c28 13 28 39 0 52M55 7C27 20 27 46 55 59"/><path d="M27 13h22M22 23h32M22 43h32M27 53h22M20 33h36"/></g>;
    default:
      return <g {...common}><path d="M12 34c10-20 42-20 52 0-10 20-42 20-52 0Z"/><circle cx="38" cy="34" r="8"/></g>;
  }
}
