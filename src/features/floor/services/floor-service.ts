import { db } from "@/lib/db";

type FloorTableInput = {
  tableId: string;
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
};

export async function listFloors(restaurantId: string, branchId?: string) {
  return db.floor.findMany({
    where: {
      restaurantId,
      ...(branchId ? { branchId } : {}),
    },
    include: {
      tables: {
        include: {
          table: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createFloor(input: {
  restaurantId: string;
  branchId: string;
  name: string;
  width?: number;
  height?: number;
}) {
  return db.floor.create({
    data: {
      restaurantId: input.restaurantId,
      branchId: input.branchId,
      name: input.name,
      width: input.width ?? 1200,
      height: input.height ?? 800,
    },
    include: {
      tables: { include: { table: true } },
    },
  });
}

export async function updateFloor(
  floorId: string,
  restaurantId: string,
  data: {
    name?: string;
    width?: number;
    height?: number;
    tables?: FloorTableInput[];
  }
) {
  const floor = await db.floor.findFirst({
    where: { id: floorId, restaurantId },
  });

  if (!floor) {
    throw new Error("Floor not found");
  }

  return db.$transaction(async (tx) => {
    await tx.floor.update({
      where: { id: floorId },
      data: {
        name: data.name,
        width: data.width,
        height: data.height,
      },
    });

    if (data.tables) {
      await tx.floorTable.deleteMany({ where: { floorId } });
      if (data.tables.length) {
        await tx.floorTable.createMany({
          data: data.tables.map((table) => ({
            floorId,
            tableId: table.tableId,
            shape: table.shape,
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            color: table.color,
          })),
        });
      }
    }

    return tx.floor.findUnique({
      where: { id: floorId },
      include: { tables: { include: { table: true } } },
    });
  });
}

export async function deleteFloor(floorId: string, restaurantId: string) {
  const floor = await db.floor.findFirst({
    where: { id: floorId, restaurantId },
  });

  if (!floor) {
    throw new Error("Floor not found");
  }

  await db.floor.delete({ where: { id: floorId } });
  return { success: true };
}
