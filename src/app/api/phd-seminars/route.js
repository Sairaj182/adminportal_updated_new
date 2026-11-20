import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20);
    const offset = (page - 1) * limit;

    if (idParam) {
      const rows = await query(
        `SELECT gl.*,
                supervisor.name AS supervisor_name,
                co_supervisor.name AS co_supervisor_name
         FROM phd_seminars gl
         LEFT JOIN user supervisor ON supervisor.email = gl.supervisor_email
         LEFT JOIN user co_supervisor ON co_supervisor.email = gl.co_supervisor_email
         WHERE gl.id = ? LIMIT 1`,
        [idParam]
      );
      if (rows.length > 0) {
        return NextResponse.json(rows[0]);
      }
      return NextResponse.json({ error: 'PhD seminar not found' }, { status: 404 });
    }

    const countRes = await query(`SELECT COUNT(*) as count FROM phd_seminars`);
    const total = Number(countRes[0].count);

    const results = await query(
      `SELECT gl.*,
              supervisor.name AS supervisor_name,
              co_supervisor.name AS co_supervisor_name
       FROM phd_seminars gl
       LEFT JOIN user supervisor ON supervisor.email = gl.supervisor_email
       LEFT JOIN user co_supervisor ON co_supervisor.email = gl.co_supervisor_email
       ORDER BY gl.timestamp DESC LIMIT ${limit} OFFSET ${offset}`
    );

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
