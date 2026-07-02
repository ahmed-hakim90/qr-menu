"use client";

import { useCallback, useMemo, useState } from "react";
import { useDeferredEffect } from "@/hooks/use-deferred-effect";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { apiRequest } from "@/lib/dashboard-api";

type BranchOption = { id: string; nameEn: string; nameAr: string };
type TableOption = { id: string; branchId: string; name: string; number: number; seats: number | null };
type FloorTableLayout = {
  id?: string;
  tableId: string;
  shape: "circle" | "rectangle" | "square";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  table?: TableOption;
};

type Floor = {
  id: string;
  name: string;
  width: number;
  height: number;
  branchId: string;
  tables: FloorTableLayout[];
};

interface FloorDesignerProps {
  branches: BranchOption[];
  tables: TableOption[];
  initialFloors: Floor[];
}

export function FloorDesigner({ branches, tables, initialFloors }: FloorDesignerProps) {
  const [floors, setFloors] = useState(initialFloors);
  const [selectedFloorId, setSelectedFloorId] = useState(initialFloors[0]?.id ?? "");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const selectedFloor = useMemo(
    () => floors.find((floor) => floor.id === selectedFloorId) ?? floors[0],
    [floors, selectedFloorId]
  );

  const branchTables = useMemo(
    () => tables.filter((table) => table.branchId === branchId),
    [tables, branchId]
  );

  const refresh = useCallback(async () => {
    const data = await apiRequest<Floor[]>(`/api/floors?branchId=${branchId}`);
    setFloors(data);
    if (!selectedFloorId && data[0]) setSelectedFloorId(data[0].id);
  }, [branchId, selectedFloorId]);

  useDeferredEffect(() => {
    refresh().catch((error) => toast.error(error.message));
  }, [refresh]);

  const createFloor = async () => {
    const floor = await apiRequest<Floor>("/api/floors", {
      method: "POST",
      body: JSON.stringify({ branchId, name: `Floor ${floors.length + 1}` }),
    });
    setFloors((current) => [...current, floor]);
    setSelectedFloorId(floor.id);
  };

  const saveLayout = async () => {
    if (!selectedFloor) return;

    const seatUpdates = selectedFloor.tables
      .filter((table) => table.table?.seats != null)
      .map((table) =>
        apiRequest(`/api/tables/${table.tableId}`, {
          method: "PATCH",
          body: JSON.stringify({ seats: table.table?.seats }),
        })
      );

    await Promise.all([
      apiRequest(`/api/floors/${selectedFloor.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: selectedFloor.name,
          width: selectedFloor.width,
          height: selectedFloor.height,
          tables: selectedFloor.tables.map((table) => ({
            tableId: table.tableId,
            shape: table.shape,
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            color: table.color,
          })),
        }),
      }),
      ...seatUpdates,
    ]);

    toast.success("Floor layout saved");
  };

  const addTableToFloor = (tableId: string) => {
    if (!selectedFloor) return;
    if (selectedFloor.tables.some((entry) => entry.tableId === tableId)) return;

    const table = branchTables.find((entry) => entry.id === tableId);
    if (!table) return;

    setFloors((current) =>
      current.map((floor) =>
        floor.id === selectedFloor.id
          ? {
              ...floor,
              tables: [
                ...floor.tables,
                {
                  tableId,
                  shape: "rectangle",
                  x: 80 + floor.tables.length * 20,
                  y: 80 + floor.tables.length * 20,
                  width: 120,
                  height: 80,
                  rotation: 0,
                  color: "#2563eb",
                  table,
                },
              ],
            }
          : floor
      )
    );
  };

  const updateSelectedFloor = (updater: (floor: Floor) => Floor) => {
    if (!selectedFloor) return;
    setFloors((current) =>
      current.map((floor) => (floor.id === selectedFloor.id ? updater(floor) : floor))
    );
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId || !selectedFloor) return;
    const rect = event.currentTarget.getBoundingClientRect();
    updateSelectedFloor((floor) => ({
      ...floor,
      tables: floor.tables.map((table) =>
        table.tableId === draggingId
          ? {
              ...table,
              x: Math.max(0, event.clientX - rect.left - offset.x),
              y: Math.max(0, event.clientY - rect.top - offset.y),
            }
          : table
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select value={branchId} onChange={(event) => setBranchId(event.target.value)}>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.nameEn}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Floor</Label>
          <Select
            value={selectedFloor?.id ?? ""}
            onChange={(event) => setSelectedFloorId(event.target.value)}
          >
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </Select>
        </div>
        {selectedFloor && (
          <div className="space-y-2 grow">
            <Label>Floor name</Label>
            <Input
              value={selectedFloor.name}
              onChange={(event) =>
                updateSelectedFloor((floor) => ({ ...floor, name: event.target.value }))
              }
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={createFloor}>
            <Plus className="h-4 w-4" />
            New Floor
          </Button>
          <Button onClick={saveLayout}>
            <Save className="h-4 w-4" />
            Save Layout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">Tables</h3>
            {branchTables.map((table) => (
              <div key={table.id} className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{table.name}</p>
                  <p className="text-xs text-muted-foreground">#{table.number}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => addTableToFloor(table.id)}>
                  Add
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 overflow-auto">
            {selectedFloor ? (
              <div
                className="relative rounded-3xl border border-dashed border-border bg-muted/30"
                style={{ width: selectedFloor.width, height: selectedFloor.height, minWidth: 800 }}
                onMouseMove={onMouseMove}
                onMouseUp={() => setDraggingId(null)}
                onMouseLeave={() => setDraggingId(null)}
              >
                {selectedFloor.tables.map((table) => (
                  <div
                    key={table.tableId}
                    className="absolute flex cursor-move items-center justify-center border-2 text-xs font-semibold text-white shadow-lg"
                    style={{
                      left: table.x,
                      top: table.y,
                      width: table.width,
                      height: table.height,
                      transform: `rotate(${table.rotation}deg)`,
                      backgroundColor: table.color,
                      borderRadius: table.shape === "circle" ? "9999px" : "16px",
                    }}
                    onMouseDown={(event) => {
                      setDraggingId(table.tableId);
                      setOffset({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                      });
                    }}
                  >
                    {table.table?.name ?? `Table ${table.tableId.slice(0, 4)}`}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Create a floor to start designing.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedFloor && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {selectedFloor.tables.map((table) => (
            <Card key={table.tableId}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{table.table?.name}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.filter((entry) => entry.tableId !== table.tableId),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={table.width}
                    onChange={(event) =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.map((entry) =>
                          entry.tableId === table.tableId
                            ? { ...entry, width: Number(event.target.value) }
                            : entry
                        ),
                      }))
                    }
                  />
                  <Input
                    type="number"
                    value={table.height}
                    onChange={(event) =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.map((entry) =>
                          entry.tableId === table.tableId
                            ? { ...entry, height: Number(event.target.value) }
                            : entry
                        ),
                      }))
                    }
                  />
                  <Input
                    type="number"
                    value={table.rotation}
                    onChange={(event) =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.map((entry) =>
                          entry.tableId === table.tableId
                            ? { ...entry, rotation: Number(event.target.value) }
                            : entry
                        ),
                      }))
                    }
                  />
                  <Select
                    value={table.shape}
                    onChange={(event) =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.map((entry) =>
                          entry.tableId === table.tableId
                            ? {
                                ...entry,
                                shape: event.target.value as FloorTableLayout["shape"],
                              }
                            : entry
                        ),
                      }))
                    }
                  >
                    <option value="rectangle">Rectangle</option>
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                  </Select>
                  <Input
                    type="color"
                    value={table.color}
                    onChange={(event) =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.map((entry) =>
                          entry.tableId === table.tableId
                            ? { ...entry, color: event.target.value }
                            : entry
                        ),
                      }))
                    }
                  />
                  <Input
                    type="number"
                    value={table.table?.seats ?? ""}
                    placeholder="Seats"
                    onChange={(event) =>
                      updateSelectedFloor((floor) => ({
                        ...floor,
                        tables: floor.tables.map((entry) =>
                          entry.tableId === table.tableId && entry.table
                            ? { ...entry, table: { ...entry.table, seats: Number(event.target.value) } }
                            : entry
                        ),
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
