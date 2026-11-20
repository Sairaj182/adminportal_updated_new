import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const now = Date.now();
    const where = "FROM events WHERE type = 'general' AND openDate < ? AND closeDate > ?";
    const countRes = await query(`SELECT COUNT(*) AS count ${where}`, [now, now]);
    const total = Number(countRes[0].count);
    const results = await query(`
      SELECT id, title, venue, eventStartDate, eventEndDate, doclink, event_link, attachments
      ${where} ORDER BY updatedAt DESC, id DESC LIMIT ${limit} OFFSET ${offset}
    `, [now, now]);

    return NextResponse.json({
      page,
      limit,
      offset,
      total,
      totalPages: Math.ceil(total / limit),
      data: results
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
