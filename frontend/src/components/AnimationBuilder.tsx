"use client";
import { useState } from "react";
import {
  requestAnimationFromPlan,
  AnimationPlan,
  AnimationOperation,
} from "@/lib/agent";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "./ui/button";

type DataStructureType = "bst" | "stack";

const DATA_STRUCTURES: Record<
  DataStructureType,
  {
    label: string;
    operations: {
      name: string;
      label: string;
      takesValue: boolean;
    }[];
  }
> = {
  bst: {
    label: "BST",
    operations: [
      { name: "insert", label: "Insert", takesValue: true },
      { name: "delete", label: "Delete", takesValue: true },
    ],
  },
  stack: {
    label: "Stack",
    operations: [
      { name: "push", label: "Push", takesValue: true },
      { name: "pop", label: "Pop", takesValue: false },
      { name: "peek", label: "Peek", takesValue: false },
    ],
  },
};

type AnimationBuilderProps = {
  onAnimationGenerated: (
    url: string | null,
    phase?: "start" | "done" | "error"
  ) => void;
  userId: string;
  animationSpeed?: number;
};

export default function AnimationBuilder({
  onAnimationGenerated,
  userId,
  animationSpeed: initialSpeed = 1.0,
}: AnimationBuilderProps) {
  const [dataStructure, setDataStructure] = useState<DataStructureType>("bst");
  const [initialState, setInitialState] = useState<string>("");
  const [operations, setOperations] = useState<
    (AnimationOperation & { id: string })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animSpeed, setAnimSpeed] = useState(initialSpeed);

  const addOperation = (opName: string) => {
    const opDef = DATA_STRUCTURES[dataStructure].operations.find(
      (op) => op.name === opName
    );
    if (!opDef) return;

    const newOp: AnimationOperation & { id: string } = {
      id: `${Date.now()}-${Math.random()}`,
      name: opName,
      args: opDef.takesValue ? [0] : [],
    };
    setOperations([...operations, newOp]);
  };

  const removeOperation = (id: string) => {
    setOperations(operations.filter((op) => op.id !== id));
  };

  const updateOperationArg = (id: string, value: string) => {
    setOperations(
      operations.map((op) => {
        if (op.id === id) {
          if (value === "") {
            return { ...op, args: [""] };
          }
          const parsed = parseFloat(value);
          return { ...op, args: [isNaN(parsed) ? 0 : parsed] };
        }
        return op;
      })
    );
  };

  const handleOperationArgBlur = (id: string) => {
    setOperations(
      operations.map((op) => {
        if (op.id === id && op.args[0] === "") {
          return { ...op, args: [0] };
        }
        return op;
      })
    );
  };

  const moveOp = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === operations.length - 1)
    )
      return;
    const newOps = [...operations];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    [newOps[index], newOps[swapIdx]] = [newOps[swapIdx], newOps[index]];
    setOperations(newOps);
  };

  const parseInitialState = (): any[] => {
    if (!initialState.trim()) return [];
    return initialState
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const parsed = parseFloat(s);
        return isNaN(parsed) ? s : parsed;
      });
  };

  const generateAnimation = async () => {
    setLoading(true);
    setError(null);
    onAnimationGenerated(null, "start");

    const plan: AnimationPlan = {
      data_structure: dataStructure,
      initial_state: parseInitialState(),
      operations: operations.map(({ id, ...op }) => op),
    };

    try {
      const result = await requestAnimationFromPlan(plan, animSpeed, userId);
      if (result.error) {
        setError(result.error);
        onAnimationGenerated(null, "error");
      } else {
        onAnimationGenerated(result.url, "done");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to generate animation";
      setError(errorMsg);
      onAnimationGenerated(null, "error");
    } finally {
      setLoading(false);
    }
  };

  const currentDsOps = DATA_STRUCTURES[dataStructure].operations;

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex flex-1 flex-col gap-3 min-h-0">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 whitespace-nowrap">
            Speed: {animSpeed.toFixed(1)}x
          </label>
          <Input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={animSpeed}
            onChange={(e: any) => setAnimSpeed(parseFloat(e.target.value))}
            className="flex-1 h-1.5 px-0 bg-slate-700 rounded-lg cursor-pointer accent-[var(--gr-2)]"
            disabled={loading}
          />
          <div className="flex gap-1 text-[10px] text-slate-500">
            <span>Slow</span>
            <span className="mx-1">|</span>
            <span>Fast</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={dataStructure}
            onValueChange={(value: DataStructureType) => {
              setDataStructure(value);
              setOperations([]);
            }}
          >
            <SelectTrigger
              className="flex-1 rounded-lg border border-[var(--gr-2)] bg-[var(--dbl-4)] p-2.5 text-sm text-[var(--gr-2)] outline-none transition
               focus:scale-[1.02] focus:border-[var(--gr-2)]
               focus:shadow-[0_0_8px_rgba(125,255,125,0.6),0_0_16px_rgba(125,255,125,0.3)]
               focus:bg-[var(--dbl-3)]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATA_STRUCTURES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            placeholder="Initial State: 5, 3, 7"
            value={initialState}
            onChange={(e: any) => setInitialState(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--gr-2)] bg-[var(--dbl-4)] p-2.5 text-sm text-[var(--gr-2)] outline-none transition
                     focus:scale-[1.02] focus:border-[var(--gr-2)]
                     focus:shadow-[0_0_8px_rgba(125,255,125,0.6),0_0_16px_rgba(125,255,125,0.3)]
                     focus:bg-[var(--dbl-3)]"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {currentDsOps.map((op) => (
            <Button
              key={op.name}
              onClick={() => addOperation(op.name)}
              className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-500"
              variant={undefined}
              size={undefined}
            >
              + {op.label}
            </Button>
          ))}
        </div>
        <div className="rounded-lg bg-[var(--dbl-3)] p-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">
              Operations Queue ({operations.length})
            </span>
            <div className="flex items-center gap-2">
              {operations.length > 0 && (
                <Button
                  onClick={() => setOperations([])}
                  className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                  variant={undefined}
                  size={undefined}
                >
                  Clear
                </Button>
              )}
              <Button
                onClick={generateAnimation}
                disabled={
                  loading || (operations.length === 0 && !initialState.trim())
                }
                className="rounded bg-[var(--gr-2)] px-3 py-1 text-xs font-medium text-black hover:bg-[var(--gr-1)] disabled:opacity-60 disabled:cursor-not-allowed"
                variant={undefined}
                size={undefined}
              >
                {loading ? "Generating…" : "Generate"}
              </Button>
            </div>
          </div>
          {operations.length === 0 ? (
            <div className="py-2 text-center text-xs text-gray-500">
              Add operations above
            </div>
          ) : (
            <div className="max-h-[120px] overflow-y-auto space-y-1 custom-scroll">
              {operations.map((op, index) => {
                const opDef = currentDsOps.find((o) => o.name === op.name);
                return (
                  <div
                    key={op.id}
                    className="flex items-center gap-2 rounded bg-[var(--dbl-2)] p-1.5 text-sm"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveOp(index, "up")}
                        disabled={index === 0}
                        className="text-[8px] leading-none text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveOp(index, "down")}
                        disabled={index === operations.length - 1}
                        className="text-[8px] leading-none text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        ▼
                      </button>
                    </div>
                    <span className="w-5 text-xs text-gray-500">
                      {index + 1}.
                    </span>
                    <span className="flex-1 text-xs text-[var(--gr-2)]">
                      {opDef?.label}
                    </span>
                    {opDef?.takesValue && (
                      <Input
                        type="number"
                        value={op.args[0] === "" ? "" : op.args[0] || 0}
                        onChange={(e: any) =>
                          updateOperationArg(op.id, e.target.value)
                        }
                        onBlur={() => handleOperationArgBlur(op.id)}
                        className="w-16 h-7 rounded border border-[var(--gr-2)] bg-[var(--dbl-4)] px-2 py-1 text-xs text-[var(--gr-2)] outline-none transition
                                 focus:border-[var(--gr-2)] focus:bg-[var(--dbl-3)]"
                      />
                    )}
                    <button
                      onClick={() => removeOperation(op.id)}
                      className="text-sm text-red-500 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-2 rounded-lg bg-red-900/20 border border-red-500/50 p-2 text-xs text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
