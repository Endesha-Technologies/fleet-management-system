import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { TyreRotation, TyreRotationSchedule, RotationPattern } from "../entities/TyreRotation";
import { Truck } from "../entities/Truck";

const router = Router();
const rotationRepository = AppDataSource.getRepository(TyreRotation);
const scheduleRepository = AppDataSource.getRepository(TyreRotationSchedule);
const truckRepository = AppDataSource.getRepository(Truck);

// GET all rotation schedules for a truck
router.get("/schedules/:truckId", async (req: Request, res: Response) => {
  try {
    const { truckId } = req.params;
    const schedules = await scheduleRepository.find({
      where: { truckId, isActive: true },
    });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation schedules" });
  }
});

// GET all rotation schedules
router.get("/schedules", async (req: Request, res: Response) => {
  try {
    const { isActive = true, limit = 50, offset = 0 } = req.query;

    const query = scheduleRepository.createQueryBuilder("schedule");

    if (isActive !== "false") {
      query.where("schedule.isActive = true");
    }

    const schedules = await query
      .orderBy("schedule.nextDueDate", "ASC")
      .skip(Number(offset))
      .take(Number(limit))
      .getMany();

    const total = await query.getCount();

    res.json({ data: schedules, total });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation schedules" });
  }
});

// GET rotation schedule by ID
router.get("/schedules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedule = await scheduleRepository.findOne({ where: { id } });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation schedule" });
  }
});

// CREATE rotation schedule
router.post("/schedules", async (req: Request, res: Response) => {
  try {
    const {
      truckId,
      rotationPattern,
      nextDueDate,
      nextDueMileage,
      currentMileage,
      intervalDays,
      intervalMileage,
    } = req.body;

    // Validate truck exists
    const truck = await truckRepository.findOne({ where: { id: truckId } });
    if (!truck) {
      return res.status(404).json({ error: "Truck not found" });
    }

    const schedule = scheduleRepository.create({
      truckId,
      rotationPattern,
      nextDueDate: new Date(nextDueDate),
      nextDueMileage,
      currentMileage,
      intervalDays,
      intervalMileage,
      isActive: true,
    });

    const saved = await scheduleRepository.save(schedule);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to create rotation schedule" });
  }
});

// UPDATE rotation schedule
router.put("/schedules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Update fields
    if (updates.nextDueDate) {
      updates.nextDueDate = new Date(updates.nextDueDate);
    }

    Object.assign(schedule, updates);
    const saved = await scheduleRepository.save(schedule);

    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to update rotation schedule" });
  }
});

// GET all rotation records for a truck
router.get("/records/:truckId", async (req: Request, res: Response) => {
  try {
    const { truckId } = req.params;
    const records = await rotationRepository.find({
      where: { truckId },
      order: { rotationDate: "DESC" },
    });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation records" });
  }
});

// GET all rotation records
router.get("/records", async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const query = rotationRepository.createQueryBuilder("rotation");

    if (status) {
      query.where("rotation.status = :status", { status });
    }

    const records = await query
      .orderBy("rotation.rotationDate", "DESC")
      .skip(Number(offset))
      .take(Number(limit))
      .getMany();

    const total = await query.getCount();

    res.json({ data: records, total });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation records" });
  }
});

// GET rotation record by ID
router.get("/records/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await rotationRepository.findOne({ where: { id } });

    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation record" });
  }
});

// CREATE rotation record
router.post("/records", async (req: Request, res: Response) => {
  try {
    const {
      truckId,
      rotationDate,
      mileage,
      rotationPattern,
      performedBy,
      tyreMovements,
      notes,
      status = "completed",
    } = req.body;

    // Validate truck exists
    const truck = await truckRepository.findOne({ where: { id: truckId } });
    if (!truck) {
      return res.status(404).json({ error: "Truck not found" });
    }

    const rotation = rotationRepository.create({
      truckId,
      rotationDate: new Date(rotationDate),
      mileage,
      rotationPattern,
      performedBy,
      tyreMovements,
      notes,
      status,
    });

    // Update schedule if exists
    const schedule = await scheduleRepository.findOne({ where: { truckId } });
    if (schedule) {
      schedule.lastRotationDate = new Date(rotationDate);
      schedule.currentMileage = mileage;
      schedule.nextDueDate = new Date(
        Date.now() + schedule.intervalDays * 24 * 60 * 60 * 1000
      );
      schedule.nextDueMileage = mileage + schedule.intervalMileage;
      await scheduleRepository.save(schedule);
    }

    const saved = await rotationRepository.save(rotation);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to create rotation record" });
  }
});

// UPDATE rotation record
router.put("/records/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await rotationRepository.findOne({ where: { id } });
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    if (updates.rotationDate) {
      updates.rotationDate = new Date(updates.rotationDate);
    }

    Object.assign(record, updates);
    const saved = await rotationRepository.save(record);

    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: "Failed to update rotation record" });
  }
});

// DELETE rotation schedule
router.delete("/schedules/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schedule = await scheduleRepository.findOne({ where: { id } });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    schedule.isActive = false;
    await scheduleRepository.save(schedule);

    res.json({ message: "Schedule deactivated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete rotation schedule" });
  }
});

// GET rotation statistics for a truck
router.get("/stats/:truckId", async (req: Request, res: Response) => {
  try {
    const { truckId } = req.params;

    const totalRotations = await rotationRepository.count({
      where: { truckId },
    });

    const lastRotation = await rotationRepository.findOne({
      where: { truckId },
      order: { rotationDate: "DESC" },
    });

    const schedule = await scheduleRepository.findOne({
      where: { truckId, isActive: true },
    });

    const stats = {
      totalRotations,
      lastRotationDate: lastRotation?.rotationDate || null,
      nextScheduledDate: schedule?.nextDueDate || null,
      nextDueMileage: schedule?.nextDueMileage || null,
      currentMileage: schedule?.currentMileage || null,
      rotationPattern: schedule?.rotationPattern || null,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rotation statistics" });
  }
});

export default router;
