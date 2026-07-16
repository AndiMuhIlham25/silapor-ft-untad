import React, { useState } from "react";
import CuacaBackground from "./CuacaBackground.jsx";

export default function CuacaBand({ eyebrow, title, sub }) {
  const [mood, setMood] = useState("light");
  return (
    <section className={"hero-cuaca band-cuaca mood-" + mood}>
      <CuacaBackground onMood={setMood} />
      <div className="hero-content">
        <span className="tag"><span className="tag-dot" /> {eyebrow}</span>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </section>
  );
}
