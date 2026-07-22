import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patientSchema = z.object({
  dni: z.string().min(8).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  birthDate: z.string().transform((str) => new Date(str)),
  gender: z.string().min(1).max(20),
  phone: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.string().optional(),
  address: z.string().optional(),
  // Antecedentes Heredofamiliares
  familyHistoryDiabetes: z.boolean().optional(),
  familyHistoryHypertension: z.boolean().optional(),
  familyHistoryCancer: z.boolean().optional(),
  familyHistoryHeartDisease: z.boolean().optional(),
  familyHistoryKidneyDisease: z.boolean().optional(),
  familyHistoryOther: z.string().optional(),
  // Antecedentes Personales Patologicos
  personalAllergies: z.string().optional(),
  personalSurgeries: z.string().optional(),
  personalHospitalizations: z.string().optional(),
  personalTransfusions: z.string().optional(),
  personalTrauma: z.string().optional(),
  // Antecedentes No Patologicos
  smoking: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  bloodType: z.string().optional(),
  habits: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          consultations: {
            select: {
              id: true,
              type: true,
              status: true,
              createdAt: true,
              painScale: true,
              allergies: true,
              consultationReason: true,
              diseaseHistory: true,
              physicalExam: true,
              doctorComments: true,
              diagnoses: {
                select: { cie10Code: true, description: true, type: true },
              },
              vitals: true,
              prescriptions: {
                select: { medication: true, days: true, dosage: true, instructions: true },
              },
              alternativeTreatments: {
                select: { treatmentName: true, bodyZone: true, frequency: true, sessionsCount: true, packagePrice: true, sessionPrice: true },
              },
              recommendationsChecklist: true,
            },
            orderBy: { createdAt: "desc" },
          },
          treatmentPackages: {
            select: {
              id: true,
              treatmentName: true,
              bodyZone: true,
              totalSessions: true,
              status: true,
              createdAt: true,
              sessions: { select: { id: true, sessionNumber: true, sessionDate: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(patient);
    }

    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        consultations: {
          select: {
            id: true,
            type: true,
            status: true,
            createdAt: true,
            painScale: true,
            diagnoses: {
              select: { cie10Code: true, description: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        treatmentPackages: {
          select: {
            id: true,
            treatmentName: true,
            bodyZone: true,
            totalSessions: true,
            status: true,
            createdAt: true,
            sessions: { select: { id: true, sessionNumber: true, sessionDate: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Error fetching patients" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json(
      { error: "Error deleting patient" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = patientSchema.parse(body);

    const patient = await prisma.patient.create({
      data: validatedData,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating patient:", error);
    return NextResponse.json(
      { error: "Error creating patient" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const allowedFields = [
      "occupation", "maritalStatus", "address",
      "familyHistoryDiabetes", "familyHistoryHypertension",
      "familyHistoryCancer", "familyHistoryHeartDisease",
      "familyHistoryKidneyDisease", "familyHistoryOther",
      "personalAllergies", "personalSurgeries",
      "personalHospitalizations", "personalTransfusions",
      "personalTrauma", "smoking", "alcohol",
      "bloodType", "habits",
    ];

    const cleanedData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        const value = body[key];
        if (typeof value === "string" && value === "") {
          cleanedData[key] = null;
        } else {
          cleanedData[key] = value;
        }
      }
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: cleanedData,
    });

    return NextResponse.json(patient);
  } catch (error: unknown) {
    let message = "Error updating patient";
    if (error && typeof error === "object" && "message" in error) {
      message = String((error as { message: unknown }).message);
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
