import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const consultationSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(["NUEVA", "RECONSULTA", "TRATAMIENTO"]),
  status: z.enum(["EN_ESPERA", "EN_ATENCION", "FINALIZADO"]).optional(),
  hasAccidentsOps: z.boolean().optional(),
  consultationReason: z.string().optional(),
  diseaseHistory: z.string().optional(),
  allergies: z.string().optional(),
  physicalExam: z.string().optional(),
  labExamsRequested: z.string().optional(),
  treatmentDurationApprox: z.string().optional(),
  improvementEstimate: z.string().optional(),
  painScale: z.number().min(0).max(10).optional(),
  doctorComments: z.string().optional(),
  vitals: z
    .object({
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      respiratoryRate: z.number().optional(),
      oxygenSaturation: z.number().optional(),
      weightKg: z.number().optional(),
      heightCm: z.number().optional(),
      bmi: z.number().optional(),
      temperature: z.number().optional(),
    })
    .optional(),
  diagnoses: z
    .array(
      z.object({
        cie10Code: z.string(),
        description: z.string(),
        type: z.enum(["PRESUNTIVO", "DEFINITIVO"]),
      })
    )
    .optional(),
  alternativeTreatments: z
    .array(
      z.object({
        treatmentName: z.string(),
        bodyZone: z.string().optional(),
        frequency: z.string().optional(),
        sessionsCount: z.number().optional(),
        packagePrice: z.number().optional(),
        sessionPrice: z.number().optional(),
      })
    )
    .optional(),
  prescriptions: z
    .array(
      z.object({
        medication: z.string(),
        days: z.number().optional(),
        dosage: z.string().optional(),
        instructions: z.string().optional(),
      })
    )
    .optional(),
  recommendationsChecklist: z
    .object({
      noCitrus: z.boolean().optional(),
      noVitaminC: z.boolean().optional(),
      noPhysicalEffort: z.boolean().optional(),
      noAlcohol: z.boolean().optional(),
      noAvocado: z.boolean().optional(),
      noRedMeat: z.boolean().optional(),
      cryotherapy: z.boolean().optional(),
      thermotherapy: z.boolean().optional(),
      stretchingExercises: z.boolean().optional(),
      useFajaDorsoLumbar: z.boolean().optional(),
      useRodillera: z.boolean().optional(),
      useOrthopedicInsoles: z.boolean().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const consultations = await prisma.consultation.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
            birthDate: true,
          },
        },
        vitals: true,
        diagnoses: true,
        alternativeTreatments: true,
        prescriptions: true,
        recommendationsChecklist: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(consultations);
  } catch (error) {
    console.error("Error fetching consultations:", error);
    return NextResponse.json(
      { error: "Error fetching consultations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = consultationSchema.parse(body);

    const { vitals, diagnoses, alternativeTreatments, prescriptions, recommendationsChecklist, ...consultationData } = validatedData;

    const consultation = await prisma.consultation.create({
      data: {
        ...consultationData,
        vitals: vitals ? { create: vitals } : undefined,
        diagnoses: diagnoses
          ? { create: diagnoses }
          : undefined,
        alternativeTreatments: alternativeTreatments
          ? { create: alternativeTreatments }
          : undefined,
        prescriptions: prescriptions
          ? { create: prescriptions }
          : undefined,
        recommendationsChecklist: recommendationsChecklist
          ? { create: recommendationsChecklist }
          : undefined,
      },
      include: {
        patient: true,
        vitals: true,
        diagnoses: true,
        alternativeTreatments: true,
        prescriptions: true,
        recommendationsChecklist: true,
      },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating consultation:", error);
    return NextResponse.json(
      { error: "Error creating consultation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, vitals, diagnoses, alternativeTreatments, prescriptions, recommendationsChecklist, ...consultationData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    // Delete existing relations
    await prisma.$transaction([
      prisma.vitals.deleteMany({ where: { consultationId: id } }),
      prisma.diagnosis.deleteMany({ where: { consultationId: id } }),
      prisma.alternativeTreatment.deleteMany({ where: { consultationId: id } }),
      prisma.prescription.deleteMany({ where: { consultationId: id } }),
      prisma.recommendationsChecklist.deleteMany({ where: { consultationId: id } }),
    ]);

    // Update with new relations
    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        ...consultationData,
        vitals: vitals ? { create: vitals } : undefined,
        diagnoses: diagnoses ? { create: diagnoses } : undefined,
        alternativeTreatments: alternativeTreatments ? { create: alternativeTreatments } : undefined,
        prescriptions: prescriptions ? { create: prescriptions } : undefined,
        recommendationsChecklist: recommendationsChecklist ? { create: recommendationsChecklist } : undefined,
      },
      include: {
        patient: true,
        vitals: true,
        diagnoses: true,
        alternativeTreatments: true,
        prescriptions: true,
        recommendationsChecklist: true,
      },
    });

    return NextResponse.json(consultation);
  } catch (error) {
    console.error("Error updating consultation:", error);
    return NextResponse.json(
      { error: "Error updating consultation" },
      { status: 500 }
    );
  }
}
