"use client";

import { useRef, useEffect } from "react";

const cities = [
  { name: "Accra", lat: 5.6037, lon: -0.1870, color: "#22c55e" },
  { name: "London", lat: 51.5074, lon: -0.1278, color: "#3b82f6" },
  { name: "New York", lat: 40.7128, lon: -74.0060, color: "#ef4444" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, color: "#f59e0b" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, color: "#8b5cf6" },
  { name: "Shanghai", lat: 31.2304, lon: 121.4737, color: "#ec4899" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, color: "#06b6d4" },
  { name: "Lagos", lat: 6.5244, lon: 3.3792, color: "#84cc16" },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219, color: "#14b8a6" },
];

const continents = [
  [[35,-5],[30,30],[10,40],[-35,20],[-35,-10],[5,-15],[35,-5]],
  [[70,-10],[60,40],[40,30],[35,-5],[50,-10],[70,-10]],
  [[70,40],[60,140],[10,120],[25,50],[40,30],[70,40]],
  [[70,-170],[50,-60],[25,-80],[15,-100],[30,-120],[60,-130],[70,-170]],
  [[10,-80],[-55,-70],[-55,-35],[5,-35],[10,-80]],
  [[-10,115],[-40,150],[-40,115],[-10,115]],
];

export default function LiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const project = (lat: number, lon: number, cx: number, cy: number, r: number, rot: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + rot) * (Math.PI / 180);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);
      return { x: cx + x, y: cy - y, z, visible: z > 0 };
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.4;

      ctx.clearRect(0, 0, w, h);

      // Glow
      const glow = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.4);
      glow.addColorStop(0, "rgba(6,182,212,0.12)");
      glow.addColorStop(1, "rgba(6,182,212,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Sphere
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      const sg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      sg.addColorStop(0, "#1e3a5f");
      sg.addColorStop(0.5, "#0f172a");
      sg.addColorStop(1, "#020617");
      ctx.fillStyle = sg;
      ctx.fill();

      // Grid (latitude)
      ctx.strokeStyle = "rgba(6,182,212,0.15)";
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = 0; lon <= 360; lon += 5) {
          const p = project(lat, lon, cx, cy, r, rotation);
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y); }
          else started = false;
        }
        ctx.stroke();
      }
      // Grid (longitude)
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 5) {
          const p = project(lat, lon, cx, cy, r, rotation);
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y); }
          else started = false;
        }
        ctx.stroke();
      }

      // Continents
      ctx.strokeStyle = "rgba(34,197,94,0.5)";
      ctx.lineWidth = 1.5;
      continents.forEach(cont => {
        ctx.beginPath();
        let started = false;
        cont.forEach(([lat, lon]) => {
          const p = project(lat, lon, cx, cy, r, rotation);
          if (p.visible) { if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y); }
        });
        ctx.stroke();
      });

      // Cities + routes from Accra
      const time = Date.now() / 1000;
      const accra = project(5.6037, -0.1870, cx, cy, r, rotation);
      cities.forEach(city => {
        const p = project(city.lat, city.lon, cx, cy, r, rotation);
        if (!p.visible) return;

        // Route lines from Accra
        if (accra.visible && city.name !== "Accra") {
          ctx.beginPath();
          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = city.color + "55";
          ctx.lineWidth = 1;
          const mx = (accra.x + p.x) / 2, my = (accra.y + p.y) / 2 - 25;
          ctx.moveTo(accra.x, accra.y);
          ctx.quadraticCurveTo(mx, my, p.x, p.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Pulse
        const pulse = Math.sin(time * 2.5 + city.lat) * 0.5 + 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = city.color + "25";
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = city.color;
        ctx.fill();

        // Label
        ctx.font = "bold 9px system-ui";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.textAlign = "center";
        ctx.fillText(city.name, p.x, p.y - 10);
      });

      rotation += 0.12;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />;
}
