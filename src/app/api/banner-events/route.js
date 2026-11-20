import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { query } from "@/lib/db";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(params.get("page")) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(params.get("limit")) || 20));
  const [rows, counts] = await Promise.all([
    query(
      "SELECT id, title, banner_image, attachments FROM banner_events ORDER BY id DESC LIMIT " +
        limit +
        " OFFSET " +
        (page - 1) * limit
    ),
    query("SELECT COUNT(*) AS total FROM banner_events"),
  ]);
  const data = rows.map((row) => {
    try {
      const attachments =
        typeof row.attachments === "string"
          ? JSON.parse(row.attachments)
          : row.attachments;
      return {
        ...row,
        attachments: Array.isArray(attachments) ? attachments : [],
      };
    } catch {
      return { ...row, attachments: [] };
    }
  });
  const total = Number(counts[0].total);
  return NextResponse.json({
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

function validUrl(value) {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

async function manage(request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPER_ADMIN")
    return NextResponse.json(
      { message: "Administrator access required" },
      { status: 403 }
    );
  const body = await request.json();
  if (request.method !== "POST" && !Number.isSafeInteger(body.id))
    return NextResponse.json({ message: "Invalid event ID" }, { status: 400 });
  if (request.method === "DELETE") {
    await query("DELETE FROM banner_events WHERE id = ?", [body.id]);
  } else {
    const title = typeof body.title === "string" && body.title.trim();
    if (
      !title ||
      title.length > 1000 ||
      !validUrl(body.banner_image) ||
      !Array.isArray(body.attachments) ||
      body.attachments.some(
        (item) => !validUrl(item?.url) || typeof item.caption !== "string"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Enter a title, upload a banner, and check the attachment links.",
        },
        { status: 400 }
      );
    }
    const values = [
      title,
      body.banner_image,
      JSON.stringify(
        body.attachments.map(({ caption, url }) => ({ caption, url }))
      ),
    ];
    if (request.method === "POST")
      await query(
        "INSERT INTO banner_events (title, banner_image, attachments) VALUES (?, ?, ?)",
        values
      );
    else
      await query(
        "UPDATE banner_events SET title = ?, banner_image = ?, attachments = ? WHERE id = ?",
        [...values, body.id]
      );
  }
  return NextResponse.json({ success: true });
}

export { manage as POST, manage as PUT, manage as DELETE };
