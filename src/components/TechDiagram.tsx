import { useCallback, useEffect, useRef, useState } from "react";

interface TechLogo {
  name: TechLogoName;
  path: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  className: string;
  attachedTo: TechLogoName[]; // Array of logo names this connects to
}

type TechLogoName = "Java" | "MongoDB" | "Redis" | "Riak" | "OpenStack" | "Hadoop" | "Ruby" | "Erlang" | "AWS";

const initialLogos: TechLogo[] = [
  {
    name: "Java",
    path: (await import("../logos/java-vertical.svg")).default,
    x: 0,
    y: 58.6,
    className: "w-10 px-1",
    attachedTo: [],
  },
  {
    name: "MongoDB",
    path: (await import("../logos/MongoDB-Logo.svg.png")).default,
    x: 22.7,
    y: 56.7,
    className: "w-32 py-2",
    attachedTo: ["Redis", "Java"],
  },
  {
    name: "Redis",
    path: (await import("../logos/Redis_Logo.svg")).default,
    x: 15.4,
    y: 82.9,
    className: "w-24 py-2",
    attachedTo: ["OpenStack", "Java"],
  },
  {
    name: "Riak",
    path: (await import("../logos/Riak_logo.svg")).default,
    x: 50.7,
    y: 50.9,
    className: "w-16 py-3",
    attachedTo: ["Hadoop", "MongoDB"],
  },
  {
    name: "OpenStack",
    path: (await import("../logos/openstack-1.svg")).default,
    x: 49,
    y: 76.8,
    className: "w-18",
    attachedTo: ["Redis", "Hadoop", "Riak", "MongoDB"],
  },
  {
    name: "Hadoop",
    path: (await import("../logos/hadoop_rgb.png")).default,
    x: 70,
    y: 77.4,
    className: "w-32",
    attachedTo: ["OpenStack", "Ruby"],
  },
  {
    name: "Ruby",
    path: (await import("../logos/Ruby_logo.svg")).default,
    x: 71.7,
    y: 45.9,
    className: "w-18 px-2",
    attachedTo: ["OpenStack", "AWS", "Riak"],
  },
  {
    name: "Erlang",
    path: (await import("../logos/Erlang_logo.svg")).default,
    x: 80,
    y: 17.9,
    className: "w-16",
    attachedTo: ["AWS"],
  },
  {
    name: "AWS",
    path: (await import("../logos/AmazonWebservices_Logo.svg")).default,
    x: 45.2,
    y: 10.9,
    className: "w-32",
    attachedTo: ["Riak", "MongoDB"],
  },
];

function CoordinateEditor({ logos, onUpdate }: { logos: TechLogo[]; onUpdate: (logos: TechLogo[]) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".editor-content")) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    },
    [isDragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const updateLogo = (index: number, field: "x" | "y", value: number) => {
    const updated = logos.map((logo, i) => (i === index ? { ...logo, [field]: Number(value.toFixed(1)) } : logo));
    onUpdate(updated);
  };

  const exportCoordinates = () => {
    const code = `const initialLogos: TechLogo[] = [\n${logos
      .map(
        (tech) =>
          `  { name: "${tech.name}", path: "${tech.path}", x: ${tech.x}, y: ${tech.y}, className: "${
            tech.className
          }", attachedTo: ${JSON.stringify(tech.attachedTo)} },`
      )
      .join("\n")}\n];`;
    console.log(code);
    navigator.clipboard.writeText(code);
    alert("Coordinates copied to clipboard! Paste this as 'initialLogos' in your code.");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-800 z-50 text-sm font-bold"
      >
        📐 Edit Coordinates
      </button>
    );
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg overflow-clip border-2 border-gray-900 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "400px",
        maxHeight: "600px",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-bold text-lg">Logo Position Editor</h3>
        <button onClick={() => setIsOpen(false)} className="text-xl hover:text-gray-300">
          ×
        </button>
      </div>

      <div className="editor-content p-4 overflow-y-auto max-h-[500px]">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
          <strong>Tip:</strong> Positions are in percentages (0-100%). The diagram will scale responsively.
        </div>

        {logos.map((tech, index) => (
          <div key={tech.name} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
            <div className="font-bold text-gray-900 mb-3">{tech.name}</div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">X Position (%)</label>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{tech.x}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tech.x}
                  onChange={(e) => updateLogo(index, "x", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-gray-600">Y Position (%)</label>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{tech.y}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tech.y}
                  onChange={(e) => updateLogo(index, "y", parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={exportCoordinates}
          className="w-full bg-gray-900 text-white px-4 py-3 rounded mt-4 hover:bg-gray-800 font-bold text-sm"
        >
          📋 Copy Code to Clipboard
        </button>
      </div>
    </div>
  );
}

export function TechDiagram() {
  const [logos, setLogos] = useState<TechLogo[]>(initialLogos);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 700, height: 420 });
  const [logoElements, setLogoElements] = useState<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = 420; // Static height
        setContainerSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Force rerender when logos positions change to update lines
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [logos]);

  // Calculate actual pixel positions from percentages
  const getPixelPosition = (percentX: number, percentY: number) => {
    return {
      x: (percentX / 100) * containerSize.width,
      y: (percentY / 100) * containerSize.height,
    };
  };

  // Calculate center point of a logo element including its dimensions
  const getLogoCenter = (logo: TechLogo, element: HTMLDivElement | null) => {
    const pos = getPixelPosition(logo.x, logo.y);
    if (element) {
      const rect = element.getBoundingClientRect();
      return {
        x: pos.x + rect.width / 2,
        y: pos.y + rect.height / 2,
      };
    }
    // Fallback with estimated size
    return {
      x: pos.x + 30,
      y: pos.y + 30,
    };
  };

  // Generate lines based on attachedTo connections
  const generateLines = () => {
    const lines: React.ReactElement[] = [];
    const gradients: React.ReactElement[] = [];
    let lineKey = 0;

    logos.forEach((fromLogo) => {
      const fromElement = logoElements.get(fromLogo.name);
      const fromCenter = getLogoCenter(fromLogo, fromElement || null);

      fromLogo.attachedTo.forEach((toName) => {
        const toLogo = logos.find((l) => l.name === toName);
        if (toLogo) {
          const toElement = logoElements.get(toLogo.name);
          const toCenter = getLogoCenter(toLogo, toElement || null);

          const gradientId = `gradient-${lineKey}`;

          // Create a gradient along the line direction with fade at both ends
          gradients.push(
            <linearGradient
              key={gradientId}
              id={gradientId}
              x1={fromCenter.x}
              y1={fromCenter.y}
              x2={toCenter.x}
              y2={toCenter.y}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#999" stopOpacity="0.1" />
              <stop offset="20%" stopColor="#999" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#999" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#999" stopOpacity="0" />
            </linearGradient>
          );

          lines.push(
            <line
              key={`line-${lineKey++}`}
              x1={fromCenter.x}
              y1={fromCenter.y}
              x2={toCenter.x}
              y2={toCenter.y}
              stroke={`url(#${gradientId})`}
              strokeWidth="2"
            />
          );
        }
      });
    });

    return { lines, gradients };
  };

  const { lines, gradients } = generateLines();
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <>
      {isDev && <CoordinateEditor logos={logos} onUpdate={setLogos} />}
      <div className="">
        <div ref={containerRef} className="relative min-w-[500px] h-[420px] p-4">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>{gradients}</defs>
            {lines}
          </svg>

          {logos.map((tech) => {
            const pos = getPixelPosition(tech.x, tech.y);
            return (
              <div
                key={tech.name}
                ref={(el) => {
                  if (el && !logoElements.has(tech.name)) {
                    setLogoElements((prev) => {
                      const newMap = new Map(prev);
                      newMap.set(tech.name, el);
                      return newMap;
                    });
                  }
                }}
                className="absolute bg-white rounded-2xl shadow-lg p-2 border-2 border-gray-200 hover:scale-105 transition-transform"
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  zIndex: 1,
                }}
              >
                <img
                  src={tech.path}
                  alt={tech.name}
                  className={`${tech.className} object-contain`}
                  onError={(e) => {
                    console.error(`Failed to load logo: ${tech.name} at ${tech.path}`);
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
