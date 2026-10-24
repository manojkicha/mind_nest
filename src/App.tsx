import { useEffect, useMemo, useRef, useState } from "react";

type Screen = "welcome" | "quiz" | "report" | "games";
type Game = "breathe" | "tap" | "pause" | "smile" | "snake" | "xo";

const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board: string[]) {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return board.every(Boolean) ? "draw" : "";
}

const questions = [
  {
    eyebrow: "Energy check",
    text: "Your morning routine felt like…",
    answers: [
      ["A gentle stroll", 0],
      ["A relay race", 1],
      ["A fire drill with cereal", 2],
    ],
  },
  {
    eyebrow: "Patience check",
    text: "Someone just asked “why?” for the 47th time. You…",
    answers: [
      ["Smile and answer", 0],
      ["Need one deep breath", 1],
      ["Consider changing my name", 2],
    ],
  },
  {
    eyebrow: "Body check",
    text: "How is your body feeling right now?",
    answers: [
      ["Loose and comfortable", 0],
      ["A little wound up", 1],
      ["Like a human pretzel", 2],
    ],
  },
  {
    eyebrow: "Focus check",
    text: "How many tabs are open in your brain?",
    answers: [
      ["Just a tidy few", 0],
      ["About seventeen", 1],
      ["The browser has crashed", 2],
    ],
  },
  {
    eyebrow: "Support check",
    text: "How supported do you feel today?",
    answers: [
      ["I have my people", 0],
      ["I could use a hand", 1],
      ["I feel like a one-person circus", 2],
    ],
  },
] as const;

const results = [
  {
    max: 2,
    label: "Steady",
    color: "#54a68a",
    message: "Your nervous system seems to have some room to breathe.",
    note: "A tiny reset now can help you keep that steady energy going.",
  },
  {
    max: 6,
    label: "Stretched",
    color: "#e59c53",
    message: "You’re carrying a bit more than usual today.",
    note: "Nothing is wrong with you. A few quiet minutes can help create some space.",
  },
  {
    max: 10,
    label: "Overloaded",
    color: "#d56b62",
    message: "Your cup is looking pretty full right now.",
    note: "Let’s make the next two minutes softer. You deserve support, not pressure.",
  },
];

function Mark() {
  return (
    <div className="mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [game, setGame] = useState<Game | null>(null);
  const [breath, setBreath] = useState(0);
  const [taps, setTaps] = useState<number[]>([]);
  const [photo, setPhoto] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [snake, setSnake] = useState([{ x: 3, y: 5 }, { x: 2, y: 5 }]);
  const [food, setFood] = useState({ x: 8, y: 5 });
  const foodRef = useRef({ x: 8, y: 5 });
  const directionRef = useRef({ x: 1, y: 0 });
  const [xoBoard, setXoBoard] = useState<string[]>(Array(9).fill(""));

  const score = answers.reduce((sum, value) => sum + value, 0);
  const result = results.find((item) => score <= item.max) ?? results[2];
  const percent = Math.round((score / 10) * 100);

  useEffect(() => {
    if (game !== "breathe") return;
    const timer = window.setInterval(() => setBreath((value) => value + 1), 4000);
    return () => window.clearInterval(timer);
  }, [game]);

  useEffect(() => {
    if (game !== "snake") return;
    setSnake([{ x: 3, y: 5 }, { x: 2, y: 5 }]);
    setFood({ x: 8, y: 5 });
    foodRef.current = { x: 8, y: 5 };
    directionRef.current = { x: 1, y: 0 };
    const timer = window.setInterval(() => {
      setSnake((current) => {
        const head = current[0];
        const next = {
          x: (head.x + directionRef.current.x + 12) % 12,
          y: (head.y + directionRef.current.y + 12) % 12,
        };
        if (current.some((part) => part.x === next.x && part.y === next.y)) {
          return [{ x: 3, y: 5 }, { x: 2, y: 5 }];
        }
        if (next.x === foodRef.current.x && next.y === foodRef.current.y) {
          const nextFood = { x: (foodRef.current.x + 5) % 12, y: (foodRef.current.y + 7) % 12 };
          foodRef.current = nextFood;
          setFood(nextFood);
          return [next, ...current];
        }
        return [next, ...current.slice(0, -1)];
      });
    }, 240);
    return () => window.clearInterval(timer);
  }, [game]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const directions: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      if (directions[event.key]) {
        event.preventDefault();
        changeDirection(directions[event.key].x, directions[event.key].y);
      }
    }
    if (game === "snake") window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [game]);

  useEffect(() => {
    if (game === "smile") return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, [game]);

  useEffect(() => {
    if (game !== "xo" || getWinner(xoBoard)) return;
    const xCount = xoBoard.filter((cell) => cell === "X").length;
    const oCount = xoBoard.filter((cell) => cell === "O").length;
    if (xCount <= oCount) return;
    const timer = window.setTimeout(() => {
      setXoBoard((current) => {
        if (getWinner(current)) return current;
        const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        const move = preferred.find((index) => !current[index]);
        if (move === undefined) return current;
        const next = [...current];
        next[move] = "O";
        return next;
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [game, xoBoard]);

  const breathPrompt = useMemo(
    () => ["Breathe in", "Hold softly", "Breathe out", "Rest"][breath % 4],
    [breath],
  );

  function choose(value: number) {
    const next = [...answers, value];
    setAnswers(next);
    if (step === questions.length - 1) {
      setScreen("report");
    } else {
      setStep((current) => current + 1);
    }
  }

  function restart() {
    setScreen("welcome");
    setStep(0);
    setAnswers([]);
    setGame(null);
    setTaps([]);
    setPhoto("");
    setXoBoard(Array(9).fill(""));
  }

  function changeDirection(x: number, y: number) {
    const current = directionRef.current;
    if (current.x + x !== 0 || current.y + y !== 0) directionRef.current = { x, y };
  }

  async function startCamera() {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setCameraError("Camera access wasn’t available. Check your browser permission and try again.");
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function playXo(index: number) {
    if (xoBoard[index] || getWinner(xoBoard)) return;
    const xCount = xoBoard.filter((cell) => cell === "X").length;
    const oCount = xoBoard.filter((cell) => cell === "O").length;
    if (xCount !== oCount) return;
    setXoBoard((current) => current.map((cell, cellIndex) => cellIndex === index ? "X" : cell));
  }

  const levelCards = {
    Steady: [
      { id: "tap" as const, number: "01", title: "Gratitude Constellation", time: "2 min", tone: "sage", icon: "✦" },
      { id: "breathe" as const, number: "02", title: "Balance the Mind", time: "1 min", tone: "blue", icon: "≈" },
      { id: "pause" as const, number: "03", title: "Memory Meadow", time: "30 sec", tone: "peach", icon: "⌁" },
    ],
    Stretched: [
      { id: "tap" as const, number: "01", title: "Close the Mind Tabs", time: "2 min", tone: "peach", icon: "×" },
      { id: "breathe" as const, number: "02", title: "Box Breathing", time: "1 min", tone: "sage", icon: "□" },
      { id: "pause" as const, number: "03", title: "Thought Parking Lot", time: "30 sec", tone: "blue", icon: "↓" },
    ],
    Overloaded: [
      { id: "tap" as const, number: "01", title: "5–4–3–2–1 Grounding", time: "2 min", tone: "sage", icon: "◎" },
      { id: "breathe" as const, number: "02", title: "Slow the Storm", time: "1 min", tone: "blue", icon: "≈" },
      { id: "pause" as const, number: "03", title: "Safe Place Builder", time: "30 sec", tone: "peach", icon: "⌂" },
    ],
  }[result.label];
  const gameCards = [
    ...levelCards,
    { id: "smile" as const, number: "04", title: "Catch Your Smile", time: "1 min", tone: "blue", icon: "◡" },
    { id: "snake" as const, number: "05", title: "Gentle Snake", time: "2 min", tone: "sage", icon: "↝" },
    { id: "xo" as const, number: "06", title: "Quiet Tic-Tac-Toe", time: "2 min", tone: "peach", icon: "×○" },
  ];

  return (
    <main>
      <nav>
        <button className="brand" onClick={restart} aria-label="Return home">
          <Mark />
          <span>Mind Nest AI</span>
        </button>
        <span className="nav-note">A little space for you</span>
      </nav>

      {screen === "welcome" && (
        <section className="welcome">
          <div className="welcome-copy">
            <p className="kicker">A 2-minute check-in</p>
            <h1>Care for the person who cares for everyone.</h1>
            <p className="lede">
              Five light questions to see how full your cup is — then a tiny activity to help you feel a little more like you.
            </p>
            <button className="primary" onClick={() => setScreen("quiz")}>
              Check in with myself <span aria-hidden="true">→</span>
            </button>
            <p className="privacy">No sign-up. No judgement. Just a moment for you.</p>
          </div>
          <figure className="hero-art">
            <img
              src="https://images.unsplash.com/photo-1504298589646-858f2c46ce1d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080"
              alt="A happy baby in a pink cardigan smiling, with soft twinkling lights behind"
            />
            <p>Today, “good enough”<br />is genuinely enough.</p>
            <figcaption>Photo by Carlos Martinez on Unsplash</figcaption>
          </figure>
        </section>
      )}

      {screen === "quiz" && (
        <section className="quiz">
          <div className="progress-row">
            <span>Question {step + 1} of {questions.length}</span>
            <button onClick={restart}>Exit check-in</button>
          </div>
          <div className="progress"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
          <div className="question-card" key={step}>
            <p className="kicker">{questions[step].eyebrow}</p>
            <h2>{questions[step].text}</h2>
            <div className="answers">
              {questions[step].answers.map(([label, value], index) => (
                <button key={label} onClick={() => choose(value)}>
                  <span>{String.fromCharCode(65 + index)}</span>
                  {label}
                  <b aria-hidden="true">→</b>
                </button>
              ))}
            </div>
          </div>
          <p className="quiz-note">There are no right answers here.</p>
        </section>
      )}

      {screen === "report" && (
        <section className="report">
          <div className="report-copy">
            <p className="kicker">Your check-in</p>
            <h1>Your stress looks<br /><em style={{ color: result.color }}>{result.label.toLowerCase()}.</em></h1>
            <p className="result-message">{result.message}</p>
            <p>{result.note}</p>
            <button className="primary" onClick={() => setScreen("games")}>
              Choose a small reset <span aria-hidden="true">→</span>
            </button>
            <button className="text-button" onClick={restart}>Retake check-in</button>
          </div>
          <div className="meter-card">
            <p>Your stress load</p>
            <div className="meter-ring" style={{ "--score": `${Math.max(8, percent)}%`, "--result": result.color } as React.CSSProperties}>
              <div><strong>{percent}%</strong><span>right now</span></div>
            </div>
            <div className="scale"><span>Steady</span><span>Stretched</span><span>Overloaded</span></div>
            <small>This is a reflection, not a medical assessment.</small>
          </div>
        </section>
      )}

      {screen === "games" && !game && (
        <section className="games">
          <p className="kicker">For a {result.label.toLowerCase()} mind</p>
          <h1>Your personalized mind gym.</h1>
          <p className="lede">
            These activities were selected for your current stress level. No high scores — pick the one that feels easiest.
          </p>
          <div className="game-grid">
            {gameCards.map((item) => (
              <button className={`game-card ${item.tone}`} key={item.id} onClick={() => setGame(item.id)}>
                <span className="game-number">{item.number}</span>
                <div className="game-icon">{item.icon}</div>
                <h2>{item.title}</h2>
                <p>{item.time}</p>
                <b>Begin →</b>
              </button>
            ))}
          </div>
        </section>
      )}

      {screen === "games" && game && (
        <section className="activity">
          <button className="back" onClick={() => { setGame(null); setTaps([]); setPhoto(""); setXoBoard(Array(9).fill("")); }}>← All activities</button>
          {game === "breathe" && (
            <>
              <p className="kicker">
                {result.label === "Steady" ? "Keep your balance" : result.label === "Stretched" ? "Four-count box breathing" : "Make the storm smaller"}
              </p>
              <h1>{breathPrompt}</h1>
              <div className="breath-blob"><span>{breath % 4 + 1}</span></div>
              <p>
                {result.label === "Overloaded"
                  ? "Follow only this shape. Let the rest of the world become background noise."
                  : "Let your shoulders drop. Nothing else needs your attention right now."}
              </p>
            </>
          )}
          {game === "tap" && (
            <>
              <p className="kicker">
                {result.label === "Steady" ? "Notice what is good" : result.label === "Stretched" ? "One tab at a time" : "Return to your senses"}
              </p>
              <h1>
                {taps.length === 8
                  ? result.label === "Steady" ? "Your sky is brighter." : "Your mind has more room."
                  : result.label === "Steady" ? "Light your constellation" : result.label === "Stretched" ? "Close the mind tabs" : "Find eight things around you"}
              </h1>
              <div className="bubbles">
                {Array.from({ length: 8 }, (_, index) => (
                  <button
                    aria-label={
                      result.label === "Steady"
                        ? `Add gratitude star ${index + 1}`
                        : result.label === "Stretched"
                          ? `Close mental tab ${index + 1}`
                          : `Mark grounding detail ${index + 1}`
                    }
                    className={taps.includes(index) ? "popped" : ""}
                    key={index}
                    onClick={() => setTaps((current) => current.includes(index) ? current : [...current, index])}
                  />
                ))}
              </div>
              <p>
                {taps.length} of 8{" "}
                {result.label === "Steady" ? "bright moments noticed" : result.label === "Stretched" ? "mental tabs closed" : "grounding details found"}
              </p>
            </>
          )}
          {game === "pause" && (
            <>
              <p className="kicker">
                {result.label === "Steady" ? "Plant a good memory" : result.label === "Stretched" ? "Set it down for now" : "Build a safe inner place"}
              </p>
              <div className="permission">
                <Mark />
                <h1>
                  {result.label === "Steady" ? "Save one good moment." : result.label === "Stretched" ? "Park that thought." : "You are safe in this moment."}
                </h1>
                <p>
                  {result.label === "Steady"
                    ? "Recall one small thing from today you would like to remember. Give it a color, a sound, and a place in your mind."
                    : result.label === "Stretched"
                      ? "Name the thought asking for your attention. Imagine placing it on a shelf. You can return to it later — not now."
                      : "Picture a place where nothing is required of you. Add a comfortable seat, soft light, and one sound that settles you."}
                </p>
                <span>{result.label === "Steady" ? "Let the memory take root." : result.label === "Stretched" ? "The thought is stored, not lost." : "Stay here for one slow breath."}</span>
              </div>
            </>
          )}
          {game === "smile" && (
            <>
              <p className="kicker">A smile just for you</p>
              <h1>Catch a lighter moment.</h1>
              <div className="camera-card">
                {photo ? (
                  <img src={photo} alt="Your captured smiling portrait" />
                ) : (
                  <video ref={videoRef} playsInline muted aria-label="Camera preview" />
                )}
                <canvas ref={canvasRef} hidden />
                {!photo && !cameraOn && <button className="primary" onClick={startCamera}>Turn on my camera</button>}
                {!photo && cameraOn && <button className="primary shutter" onClick={takePhoto}>Take my smile photo</button>}
                {photo && <button className="primary" onClick={() => setPhoto("")}>Take another</button>}
                {cameraError && <p className="camera-error" role="alert">{cameraError}</p>}
              </div>
              <p>Your photo stays in this browser and is not uploaded or saved by Mind Nest AI.</p>
            </>
          )}
          {game === "snake" && (
            <>
              <p className="kicker">Slow focus, no pressure</p>
              <h1>Guide the gentle snake.</h1>
              <div className="snake-board" aria-label={`Snake game. Current length ${snake.length}`}>
                {snake.map((part, index) => (
                  <span className={index === 0 ? "snake-head" : "snake-part"} key={`${part.x}-${part.y}-${index}`} style={{ gridColumn: part.x + 1, gridRow: part.y + 1 }} />
                ))}
                <span className="snake-food" style={{ gridColumn: food.x + 1, gridRow: food.y + 1 }} />
              </div>
              <p>Length: {snake.length}. Use arrow keys or the buttons. The edges gently wrap around.</p>
              <div className="snake-controls">
                <button aria-label="Move up" onClick={() => changeDirection(0, -1)}>↑</button>
                <button aria-label="Move left" onClick={() => changeDirection(-1, 0)}>←</button>
                <button aria-label="Move down" onClick={() => changeDirection(0, 1)}>↓</button>
                <button aria-label="Move right" onClick={() => changeDirection(1, 0)}>→</button>
              </div>
            </>
          )}
          {game === "xo" && (
            <>
              <p className="kicker">A tiny strategy break</p>
              <h1>Quiet Tic-Tac-Toe</h1>
              <p className="xo-status" aria-live="polite">
                {getWinner(xoBoard) === "X"
                  ? "You won — nicely played."
                  : getWinner(xoBoard) === "O"
                    ? "The Nest won this round."
                    : getWinner(xoBoard) === "draw"
                      ? "A peaceful draw."
                      : xoBoard.filter(Boolean).length % 2 === 0
                        ? "Your turn. You are X."
                        : "The Nest is thinking…"}
              </p>
              <div className="xo-board">
                {xoBoard.map((cell, index) => (
                  <button
                    aria-label={cell ? `Cell ${index + 1}: ${cell}` : `Play in cell ${index + 1}`}
                    className={cell ? `xo-${cell.toLowerCase()}` : ""}
                    key={index}
                    onClick={() => playXo(index)}
                  >
                    {cell}
                  </button>
                ))}
              </div>
              <button className="primary" onClick={() => setXoBoard(Array(9).fill(""))}>Play again</button>
              <p>No score is kept. This is just a small place for your mind to play.</p>
            </>
          )}
        </section>
      )}

      <footer>
        <span>Made for full hearts & full hands.</span>
        <span>If stress feels unmanageable, reach out to someone you trust or a health professional.</span>
      </footer>
    </main>
  );
}
