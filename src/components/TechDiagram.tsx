import { useCallback, useEffect, useRef, useState } from "react";

interface TechLogo {
  name: TechLogoName;
  path: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // pixels
  height: number; // pixels
  paddingX: number; // pixels
  paddingY: number; // pixels
  connectedTo: TechLogoName[]; // Array of logo names this connects to
}

type TechLogoName =
  | "Java"
  | "MongoDB"
  | "Redis"
  | "Riak"
  | "OpenStack"
  | "Hadoop"
  | "Ruby"
  | "Erlang"
  | "AWS"
  | "Cassandra"
  | "VMware"
  | "Node.js";

type LogoDefinition = {
  name: TechLogoName;
  path: string;
  connectedTo: TechLogoName[];
};

const logoDefinitions: LogoDefinition[] = [
  { name: "Java", path: (await import("../logos/java-vertical.svg")).default, connectedTo: [] },
  {
    name: "MongoDB",
    path: (await import("../logos/MongoDB-Logo.svg")).default,
    connectedTo: ["Redis", "Java", "VMware"],
  },
  { name: "Redis", path: (await import("../logos/Redis_Logo.svg")).default, connectedTo: ["OpenStack", "Java"] },
  {
    name: "Riak",
    path: (await import("../logos/Riak_logo.svg")).default,
    connectedTo: ["Hadoop", "MongoDB"],
  },
  {
    name: "OpenStack",
    path: (await import("../logos/openstack-1.svg")).default,
    connectedTo: ["Redis", "Hadoop", "Riak", "MongoDB", "Node.js"],
  },
  {
    name: "Hadoop",
    path: (await import("../logos/hadoop.svg")).default,
    connectedTo: ["OpenStack", "Ruby", "Node.js"],
  },
  {
    name: "Ruby",
    path: (await import("../logos/Ruby_logo.svg")).default,
    connectedTo: ["OpenStack", "AWS", "Riak", "Cassandra"],
  },
  {
    name: "Erlang",
    path: (await import("../logos/Erlang_logo.svg")).default,
    connectedTo: ["AWS", "Cassandra", "VMware"],
  },
  {
    name: "AWS",
    path: (await import("../logos/AmazonWebservices_Logo.svg")).default,
    connectedTo: ["Riak", "MongoDB"],
  },
  {
    name: "Cassandra",
    path: (await import("../logos/Cassandra_logo.svg")).default,
    connectedTo: ["Erlang", "Ruby", "VMware"],
  },
  {
    name: "VMware",
    path: (await import("../logos/vmware_logo.svg")).default,
    connectedTo: ["MongoDB", "Erlang", "Cassandra", "Node.js"],
  },
  {
    name: "Node.js",
    path: (await import("../logos/nodejs.svg")).default,
    connectedTo: ["VMware", "Hadoop", "OpenStack"],
  },
];

const logoLayouts = [
  { name: "Java", x: 3.29, y: 49.79, width: 75.0, height: 74.0, paddingX: 0.0, paddingY: 4.0 },
  { name: "MongoDB", x: 17.93, y: 40.74, width: 128.0, height: 64.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Redis", x: 15.72, y: 70.76, width: 119.0, height: 54.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Riak", x: 41.66, y: 36.85, width: 80.0, height: 61.0, paddingX: 8.0, paddingY: 18.0 },
  { name: "OpenStack", x: 39.3, y: 62.56, width: 99.0, height: 84.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Hadoop", x: 59.47, y: 57.63, width: 125.0, height: 56.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Ruby", x: 58.05, y: 34.47, width: 83.0, height: 64.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Erlang", x: 56.65, y: 12.43, width: 76.0, height: 61.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "AWS", x: 28.59, y: 9.52, width: 145.0, height: 58.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Cassandra", x: 73.39, y: 10.48, width: 135.0, height: 81.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "VMware", x: 76.84, y: 42.14, width: 112.0, height: 40.0, paddingX: 8.0, paddingY: 8.0 },
  { name: "Node.js", x: 78.98, y: 74.05, width: 106.0, height: 47.0, paddingX: 8.0, paddingY: 8.0 },
];

const initialLogos: TechLogo[] = logoDefinitions.map((def) => {
  const layout = logoLayouts.find((l) => l.name === def.name);
  if (!layout) throw new Error(`Missing layout for ${def.name}`);
  return {
    name: def.name,
    path: def.path,
    connectedTo: def.connectedTo,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    paddingX: layout.paddingX,
    paddingY: layout.paddingY,
  };
});

function CoordinateEditor({
  logos,
  onUpdate,
  selectedLogos,
  onToggleSelection,
  onOpenChange,
}: {
  logos: TechLogo[];
  onUpdate: (logos: TechLogo[]) => void;
  selectedLogos: Set<TechLogoName>;
  onToggleSelection: (name: TechLogoName) => void;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 400, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [customIncrement, setCustomIncrement] = useState("10");
  const [customSizeIncrement, setCustomSizeIncrement] = useState("5");

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".editor-content")) return;
    if ((e.target as HTMLElement).closest(".resize-handle")) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        setSize({
          width: Math.max(300, resizeStart.width + deltaX),
          height: Math.max(400, resizeStart.height + deltaY),
        });
      } else if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    },
    [isDragging, isResizing, dragOffset, resizeStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const updateLogo = (index: number, field: keyof TechLogo, value: number) => {
    const updated = logos.map((logo, i) => (i === index ? { ...logo, [field]: Number(value.toFixed(1)) } : logo));
    onUpdate(updated);
  };

  const adjustAll = (field: "x" | "y" | "width" | "height", increment: number) => {
    const updated = logos.map((logo) => {
      if (selectedLogos.size > 0 && !selectedLogos.has(logo.name)) {
        return logo;
      }
      const newValue = logo[field] + increment;
      if (field === "x" || field === "y") {
        return {
          ...logo,
          [field]: Math.max(0, Math.min(100, Number(newValue.toFixed(1)))),
        };
      } else {
        return {
          ...logo,
          [field]: Math.max(10, Number(newValue.toFixed(1))),
        };
      }
    });
    onUpdate(updated);
  };

  const exportCoordinates = () => {
    const code = `const logoLayouts = [\n${logos
      .map(
        (tech) =>
          `  { name: "${tech.name}", x: ${Number(tech.x).toFixed(2)}, y: ${Number(tech.y).toFixed(2)}, width: ${Number(
            tech.width
          ).toFixed(2)}, height: ${Number(tech.height).toFixed(2)}, paddingX: ${Number(tech.paddingX).toFixed(
            2
          )}, paddingY: ${Number(tech.paddingY).toFixed(2)} },`
      )
      .join("\n")}\n];`;
    console.log(code);
    navigator.clipboard.writeText(code);
    alert("Layouts copied to clipboard!");
  };

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-800 z-50 text-sm"
      >
        📐 Edit Coordinates
      </button>
    );
  }

  return (
    <div
      className="fixed bg-white rounded-lg shadow-sm overflow-hidden border-2 border-gray-900 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg">Logo Position Editor</h3>
        <button onClick={() => setIsOpen(false)} className="text-xl hover:text-gray-300">
          ×
        </button>
      </div>

      <div className="editor-content p-4 overflow-y-auto" style={{ height: `${size.height - 60}px` }}>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
          <strong>Tip:</strong> Positions are in percentages (0-100%). The diagram will scale responsively.
        </div>

        <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Global Adjustments</h4>
            {selectedLogos.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{selectedLogos.size} selected</span>
                <button
                  onClick={() => {
                    const names = Array.from(selectedLogos);
                    names.forEach((name) => onToggleSelection(name));
                  }}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {selectedLogos.size > 0 && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
              Adjustments will only affect selected logos. Click logos in the diagram to select/deselect.
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">X Position</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => adjustAll("x", 5)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +5
                </button>
                <button
                  onClick={() => adjustAll("x", 10)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustAll("x", 20)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +20
                </button>
                <button
                  onClick={() => adjustAll("x", -5)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -5
                </button>
                <button
                  onClick={() => adjustAll("x", -10)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -10
                </button>
                <button
                  onClick={() => adjustAll("x", -20)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -20
                </button>
                <input
                  type="number"
                  value={customIncrement}
                  onChange={(e) => setCustomIncrement(e.target.value)}
                  className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded"
                  placeholder="Custom"
                />
                <button
                  onClick={() => adjustAll("x", parseFloat(customIncrement) || 0)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Y Position</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => adjustAll("y", 5)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +5
                </button>
                <button
                  onClick={() => adjustAll("y", 10)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustAll("y", 20)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +20
                </button>
                <button
                  onClick={() => adjustAll("y", -5)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -5
                </button>
                <button
                  onClick={() => adjustAll("y", -10)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -10
                </button>
                <button
                  onClick={() => adjustAll("y", -20)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -20
                </button>
                <input
                  type="number"
                  value={customIncrement}
                  onChange={(e) => setCustomIncrement(e.target.value)}
                  className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded"
                  placeholder="Custom"
                />
                <button
                  onClick={() => adjustAll("y", parseFloat(customIncrement) || 0)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Size Adjustments</h4>
            {selectedLogos.size > 0 && <span className="text-xs text-gray-600">{selectedLogos.size} selected</span>}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Width (px)</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => adjustAll("width", 5)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +5
                </button>
                <button
                  onClick={() => adjustAll("width", 10)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustAll("width", 20)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +20
                </button>
                <button
                  onClick={() => adjustAll("width", -5)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -5
                </button>
                <button
                  onClick={() => adjustAll("width", -10)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -10
                </button>
                <button
                  onClick={() => adjustAll("width", -20)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -20
                </button>
                <input
                  type="number"
                  value={customSizeIncrement}
                  onChange={(e) => setCustomSizeIncrement(e.target.value)}
                  className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded"
                />
                <button
                  onClick={() => adjustAll("width", parseFloat(customSizeIncrement) || 0)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-2 block">Height (px)</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => adjustAll("height", 5)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +5
                </button>
                <button
                  onClick={() => adjustAll("height", 10)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustAll("height", 20)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  +20
                </button>
                <button
                  onClick={() => adjustAll("height", -5)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -5
                </button>
                <button
                  onClick={() => adjustAll("height", -10)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -10
                </button>
                <button
                  onClick={() => adjustAll("height", -20)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-xs rounded hover:bg-gray-600"
                >
                  -20
                </button>
                <button
                  onClick={() => adjustAll("height", parseFloat(customSizeIncrement) || 0)}
                  className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded hover:bg-gray-800"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        {logos.map((tech, index) => {
          const isSelected = selectedLogos.has(tech.name);
          return (
            <div
              key={tech.name}
              className={`mb-4 pb-4 border-b border-gray-200 last:border-0 ${
                isSelected ? "bg-blue-50 p-3 rounded border-blue-300" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-gray-900 font-semibold">{tech.name}</div>
                {isSelected && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Selected</span>}
              </div>
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
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-600">Width (px)</label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{tech.width}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="1"
                    value={tech.width}
                    onChange={(e) => updateLogo(index, "width", parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-600">Height (px)</label>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{tech.height}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="1"
                    value={tech.height}
                    onChange={(e) => updateLogo(index, "height", parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={exportCoordinates}
          className="w-full bg-gray-900 text-white px-4 py-3 rounded mt-4 hover:bg-gray-800 text-sm"
        >
          📋 Copy Code to Clipboard
        </button>
      </div>

      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-nwse-resize hover:bg-gray-500"
        onMouseDown={handleResizeStart}
        style={{ cursor: "nwse-resize" }}
      />
    </div>
  );
}

export function TechDiagram() {
  const [logos, setLogos] = useState<TechLogo[]>(initialLogos);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({
    width: 700,
    height: 420,
  });
  const [logoElements, setLogoElements] = useState<Map<string, HTMLDivElement>>(new Map());
  const [devToolsVisible, setDevToolsVisible] = useState(process.env.NODE_ENV !== "production");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedLogos, setSelectedLogos] = useState<Set<TechLogoName>>(new Set());
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [draggingLogo, setDraggingLogo] = useState<{
    draggedLogo: TechLogoName;
    selectedLogos: Map<TechLogoName, { startPercentX: number; startPercentY: number }>;
    startX: number;
    startY: number;
  } | null>(null);
  const [resizingLogo, setResizingLogo] = useState<{
    name: TechLogoName;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  useEffect(() => {
    document.addEventListener("devModeChanged", (e) => {
      setDevToolsVisible((e as CustomEvent<boolean>).detail);
    });
  }, []);

  useEffect(() => {
    // Initialize container size once on mount
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const height = 420; // Static height
      setContainerSize({ width, height });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setCtrlPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Force rerender when logos positions change to update lines
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [logos]);

  // Calculate center point of a logo element in SVG viewBox coordinates
  const getLogoCenterPercent = (logo: TechLogo) => {
    const widthPercent = (logo.width / containerSize.width) * 100;
    const heightPercent = (logo.height / containerSize.height) * 100;
    const viewBoxHeight = (containerSize.height / containerSize.width) * 100;
    return {
      x: logo.x + widthPercent / 2,
      y: (logo.y + heightPercent / 2) * (viewBoxHeight / 100),
    };
  };

  // Generate lines based on attachedTo connections
  const generateLines = () => {
    const lines: React.ReactElement[] = [];
    const gradients: React.ReactElement[] = [];
    let lineKey = 0;

    const desiredStrokeWidthPx = 2;
    const strokeWidth = (desiredStrokeWidthPx / containerSize.width) * 100;

    logos.forEach((fromLogo) => {
      const fromCenter = getLogoCenterPercent(fromLogo);

      fromLogo.connectedTo.forEach((toName) => {
        const toLogo = logos.find((l) => l.name === toName);
        if (toLogo) {
          const toCenter = getLogoCenterPercent(toLogo);

          const gradientId = `gradient-${lineKey}`;

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
              strokeWidth={strokeWidth}
            />
          );
        }
      });
    });

    return { lines, gradients };
  };

  const { lines, gradients } = generateLines();

  const toggleSelection = (name: TechLogoName) => {
    setSelectedLogos((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleLogoMouseDown = (e: React.MouseEvent, logo: TechLogo) => {
    if (!ctrlPressed || !editorOpen) return;
    e.preventDefault();
    e.stopPropagation();

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    const logoRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const logoLeft = logoRect.left - containerRect.left;
    const logoTop = logoRect.top - containerRect.top;

    const edgeThreshold = 10;
    const isNearRightEdge = clickX > logoLeft + logoRect.width - edgeThreshold;
    const isNearBottomEdge = clickY > logoTop + logoRect.height - edgeThreshold;

    if (isNearRightEdge || isNearBottomEdge) {
      setResizingLogo({
        name: logo.name,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: logo.width,
        startHeight: logo.height,
      });
    } else {
      const shiftPressed = e.shiftKey;
      const logosToMove = shiftPressed || selectedLogos.size === 0 ? new Set([logo.name]) : selectedLogos;
      const initialPositions = new Map<TechLogoName, { startPercentX: number; startPercentY: number }>();

      logos.forEach((l) => {
        if (logosToMove.has(l.name)) {
          initialPositions.set(l.name, { startPercentX: l.x, startPercentY: l.y });
        }
      });

      setDraggingLogo({
        draggedLogo: logo.name,
        selectedLogos: initialPositions,
        startX: e.clientX,
        startY: e.clientY,
      });
    }
  };

  useEffect(() => {
    if (!draggingLogo && !resizingLogo) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingLogo) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const deltaX = e.clientX - draggingLogo.startX;
        const deltaY = e.clientY - draggingLogo.startY;

        const percentDeltaX = (deltaX / containerRect.width) * 100;
        const percentDeltaY = (deltaY / containerRect.height) * 100;

        setLogos((prev) =>
          prev.map((logo) => {
            const initialPos = draggingLogo.selectedLogos.get(logo.name);
            if (initialPos) {
              return {
                ...logo,
                x: Math.max(0, Math.min(100, initialPos.startPercentX + percentDeltaX)),
                y: Math.max(0, Math.min(100, initialPos.startPercentY + percentDeltaY)),
              };
            }
            return logo;
          })
        );
      } else if (resizingLogo) {
        const deltaX = e.clientX - resizingLogo.startX;
        const deltaY = e.clientY - resizingLogo.startY;

        setLogos((prev) =>
          prev.map((logo) =>
            logo.name === resizingLogo.name
              ? {
                  ...logo,
                  width: Math.max(10, resizingLogo.startWidth + deltaX),
                  height: Math.max(10, resizingLogo.startHeight + deltaY),
                }
              : logo
          )
        );
      }
    };

    const handleMouseUp = () => {
      setDraggingLogo(null);
      setResizingLogo(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingLogo, resizingLogo, containerSize]);

  return (
    <>
      {devToolsVisible && (
        <CoordinateEditor
          logos={logos}
          onUpdate={setLogos}
          selectedLogos={selectedLogos}
          onToggleSelection={toggleSelection}
          onOpenChange={setEditorOpen}
        />
      )}
      <div className="">
        <div ref={containerRef} className="relative h-[420px] p-4">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
            viewBox={`0 0 100 ${(containerSize.height / containerSize.width) * 100}`}
            preserveAspectRatio="none"
          >
            <defs>{gradients}</defs>
            {lines}
          </svg>

          {logos.map((tech) => {
            const isSelected = selectedLogos.has(tech.name);
            const isDragging = draggingLogo?.selectedLogos.has(tech.name) ?? false;
            const isResizing = resizingLogo?.name === tech.name;

            return (
              <div
                key={tech.name}
                ref={(el) => {
                  if (el) {
                    if (!logoElements.has(tech.name)) {
                      setLogoElements((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(tech.name, el);
                        return newMap;
                      });
                    } else {
                      const existing = logoElements.get(tech.name);
                      if (existing !== el) {
                        setLogoElements((prev) => {
                          const newMap = new Map(prev);
                          newMap.set(tech.name, el);
                          return newMap;
                        });
                      }
                    }
                  }
                }}
                onMouseDown={(e) => handleLogoMouseDown(e, tech)}
                onClick={(e) => {
                  if (!ctrlPressed && editorOpen) {
                    toggleSelection(tech.name);
                  }
                }}
                className={`absolute bg-white rounded-2xl shadow-sm border-2 ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-300 ring-offset-2" : "border-gray-200"
                } ${isDragging || isResizing ? "opacity-75" : ""} ${editorOpen ? "cursor-pointer" : ""}`}
                style={{
                  left: `${tech.x}%`,
                  top: `${tech.y}%`,
                  width: `${tech.width}px`,
                  height: `${tech.height}px`,
                  padding: `${tech.paddingY}px ${tech.paddingX}px`,
                  zIndex: isDragging || isResizing ? 10 : 1,
                }}
              >
                <img
                  src={tech.path}
                  alt={tech.name}
                  className="w-full h-full object-contain"
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
