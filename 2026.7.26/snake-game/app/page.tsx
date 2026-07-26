"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Status = "ready" | "playing" | "paused" | "over";

const SIZE = 20;
const START: Point[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 }, DOWN: { x: 0, y: 1 }, LEFT: { x: -1, y: 0 }, RIGHT: { x: 1, y: 0 },
};
const OPPOSITE: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };

function makeFood(snake: Point[]): Point {
  const free: Point[] = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 4, y: 4 };
}

export default function Home() {
  const [snake, setSnake] = useState<Point[]>(START);
  const [food, setFood] = useState<Point>({ x: 14, y: 10 });
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(125);
  const direction = useRef<Direction>("RIGHT");
  const queued = useRef<Direction>("RIGHT");

  useEffect(() => { setBest(Number(localStorage.getItem("snake-best") || 0)); }, []);

  const reset = useCallback(() => {
    setSnake(START); setFood({ x: 14, y: 10 }); setScore(0);
    direction.current = "RIGHT"; queued.current = "RIGHT"; setStatus("ready");
  }, []);

  const turn = useCallback((next: Direction) => {
    if (OPPOSITE[direction.current] !== next) queued.current = next;
    if (status === "ready") setStatus("playing");
  }, [status]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const keys: Record<string, Direction> = { ArrowUp: "UP", w: "UP", W: "UP", ArrowDown: "DOWN", s: "DOWN", S: "DOWN", ArrowLeft: "LEFT", a: "LEFT", A: "LEFT", ArrowRight: "RIGHT", d: "RIGHT", D: "RIGHT" };
      if (keys[event.key]) { event.preventDefault(); turn(keys[event.key]); }
      if (event.code === "Space") { event.preventDefault(); setStatus((s) => s === "playing" ? "paused" : s === "paused" ? "playing" : s); }
      if (event.key === "Enter" && status === "over") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset, status, turn]);

  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        direction.current = queued.current;
        const v = VECTORS[direction.current];
        const head = { x: current[0].x + v.x, y: current[0].y + v.y };
        const hitWall = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE;
        const ate = head.x === food.x && head.y === food.y;
        const body = ate ? current : current.slice(0, -1);
        const hitSelf = body.some((part) => part.x === head.x && part.y === head.y);
        if (hitWall || hitSelf) { setStatus("over"); return current; }
        const next = [head, ...body];
        if (ate) {
          setFood(makeFood(next));
          setScore((value) => {
            const newScore = value + 10;
            setBest((oldBest) => { const updated = Math.max(oldBest, newScore); localStorage.setItem("snake-best", String(updated)); return updated; });
            return newScore;
          });
        }
        return next;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [food, speed, status]);

  const statusText = status === "playing" ? "正在觅食" : status === "paused" ? "已暂停" : status === "over" ? "撞到了！" : "准备出发";

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#game" aria-label="贪吃蛇首页"><span className="brand-mark">S</span><span>贪吃蛇</span></a>
        <div className="top-actions"><span className="key-help">方向键 / WASD 操作</span><button className="icon-button" onClick={() => setStatus((s) => s === "playing" ? "paused" : s === "paused" ? "playing" : s)} aria-label="暂停或继续">{status === "paused" ? "▶" : "Ⅱ"}</button></div>
      </header>

      <section className="hero" id="game">
        <div className="intro">
          <p className="eyebrow"><span /> 经典小游戏 · 随时来一局</p>
          <h1>吃得更多，<br /><em>长得更长。</em></h1>
          <p className="subtitle">一个简单、上头的贪吃蛇游戏。避开墙壁和自己，看看你能拿到多少分。</p>
          <div className="score-row">
            <div><span>本局得分</span><strong>{String(score).padStart(3, "0")}</strong></div>
            <div><span>最高纪录</span><strong>{String(best).padStart(3, "0")}</strong></div>
          </div>
          <div className="difficulty">
            <span>游戏速度</span>
            <div className="segments" aria-label="选择游戏速度">
              {[{ label: "悠闲", value: 175 }, { label: "经典", value: 125 }, { label: "疾速", value: 80 }].map((item) => <button key={item.value} className={speed === item.value ? "active" : ""} onClick={() => setSpeed(item.value)} disabled={status === "playing"}>{item.label}</button>)}
            </div>
          </div>
        </div>

        <div className="game-card">
          <div className="game-meta"><div><i className={`dot ${status}`} /> {statusText}</div><span>长度 {snake.length}</span></div>
          <div className="board-wrap">
            <div className="board" role="application" aria-label="贪吃蛇游戏区域" style={{ "--size": SIZE } as React.CSSProperties}>
              {Array.from({ length: SIZE * SIZE }).map((_, index) => {
                const x = index % SIZE, y = Math.floor(index / SIZE);
                const partIndex = snake.findIndex((part) => part.x === x && part.y === y);
                const isFood = food.x === x && food.y === y;
                return <div key={index} className={`cell ${partIndex === 0 ? "head" : partIndex > 0 ? "snake" : ""} ${isFood ? "food" : ""}`}>{partIndex === 0 && <><b className="eye one" /><b className="eye two" /></>}</div>;
              })}
              {status !== "playing" && <div className="overlay"><div className="overlay-card"><span>{status === "over" ? "本局得分" : status === "paused" ? "休息一下" : "准备好了吗？"}</span>{status === "over" && <strong>{score}</strong>}<button onClick={() => status === "over" ? reset() : setStatus("playing")}>{status === "over" ? "再来一局" : status === "paused" ? "继续游戏" : "开始游戏"}</button><small>{status === "over" ? "按 Enter 也可以重开" : "按空格键暂停 / 继续"}</small></div></div>}
            </div>
          </div>
          <div className="mobile-controls" aria-label="触屏方向键">
            <button onClick={() => turn("UP")} aria-label="向上">↑</button><div><button onClick={() => turn("LEFT")} aria-label="向左">←</button><button onClick={() => turn("DOWN")} aria-label="向下">↓</button><button onClick={() => turn("RIGHT")} aria-label="向右">→</button></div>
          </div>
          <div className="game-footer"><span><kbd>SPACE</kbd> 暂停</span><button onClick={reset}>↻ 重新开始</button></div>
        </div>
      </section>

      <footer><span>不收集任何数据 · 最高分仅保存在你的设备上</span><span>祝你玩得开心 :)</span></footer>
    </main>
  );
}
