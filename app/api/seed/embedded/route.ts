import { NextResponse } from 'next/server';
import { ClientService } from '@/lib/services/client.service';
import clients from '@/data/seed_clients_embedded.json';

export async function GET() {
    try {
        // Bulk delete + re-insert
        await ClientService.deleteMany({});
        
        // Mongoose insertMany is much faster than individual creates
        const result = await ClientService.insertMany(clients as any);

        return NextResponse.json({
            message: 'Embedded seed data loaded successfully.',
            count: result.length,
        });
    } catch (error: any) {
        console.error('[GET /api/seed/embedded] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
