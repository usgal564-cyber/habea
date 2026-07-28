import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";
import ExcelJS from "exceljs";

function verifyAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

export async function GET(request: NextRequest) {
  const admin = verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: "Нэвтрээгүй байна" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const format = searchParams.get("format") || "excel"; // excel or csv

    if (!examId) {
      return NextResponse.json({ error: "Exam ID шаардлагатай" }, { status: 400 });
    }

    const exam = await db.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: "Шалгалт олдсонгүй" }, { status: 404 });
    }

    const attempts = await db.examAttempt.findMany({
      where: { examId },
      orderBy: { createdAt: "desc" },
    });

    if (attempts.length === 0) {
      return NextResponse.json({ error: "Үр дүн байхгүй" }, { status: 404 });
    }

    if (format === "csv") {
      const headers = ["№", "Овог Нэр", "Оноо", "Нийт", "Үр дүн", "Огноо"];
      const rows = attempts.map((a, i) => [
        String(i + 1),
        a.userName,
        String(a.score),
        String(a.total),
        a.passed ? "Тэнсэв" : "Амжилтгүй",
        new Date(a.createdAt).toLocaleString("mn-MN"),
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exam.title}-results.csv"`,
        },
      });
    }

    // Excel format
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${exam.title} - Үр дүн`);

    // Style definitions
    const headerFill = {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "FF1A6B28" },
    };
    const headerFont = { color: { argb: "FFFFFFFF" }, bold: true, size: 12 };
    const borderStyle = {
      top: { style: "thin" as const },
      left: { style: "thin" as const },
      bottom: { style: "thin" as const },
      right: { style: "thin" as const },
    };

    // Title row
    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `Шалгалт: ${exam.title}`;
    titleCell.font = { bold: true, size: 14, color: { argb: "FF124D1C" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 30;

    // Subtitle row
    worksheet.mergeCells("A2:F2");
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = `Код: ${exam.code} | Оролтогч: ${attempts.length} | Огноо: ${new Date().toLocaleDateString("mn-MN")}`;
    subtitleCell.font = { size: 10, color: { argb: "FF666666" } };
    subtitleCell.alignment = { horizontal: "center" };

    // Empty row
    worksheet.addRow([]);

    // Headers
    const headerRow = worksheet.addRow(["№", "Овог Нэр", "Оноо", "Нийт", "Үр дүн", "Огноо"]);
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = borderStyle;
    });
    headerRow.height = 25;

    // Data rows
    attempts.forEach((attempt, index) => {
      const row = worksheet.addRow([
        index + 1,
        attempt.userName,
        attempt.score,
        attempt.total,
        attempt.passed ? "Тэнсэв" : "Амжилтгүй",
        new Date(attempt.createdAt).toLocaleString("mn-MN"),
      ]);
      row.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        // Color-code pass/fail
        if (colNumber === 5) {
          if (attempt.passed) {
            cell.font = { color: { argb: "FF16A34A" }, bold: true };
          } else {
            cell.font = { color: { argb: "FFDC2626" }, bold: true };
          }
        }
      });
    });

    // Summary row
    worksheet.addRow([]);
    const passed = attempts.filter((a) => a.passed).length;
    const failed = attempts.length - passed;
    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) /
              attempts.length
          )
        : 0;

    const summaryRow = worksheet.addRow([
      "",
      "Нийт дүн",
      "",
      "",
      `Тэнсэв: ${passed} | Амжилтгүй: ${failed}`,
      `Дундаж: ${avgScore}%`,
    ]);
    summaryRow.eachCell((cell) => {
      cell.font = { bold: true, size: 11 };
      cell.fill = {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FFE8F5E9" },
      };
      cell.border = borderStyle;
    });

    // Column widths
    worksheet.columns = [
      { width: 5 },   // №
      { width: 25 },  // Name
      { width: 10 },  // Score
      { width: 10 },  // Total
      { width: 15 },  // Result
      { width: 25 },  // Date
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${exam.title}-results.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Экспорт хийхэд алдаа гарлаа" }, { status: 500 });
  }
}
